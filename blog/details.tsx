"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Share from "@/components/Share";
import Ads from "@/components/Ads";

interface YoutubeBlogDetailsProps {
    data: {
        _id: string;
        title: string;
        slug: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        userId?: string;
        info: Record<string, string>;
    };
    pageData?: {
        categoryAncestors?: { _id: string; title: string; slug: string }[];
        author?: { _id?: string; name?: string; image?: string; slug?: string; type?: string } | null;
    };
    permalinkMap?: Record<string, string>;
}

function extractVideoId(input?: string): string {
    if (!input) return "";
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }
    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) return watchMatch[1];
    return "";
}

function buildUrl(prefix: string, slug: string): string {
    const p = prefix.trim().replace(/^\/+|\/+$/g, "");
    return p ? `/${p}/${slug}` : `/${slug}`;
}

export default function YoutubeBlogDetails({
    data,
    pageData,
    permalinkMap = {},
}: YoutubeBlogDetailsProps) {
    const rawYoutube = data.info?.youtube || data.info?.youtubeId || data.info?.youtubeUrl || "";
    const videoId = extractVideoId(rawYoutube);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    const author = pageData?.author || {
        name: data.info?.author || data.info?.channelTitle || data.info?.userName || "Creator",
        image: data.info?.authorImage || data.info?.userImage || "",
        type: data.info?.authorType || "Channel",
    };

    const categoryAncestors = pageData?.categoryAncestors || [];
    const catPrefix = (permalinkMap["blog-category"] ?? "blog/category").trim().replace(/^\/+|\/+$/g, "");

    const formattedDate = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : null;

    const description = data.info?.description || data.info?.shortDescription || "";

    return (
        <article className="space-y-4">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
                {data.title}
            </h1>

            {/* Below Title Ad */}
            <div className="py-1">
                <Ads type="single" slot="belowTitle" />
            </div>

            {/* Author / Channel Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {author.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={author.image}
                            alt={author.name || "Author"}
                            className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-2xs"
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                            {(author.name || "Y").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-1.5">
                            <span>{author.name}</span>
                            <Icon icon="solar:verified-check-bold" className="text-blue-500 w-4 h-4" />
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{author.type || "Creator"}</span>
                            {formattedDate && (
                                <>
                                    <span>•</span>
                                    <span>{formattedDate}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Direct YouTube watch link if video ID exists */}
                {videoId && (
                    <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all w-fit"
                    >
                        <Icon icon="akar-icons:youtube-fill" className="w-4 h-4" />
                        <span>Watch on YouTube</span>
                    </a>
                )}
            </div>

            {/* Social Media Share Component */}
            <div className="py-2">
                <Share title={data.title} description={description} />
            </div>

            {/* Formatted Expandable Description Box (YouTube Style) */}
            {description && (
                <div className="transition-colors space-y-3">
                    {/* Category Hashtags */}
                    {categoryAncestors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {categoryAncestors.map((cat) => (
                                <Link
                                    key={cat._id}
                                    href={buildUrl(catPrefix, cat.slug)}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    #{cat.title.replace(/\s+/g, "")}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Description HTML Content */}
                    <div
                        className={`prose prose-sm max-w-none text-gray-800 leading-relaxed description ${
                            isDescExpanded ? "" : "line-clamp-5"
                        }`}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />

                    {/* Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-xs font-bold text-gray-900 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer pt-1"
                    >
                        <span>{isDescExpanded ? "Show less" : "...Show more"}</span>
                        <Icon
                            icon={isDescExpanded ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"}
                            className="w-3.5 h-3.5"
                        />
                    </button>
                </div>
            )}
        </article>
    );
}
