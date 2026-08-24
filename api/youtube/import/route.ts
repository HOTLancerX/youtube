import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/post";
import PostInfo from "@/models/post_info";
import Cat from "@/models/cat";
import { getAuthSession } from "@/lib/session";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function normalizeText(text: string): string {
    return text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .trim();
}

function slugify(text: string): string {
    return normalizeText(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/**
 * Slug generation: Uses the exact YouTube Video ID as the slug.
 */
async function generateUniqueSlug(videoId: string, fallbackTitle: string = ""): Promise<string> {
    let base = (videoId || "").trim();
    if (!base) {
        base = slugify(fallbackTitle) || `post-${Date.now().toString(36)}`;
    }

    let candidate = base;
    let counter = 1;

    while (true) {
        const existing = await Post.findOne({ slug: candidate }).lean();
        if (!existing) {
            return candidate;
        }
        candidate = `${base}-${counter}`;
        counter++;
    }
}

/**
 * Formats multi-line plain text description into line-by-line HTML paragraphs for the text editor
 */
function formatDescriptionToHtml(desc: string): string {
    if (!desc) return "";
    // If it already contains HTML tags, return as is
    if (/<[a-z][\s\S]*>/i.test(desc)) {
        return desc;
    }

    const lines = desc.split(/\r?\n/);
    return lines
        .map((line) => line.trim())
        .map((line) => (line ? `<p>${line}</p>` : "<p><br/></p>"))
        .join("\n");
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Get current logged-in user session
        const session = await getAuthSession(req);
        const effectiveUserId = session?._id || body.userId || "";

        const {
            items,
            category,
            postType = "blog",
            status = "published",
        } = body;

        const videoList = Array.isArray(items) ? items : [body];

        if (videoList.length === 0) {
            return NextResponse.json({ error: "No video items provided for import" }, { status: 400 });
        }

        // Validate or resolve category if provided
        let categoryId: mongoose.Types.ObjectId | null = null;
        if (category) {
            if (mongoose.Types.ObjectId.isValid(category)) {
                categoryId = new mongoose.Types.ObjectId(category);
            } else {
                const catDoc = await Cat.findOne({
                    $or: [
                        { slug: slugify(category) },
                        { title: { $regex: new RegExp(`^${category}$`, "i") } },
                    ],
                }).lean();
                if (catDoc) {
                    categoryId = catDoc._id as mongoose.Types.ObjectId;
                }
            }
        }

        const createdPosts: any[] = [];
        const errors: any[] = [];

        for (const item of videoList) {
            try {
                const videoId = (item.videoId || item.id || "").trim();
                const title = (item.title || `Video ${videoId}`).trim();
                const rawDescription = item.description || "";
                const formattedDescription = formatDescriptionToHtml(rawDescription);
                const thumbnailUrl = item.thumbnailUrl || item.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "");

                // Check if post with this YouTube ID already exists
                if (videoId) {
                    const existingInfo = await PostInfo.findOne({
                        $or: [
                            { name: "youtube", value: videoId },
                            { name: "youtubeId", value: videoId },
                        ],
                    }).lean();
                    if (existingInfo) {
                        const existingPost = await Post.findById(existingInfo.postId).lean();
                        if (existingPost) {
                            errors.push({
                                videoId,
                                title,
                                error: `Already imported as post "${existingPost.title}"`,
                                existingId: existingPost._id,
                            });
                            continue;
                        }
                    }
                }

                // Generate slug using the YouTube Video ID directly
                const slug = await generateUniqueSlug(videoId, title);

                // Create Post in POST table with type="blog", slug=videoId, and current userId
                const newPost = await Post.create({
                    title,
                    slug,
                    type: postType || "blog",
                    category: categoryId,
                    status: status || "published",
                    userId: effectiveUserId,
                });

                // Prepare PostInfo rows (saving formatted line-by-line description, images JSON, and clean youtube video ID)
                const imagesJson = thumbnailUrl ? JSON.stringify([thumbnailUrl]) : "[]";

                const infoEntries: { postId: any; name: string; value: string }[] = [
                    { postId: newPost._id, name: "description", value: formattedDescription },
                    { postId: newPost._id, name: "images", value: imagesJson },
                    { postId: newPost._id, name: "youtube", value: videoId },
                ];

                if (categoryId) {
                    infoEntries.push({ postId: newPost._id, name: "category", value: categoryId.toString() });
                }
                if (effectiveUserId) {
                    infoEntries.push({ postId: newPost._id, name: "userId", value: effectiveUserId });
                }

                for (const infoItem of infoEntries) {
                    await PostInfo.findOneAndUpdate(
                        { postId: newPost._id, name: infoItem.name },
                        { value: infoItem.value },
                        { upsert: true }
                    );
                }

                createdPosts.push({
                    _id: newPost._id,
                    title: newPost.title,
                    slug: newPost.slug,
                    videoId,
                    thumbnailUrl,
                });
            } catch (postErr: any) {
                console.error("Error creating post for item:", item, postErr);
                errors.push({
                    videoId: item.videoId || item.id,
                    title: item.title,
                    error: postErr.message || "Failed to create post",
                });
            }
        }

        return NextResponse.json({
            success: true,
            importedCount: createdPosts.length,
            posts: createdPosts,
            errors,
            message: `Successfully imported ${createdPosts.length} video post(s) into POST table (type=blog)${errors.length > 0 ? ` (${errors.length} skipped)` : ""}`,
        });
    } catch (err: any) {
        console.error("YouTube import error:", err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}
