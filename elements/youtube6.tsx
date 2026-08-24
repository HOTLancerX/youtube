"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
    Text,
    NumberControl,
    ColorPickerPopup,
    Toggle,
} from "@/components/builder/controls";
import { CategorySorter } from "../lib/CategorySorter";
import { Tab, TabPost, YoutubeColors } from "../lib/types";
import { YoutubeHeader } from "../lib/YoutubeHeader";
import { useYoutubePosts, getDisplayPosts } from "../hooks/useYoutubePosts";

export interface Youtube6Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showBannerPlayIcon?: boolean;
    showGridPlayIcon?: boolean;
}

export function Youtube6UI({
    title = "",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 4,
    colors = {},
    showCategory = true,
    showLink = true,
    showBannerPlayIcon = true,
    showGridPlayIcon = true,
}: Youtube6Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const bannerPost = posts[0];
    const bottomPosts = posts.slice(1, 4);

    return (
        <div className="w-full flex flex-col gap-5">
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            {/* 1. Large Cinematic Video Banner with Dark Gradient Overlay */}
            {bannerPost && (
                <a
                    href={showLink ? (bannerPost.postUrl || "#") : "#"}
                    className="group relative w-full aspect-21/9 min-h-65 md:min-h-95 rounded-3xl overflow-hidden bg-black block shadow-lg"
                >
                    {bannerPost.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={bannerPost.image}
                            alt={bannerPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <Icon icon="akar-icons:youtube-fill" className="w-20 h-20 text-red-600" />
                        </div>
                    )}

                    {/* Center Banner Play Icon */}
                    {showBannerPlayIcon && (bannerPost.videoId || bannerPost.duration) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <Icon icon="solar:play-bold" className="w-7 h-7 md:w-8 md:h-8 ml-0.5" />
                            </div>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8 pointer-events-none">
                        <div className="max-w-2xl space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
                                    {bannerPost.categoryTitle || "FEATURED VIDEO"}
                                </span>
                                {bannerPost.duration && (
                                    <span className="px-2 py-1 rounded-md bg-black/70 text-white text-[11px] font-mono font-bold">
                                        {bannerPost.duration}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl md:text-3xl font-extrabold text-white group-hover:text-red-400 leading-tight transition-colors line-clamp-2">
                                {bannerPost.title}
                            </h2>

                            {bannerPost.excerpt && (
                                <p className="text-xs md:text-sm text-gray-300 line-clamp-2 max-w-xl">
                                    {bannerPost.excerpt.replace(/<[^>]*>/g, "").trim()}
                                </p>
                            )}
                        </div>
                    </div>
                </a>
            )}

            {/* 2. 3 Bottom Video Cards */}
            {bottomPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {bottomPosts.map((post) => (
                        <a
                            key={post._id}
                            href={showLink ? (post.postUrl || "#") : "#"}
                            className="group flex flex-col bg-white rounded-2xl border border-gray-200/80 p-3 shadow-2xs hover:shadow-md transition-all"
                        >
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
                                {post.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Icon icon="akar-icons:youtube-fill" className="w-10 h-10 text-red-600" />
                                    </div>
                                )}

                                {/* Bottom Cards Play Icon */}
                                {showGridPlayIcon && (post.videoId || post.duration) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <Icon icon="solar:play-bold" className="w-4 h-4 ml-0.5" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 mt-2 leading-snug">
                                {post.title}
                            </h3>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

function Youtube6CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 4;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 6...</span>
            </div>
        );
    }

    return (
        <Youtube6UI
            title={c.title ?? ""}
            categoryIds={categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showBannerPlayIcon={c.showBannerPlayIcon !== "false"}
            showGridPlayIcon={c.showGridPlayIcon !== "false"}
        />
    );
}

const Youtube6Element = {
    type: "youtube-6",
    category: "youtube",
    label: "Cinematic Banner + Grid",
    icon: "solar:clapperboard-play-bold",

    schema: {
        content: {
            title: "Cinema Highlights",
            categoryIds: [] as string[],
            limit: 4,
            showCategory: "true",
            showLink: "true",
            showBannerPlayIcon: "true",
            showGridPlayIcon: "true",
        },
        style: {
            titleColor: "",
            activeTabColor: "#dc2626",
            activeTabTextColor: "#ffffff",
        },
    },

    controls: [
        {
            tab: "Layout",
            section: "Content",
            controls: [
                {
                    name: "title",
                    render: (value: any, onChange: any) => (
                        <Text label="Title" value={value ?? ""} onChange={onChange} />
                    ),
                },
                {
                    name: "categoryIds",
                    render: (value: any, onChange: any) => (
                        <CategorySorter value={value ?? []} onChange={onChange} />
                    ),
                },
                {
                    name: "showCategory",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Category" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
            ],
        },
        {
            tab: "Layout",
            section: "Video Play Icons",
            controls: [
                {
                    name: "showBannerPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Banner Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
                {
                    name: "showGridPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Bottom Cards Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
            ],
        },
        {
            tab: "Style",
            section: "Colors",
            controls: [
                {
                    name: "titleColor",
                    render: (value: any, onChange: any) => (
                        <ColorPickerPopup label="Title Color" value={value ?? ""} onChange={onChange} />
                    ),
                },
                {
                    name: "activeTabColor",
                    render: (value: any, onChange: any) => (
                        <ColorPickerPopup label="Active Tab Color" value={value ?? "#dc2626"} onChange={onChange} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <Youtube6CanvasPreview element={element} />,
};

export default Youtube6Element;
