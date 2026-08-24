"use client";

import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import { Icon } from "@iconify/react";

interface Post {
    _id: string;
    title: string;
    slug: string;
    status: string;
    createdAt?: string;
    info: Record<string, string>;
}

interface YoutubeRelatedProps {
    posts: Post[];
    postPrefix: string;
    currentPostId?: string;
}

function buildUrl(prefix: string, slug: string): string {
    const p = prefix.trim().replace(/^\/+|\/+$/g, "");
    return p ? `/${p}/${slug}` : `/${slug}`;
}

export default function YoutubeRelated({ posts = [], postPrefix, currentPostId }: YoutubeRelatedProps) {
    const [filter, setFilter] = useState<"all" | "video">("all");

    const filteredList = posts.filter((p) => {
        if (currentPostId && p._id === currentPostId) return false;
        if (filter === "video") {
            return Boolean(p.info?.youtube || p.info?.youtubeId);
        }
        return true;
    });

    if (filteredList.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* Header & Filter Chips */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Icon icon="akar-icons:youtube-fill" className="text-red-600 w-4 h-4" />
                    <span>Related Videos</span>
                </h2>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            filter === "all"
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("video")}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                            filter === "video"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        <Icon icon="solar:play-circle-bold" className="w-3 h-3" />
                        Videos Only
                    </button>
                </div>
            </div>

            {/* Video List (YouTube right-side format) */}
            <div className="space-y-1 divide-y divide-gray-50">
                {filteredList.map((post) => (
                    <VideoCard
                        key={post._id}
                        data={post}
                        postUrl={buildUrl(postPrefix, post.slug)}
                        horizontal={true}
                    />
                ))}
            </div>
        </div>
    );
}
