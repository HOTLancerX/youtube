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

export interface Youtube8Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showDualPlayIcon?: boolean;
    showGridPlayIcon?: boolean;
}

export function Youtube8UI({
    title = "",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 6,
    colors = {},
    showCategory = true,
    showLink = true,
    showDualPlayIcon = true,
    showGridPlayIcon = true,
}: Youtube8Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const dualPosts = posts.slice(0, 2);
    const bottomPosts = posts.slice(2, 6);

    return (
        <div className="w-full flex flex-col gap-5">
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            {/* 1. Top Dual 50/50 Featured Video Cards */}
            {dualPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {dualPosts.map((post) => (
                        <div
                            key={post._id}
                            className="bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 shadow-2xs flex flex-col justify-between"
                        >
                            <div>
                                <a
                                    href={showLink ? (post.postUrl || "#") : "#"}
                                    className="group relative aspect-video w-full rounded-xl overflow-hidden bg-black block shadow-xs"
                                >
                                    {post.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Icon icon="akar-icons:youtube-fill" className="w-12 h-12 text-red-600" />
                                        </div>
                                    )}

                                    {/* Dual Lead Play Icon */}
                                    {showDualPlayIcon && (post.videoId || post.duration) && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Icon icon="solar:play-bold" className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </a>

                                <div className="pt-3 space-y-1">
                                    <a
                                        href={showLink ? (post.postUrl || "#") : "#"}
                                        className="text-base font-bold text-gray-900 hover:text-red-600 line-clamp-2 leading-snug transition-colors block"
                                    >
                                        {post.title}
                                    </a>
                                </div>
                            </div>

                            <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 mt-2 flex items-center justify-between">
                                {showCategory && post.categoryTitle && (
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                        {post.categoryTitle}
                                    </span>
                                )}
                                <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Bottom 4 Grid Cards */}
            {bottomPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {bottomPosts.map((post) => (
                        <a
                            key={post._id}
                            href={showLink ? (post.postUrl || "#") : "#"}
                            className="group flex flex-col bg-white rounded-xl overflow-hidden transition-all"
                        >
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xs">
                                {post.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Icon icon="akar-icons:youtube-fill" className="w-8 h-8 text-red-600" />
                                    </div>
                                )}

                                {/* Bottom Grid Play Icon */}
                                {showGridPlayIcon && (post.videoId || post.duration || post.image) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <Icon icon="solar:play-bold" className="w-4 h-4 ml-0.5" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded bg-black/85 text-white text-[10px] font-mono font-bold">
                                    {post.duration || "VIDEO"}
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 mt-2 leading-snug">
                                {post.title}
                            </h4>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

function Youtube8CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 6;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 8...</span>
            </div>
        );
    }

    return (
        <Youtube8UI
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
            showDualPlayIcon={c.showDualPlayIcon !== "false"}
            showGridPlayIcon={c.showGridPlayIcon !== "false"}
        />
    );
}

const Youtube8Element = {
    type: "youtube-8",
    category: "youtube",
    label: "Dual 50/50 Video Lead + Grid",
    icon: "solar:layers-minimalistic-bold",

    schema: {
        content: {
            title: "Dual Highlights",
            categoryIds: [] as string[],
            limit: 6,
            showCategory: "true",
            showLink: "true",
            showDualPlayIcon: "true",
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
                    name: "showDualPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Dual Top Cards Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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

    render: (element: any) => <Youtube8CanvasPreview element={element} />,
};

export default Youtube8Element;
