"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import YoutubeBlogDetails from "./details";
import YoutubeRelated from "./Related";
import Ads from "@/components/Ads";

interface BlogPostProps {
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
    settings?: Record<string, any>;
    permalinkMap?: Record<string, string>;
    pageData?: {
        categoryAncestors?: { _id: string; title: string; slug: string }[];
        relatedPosts?: any[];
        author?: { _id?: string; name?: string; image?: string; slug?: string; type?: string } | null;
        activeBox?: any;
    };
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

function getImage(info?: Record<string, string>): string {
    if (!info?.images) return "";
    try {
        const parsed = JSON.parse(info.images);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        if (typeof parsed === "string" && parsed) return parsed;
    } catch {
        if (info.images.startsWith("http")) return info.images;
    }
    return "";
}

function buildUrl(prefix: string, slug: string): string {
    const p = prefix.trim().replace(/^\/+|\/+$/g, "");
    return p ? `/${p}/${slug}` : `/${slug}`;
}

export default function YoutubeBlogLayout({
    data,
    settings = {},
    permalinkMap = {},
    pageData,
}: BlogPostProps) {
    const categoryAncestors = pageData?.categoryAncestors ?? [];
    const relatedPosts = pageData?.relatedPosts ?? [];

    const postPrefix = (permalinkMap["blog"] ?? "blog").trim().replace(/^\/+|\/+$/g, "") || "blog";
    const catPrefix = (permalinkMap["blog-category"] ?? "blog/category")
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const rawYoutube = data.info?.youtube || data.info?.youtubeId || data.info?.youtubeUrl || "";
    const videoId = extractVideoId(rawYoutube);
    const featuredImage = getImage(data.info);

    return (
        <main className="min-h-screen pb-16 space-y-6 bg-gray-50/40">
            {/* Single Page Top Ads */}
            <Ads type="single" slot="top" settings={settings} />

            {/* 1. 100% Full-Width Cinema Video Player / Featured Image (YouTube Theater Mode) */}
            <div className="w-full bg-black flex justify-center items-center shadow-md">
                <div className="w-full max-w-6xl aspect-video max-h-[80vh] relative bg-black">
                    {videoId ? (
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                            title={data.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full border-0"
                        />
                    ) : featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={featuredImage}
                            alt={data.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                            <Icon icon="akar-icons:youtube-fill" className="w-16 h-16 text-red-600" />
                            <span className="text-sm font-semibold">No Video / Image Available</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Reduced Content Container (YouTube 2-Column Watch Experience) */}
            <div className="container space-y-6">
                {/* Breadcrumb Navigation */}
                <nav
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs flex-wrap"
                    aria-label="breadcrumb"
                >
                    <Link href="/" className="hover:text-red-600 transition-colors flex items-center gap-1">
                        <Icon icon="solar:home-2-bold" width="14" height="14" />
                        Home
                    </Link>
                    {categoryAncestors.map((ancestor) => (
                        <span key={ancestor._id} className="flex items-center gap-1.5">
                            <span className="text-gray-300">›</span>
                            <Link
                                href={buildUrl(catPrefix, ancestor.slug)}
                                className="hover:text-red-600 transition-colors"
                            >
                                {ancestor.title}
                            </Link>
                        </span>
                    ))}
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-900 font-semibold truncate max-w-50 sm:max-w-xs">
                        {data.title}
                    </span>
                </nav>

                {/* 2-Column Grid: Left (Col 8) Details & Share, Right (Col 4) Related Videos */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Title, Author, Share, and Description */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs">
                            <YoutubeBlogDetails
                                data={data}
                                pageData={pageData}
                                permalinkMap={permalinkMap}
                            />
                        </div>

                        {/* Middle/Bottom Ad */}
                        <Ads type="single" slot="middle" settings={settings} />
                    </div>

                    {/* Right Column: YouTube-style Related Videos Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-6 space-y-6">
                            {/* Single Page Right Top Ads */}
                            <Ads type="single" slot="rightTop" settings={settings} />

                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
                                <YoutubeRelated
                                    posts={relatedPosts}
                                    postPrefix={postPrefix}
                                    currentPostId={data._id}
                                />
                            </div>

                            {/* Single Page Right Bottom Ads */}
                            <Ads type="single" slot="rightBottom" settings={settings} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Single Page Bottom Ads */}
            <Ads type="single" slot="bottom" settings={settings} />
        </main>
    );
}
