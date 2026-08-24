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

export interface Youtube9Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showMainPlayIcon?: boolean;
    showSidePlayIcon?: boolean;
}

export function Youtube9UI({
    title = "Theater Showcase",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 4,
    colors = {},
    showCategory = true,
    showLink = true,
    showMainPlayIcon = true,
    showSidePlayIcon = true,
}: Youtube9Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const mainPost = posts[0];
    const sidePosts = posts.slice(1, 4);

    return (
        <div className="w-full flex flex-col gap-5 p-4 sm:p-6 bg-[#0f0f0f] rounded-3xl text-white shadow-xl">
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={{
                    ...colors,
                    title: "#ffffff",
                    headerBg: "transparent",
                    inactive: "#272727",
                    inactiveText: "#aaaaaa",
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 1. Main Cinema Theater Video Card Left (Col 7) */}
                {mainPost && (
                    <div className="lg:col-span-7 flex flex-col gap-3">
                        <a
                            href={showLink ? (mainPost.postUrl || "#") : "#"}
                            className="group relative aspect-video w-full rounded-2xl overflow-hidden bg-black block shadow-lg border border-gray-800"
                        >
                            {mainPost.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={mainPost.image}
                                    alt={mainPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <Icon icon="akar-icons:youtube-fill" className="w-16 h-16 text-red-600" />
                                </div>
                            )}

                            {/* Main Theater Play Icon */}
                            {showMainPlayIcon && (mainPost.videoId || mainPost.duration) && (
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                    <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                        <Icon icon="solar:play-bold" className="w-7 h-7 ml-0.5" />
                                    </div>
                                </div>
                            )}
                        </a>

                        <div className="space-y-1 pt-1">
                            
                            <a
                                href={showLink ? (mainPost.postUrl || "#") : "#"}
                                className="text-lg sm:text-xl font-bold text-white hover:text-red-400 line-clamp-2 leading-snug transition-colors block"
                            >
                                {mainPost.title}
                            </a>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                {showCategory && mainPost.categoryTitle && (
                                    <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                                        {mainPost.categoryTitle}
                                    </span>
                                )}
                                <span>•</span>
                                <span>{mainPost.createdAt ? new Date(mainPost.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. 3 Side Vertical Cards (Col 5) */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    {sidePosts.map((post) => (
                        <a
                            key={post._id}
                            href={showLink ? (post.postUrl || "#") : "#"}
                            className="group flex gap-3 p-2 rounded-xl hover:bg-[#272727] transition-colors items-center"
                        >
                            <div className="relative w-36 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 shadow-xs border border-gray-800">
                                {post.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        <Icon icon="akar-icons:youtube-fill" className="w-8 h-8 text-red-600" />
                                    </div>
                                )}

                                {/* Side Play Icon */}
                                {showSidePlayIcon && (post.videoId || post.duration) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <Icon icon="solar:play-bold" className="w-3.5 h-3.5 ml-0.5" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-100 group-hover:text-red-400 line-clamp-2 leading-snug transition-colors">
                                    {post.title}
                                </h4>
                                <div className="text-[10px] text-gray-400 mt-1 truncate">{post.author || "Video"}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Youtube9CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 4;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 9...</span>
            </div>
        );
    }

    return (
        <Youtube9UI
            title={c.title ?? "Theater Showcase"}
            categoryIds={categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "#ffffff",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showMainPlayIcon={c.showMainPlayIcon !== "false"}
            showSidePlayIcon={c.showSidePlayIcon !== "false"}
        />
    );
}

const Youtube9Element = {
    type: "youtube-9",
    category: "youtube",
    label: "Dark Cinema Theater Showcase",
    icon: "solar:moon-bold",

    schema: {
        content: {
            title: "Theater Showcase",
            categoryIds: [] as string[],
            limit: 4,
            showCategory: "true",
            showLink: "true",
            showMainPlayIcon: "true",
            showSidePlayIcon: "true",
        },
        style: {
            titleColor: "#ffffff",
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
                    name: "showMainPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Main Cinema Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
                {
                    name: "showSidePlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Side Cards Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
            ],
        },
        {
            tab: "Style",
            section: "Colors",
            controls: [
                {
                    name: "activeTabColor",
                    render: (value: any, onChange: any) => (
                        <ColorPickerPopup label="Active Tab Color" value={value ?? "#dc2626"} onChange={onChange} />
                    ),
                },
            ],
        },
    ],

    render: (element: any) => <Youtube9CanvasPreview element={element} />,
};

export default Youtube9Element;
