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

export interface Youtube10Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showExcerpt?: boolean;
    showPlayIcon?: boolean;
}

export function Youtube10UI({
    title = "Video Feed",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 5,
    colors = {},
    showCategory = true,
    showLink = true,
    showExcerpt = true,
    showPlayIcon = true,
}: Youtube10Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    return (
        <div className="w-full flex flex-col gap-5">
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            <div className="flex flex-col gap-4">
                {posts.map((post) => (
                    <a
                        key={post._id}
                        href={showLink ? (post.postUrl || "#") : "#"}
                        className="group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-md transition-all items-stretch"
                    >
                        {/* 16:9 Thumbnail Left */}
                        <div className="relative w-full sm:w-64 md:w-80 aspect-video shrink-0">
                            {post.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <Icon icon="akar-icons:youtube-fill" className="w-12 h-12 text-red-600" />
                                </div>
                            )}

                            {/* Center Play Button */}
                            {showPlayIcon && (post.videoId || post.duration) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Icon icon="solar:play-bold" className="w-5 h-5 ml-0.5" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Video Content Right */}
                        <div className="flex-1 flex flex-col justify-between min-w-0 p-3 sm:p-4">
                            <div>
                                {showCategory && post.categoryTitle && (
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                                        {post.categoryTitle}
                                    </span>
                                )}
                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors">
                                    {post.title}
                                </h3>

                                <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                                    <span className="font-semibold text-gray-700">{post.author || "YouTube Video"}</span>
                                    <Icon icon="solar:verified-check-bold" className="text-blue-500 w-3.5 h-3.5 shrink-0" />
                                    <span>•</span>
                                    <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                                </div>

                                {showExcerpt && post.excerpt && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                                        {post.excerpt.replace(/<[^>]*>/g, "").trim()}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-400">
                                <span className="px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-600">HD</span>
                                <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 font-bold">1080p</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

function Youtube10CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 5;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 10...</span>
            </div>
        );
    }

    return (
        <Youtube10UI
            title={c.title ?? "Video Feed"}
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
            showExcerpt={c.showExcerpt !== "false"}
            showPlayIcon={c.showPlayIcon !== "false"}
        />
    );
}

const Youtube10Element = {
    type: "youtube-10",
    category: "youtube",
    label: "Channel Feed Rows",
    icon: "solar:list-bold",

    schema: {
        content: {
            title: "Video Feed",
            categoryIds: [] as string[],
            limit: 5,
            showCategory: "true",
            showLink: "true",
            showExcerpt: "true",
            showPlayIcon: "true",
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
                    name: "limit",
                    render: (value: any, onChange: any) => (
                        <NumberControl label="Total Limit" value={value ?? 5} onChange={onChange} min={2} max={20} />
                    ),
                },
                {
                    name: "showExcerpt",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Excerpt" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
                {
                    name: "showPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Video Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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

    render: (element: any) => <Youtube10CanvasPreview element={element} />,
};

export default Youtube10Element;
