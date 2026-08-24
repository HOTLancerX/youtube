import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PostInfo from "@/models/post_info";
import Post from "@/models/post";
import {
    fetchSingleVideo,
    searchVideosByKeyword,
    fetchChannelVideos,
} from "@/plugin/youtube/lib/youtubeService";

export const dynamic = "force-dynamic";

async function attachExistingPostStatus(videos: any[]): Promise<any[]> {
    if (!videos || videos.length === 0) return [];
    try {
        await connectDB();
        const videoIds = videos.map((v) => v.videoId).filter(Boolean);
        const existingInfos = await PostInfo.find({
            name: { $in: ["youtube", "youtubeId"] },
            value: { $in: videoIds },
        }).lean();

        if (existingInfos.length === 0) {
            return videos.map((v) => ({ ...v, alreadyImported: false }));
        }

        const postIds = existingInfos.map((i) => i.postId);
        const existingPosts = await Post.find({ _id: { $in: postIds } }).lean();
        const postMap = new Map<string, any>();
        existingPosts.forEach((p) => postMap.set(p._id.toString(), p));

        const infoMap = new Map<string, any>();
        existingInfos.forEach((info) => {
            const post = postMap.get(info.postId.toString());
            if (post) {
                infoMap.set(info.value, {
                    _id: post._id,
                    title: post.title,
                    slug: post.slug,
                });
            }
        });

        return videos.map((v) => {
            const existing = infoMap.get(v.videoId);
            return {
                ...v,
                alreadyImported: Boolean(existing),
                existingPost: existing || null,
            };
        });
    } catch {
        return videos;
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "single";
        const query = searchParams.get("query") || searchParams.get("q") || searchParams.get("id") || "";
        const maxResults = parseInt(searchParams.get("maxResults") || "25", 10);
        const pageToken = searchParams.get("pageToken") || undefined;
        const apiKey = searchParams.get("apiKey")?.trim() || undefined;

        if (!query.trim()) {
            return NextResponse.json({ error: "Missing query or ID parameter" }, { status: 400 });
        }

        if (type === "single") {
            const result = await fetchSingleVideo(query, apiKey);
            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            const [annotated] = await attachExistingPostStatus([result.video]);
            return NextResponse.json({ success: true, video: annotated });
        }

        if (type === "search") {
            const result = await searchVideosByKeyword(query, maxResults, pageToken, apiKey);
            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            const annotatedVideos = await attachExistingPostStatus(result.videos || []);
            return NextResponse.json({
                success: true,
                videos: annotatedVideos,
                nextPageToken: result.nextPageToken,
                totalResults: result.totalResults,
            });
        }

        if (type === "channel") {
            const result = await fetchChannelVideos(query, maxResults, pageToken, apiKey);
            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            const annotatedVideos = await attachExistingPostStatus(result.videos || []);
            return NextResponse.json({
                success: true,
                videos: annotatedVideos,
                channelInfo: result.channelInfo,
                nextPageToken: result.nextPageToken,
            });
        }

        return NextResponse.json({ error: `Unsupported fetch type: ${type}` }, { status: 400 });
    } catch (err: any) {
        console.error("YouTube fetch route error:", err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type = "single", query = "", maxResults = 25, pageToken, apiKey } = body;
        const selectedKey = apiKey?.trim() || undefined;

        if (!query.trim()) {
            return NextResponse.json({ error: "Missing query or ID parameter" }, { status: 400 });
        }

        if (type === "single") {
            const result = await fetchSingleVideo(query, selectedKey);
            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            const [annotated] = await attachExistingPostStatus([result.video]);
            return NextResponse.json({ success: true, video: annotated });
        }

        if (type === "search") {
            const result = await searchVideosByKeyword(query, maxResults, pageToken, selectedKey);
            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            const annotatedVideos = await attachExistingPostStatus(result.videos || []);
            return NextResponse.json({
                success: true,
                videos: annotatedVideos,
                nextPageToken: result.nextPageToken,
                totalResults: result.totalResults,
            });
        }

        if (type === "channel") {
            const result = await fetchChannelVideos(query, maxResults, pageToken, selectedKey);
            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 400 });
            }
            const annotatedVideos = await attachExistingPostStatus(result.videos || []);
            return NextResponse.json({
                success: true,
                videos: annotatedVideos,
                channelInfo: result.channelInfo,
                nextPageToken: result.nextPageToken,
            });
        }

        return NextResponse.json({ error: `Unsupported fetch type: ${type}` }, { status: 400 });
    } catch (err: any) {
        console.error("YouTube fetch route POST error:", err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}
