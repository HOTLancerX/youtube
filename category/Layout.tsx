"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import Ads from "@/components/Ads";
import YoutubeBox from "../box/Box";

interface BlogCatProps {
    data: {
        _id: string;
        title: string;
        slug: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        info: Record<string, string>;
    };
    settings?: Record<string, any>;
    permalinkMap?: Record<string, string>;
    pageData?: {
        posts: any[];
        subCats: { _id: string; title: string; slug: string }[];
        ancestors: { _id: string; title: string; slug: string }[];
        activeBox: { label: string; pluginNx: string } | null;
    };
}

function buildUrl(prefix: string, slug: string): string {
    const p = prefix.trim().replace(/^\/+|\/+$/g, "");
    return p ? `/${p}/${slug}` : `/${slug}`;
}

export default function YoutubeCategoryLayout({
    data,
    settings = {},
    permalinkMap = {},
    pageData,
}: BlogCatProps) {
    const postPrefix =
        (permalinkMap["blog"] ?? "blog").trim().replace(/^\/+|\/+$/g, "") || "blog";
    const catPrefix = (permalinkMap["blog-category"] ?? "blog/category")
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const posts = pageData?.posts ?? [];
    const subCats = pageData?.subCats ?? [];
    const ancestors = pageData?.ancestors ?? [];

    const breadcrumbLinks = ancestors.slice(0, -1);

    return (
        <main className="bg-gray-50/40 min-h-screen space-y-6 pb-16">
            {/* YouTube Category Header Banner */}
            <header className="bg-linear-to-r from-red-600 via-red-500 to-rose-600 py-10 text-white shadow-sm">
                <div className="container space-y-3">
                    {/* Breadcrumb */}
                    <nav
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 flex-wrap"
                        aria-label="breadcrumb"
                    >
                        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                            <Icon icon="solar:home-2-bold" width="14" height="14" />
                            Home
                        </Link>
                        {breadcrumbLinks.map((ancestor) => (
                            <span key={ancestor._id} className="flex items-center gap-1.5">
                                <span className="text-white/40">›</span>
                                <Link
                                    href={buildUrl(catPrefix, ancestor.slug)}
                                    className="hover:text-white transition-colors"
                                >
                                    {ancestor.title}
                                </Link>
                            </span>
                        ))}
                        <span className="text-white/40">›</span>
                        <span className="text-white font-semibold">{data.title}</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                                <Icon icon="akar-icons:youtube-fill" className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                                    {data.title}
                                </h1>
                                <p className="text-xs text-white/80 mt-0.5">
                                    Browse all video posts and articles in {data.title}
                                </p>
                            </div>
                        </div>

                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30 w-fit shrink-0 backdrop-blur-xs">
                            {posts.length} video{posts.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </header>

            {/* Category Page Top Ads */}
            <Ads type="category" slot="top" settings={settings} />

            <div className="container space-y-6">
                {/* Sub-Category Filter Chips (YouTube Style Pill Buttons) */}
                {subCats.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <span className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-semibold shrink-0 shadow-2xs">
                            All
                        </span>
                        {subCats.map((sub) => (
                            <Link
                                key={sub._id}
                                href={buildUrl(catPrefix, sub.slug)}
                                className="px-4 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-red-600 transition-colors shrink-0 shadow-2xs"
                            >
                                {sub.title}
                            </Link>
                        ))}
                    </div>
                )}

                {/* YouTube Video Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                        {posts.map((post) => (
                            <YoutubeBox
                                key={post._id}
                                data={post}
                                postUrl={buildUrl(postPrefix, post.slug)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                        <Icon icon="akar-icons:youtube-fill" className="w-12 h-12 text-gray-300 mx-auto" />
                        <h3 className="text-base font-bold text-gray-700">No videos found in this category</h3>
                        <p className="text-xs text-gray-400">Import videos from YouTube to populate this category.</p>
                    </div>
                )}
            </div>

            {/* Category Page Bottom Ads */}
            <Ads type="category" slot="bottom" settings={settings} />
        </main>
    );
}
