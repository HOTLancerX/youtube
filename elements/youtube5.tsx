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

export interface Youtube5Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showExcerpt?: boolean;
    showCenterPlayIcon?: boolean;
    showSidePlayIcon?: boolean;
}

export function Youtube5UI({
    title = "",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 5,
    colors = {},
    showCategory = true,
    showLink = true,
    showExcerpt = true,
    showCenterPlayIcon = true,
    showSidePlayIcon = true,
}: Youtube5Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const centerPost = posts[0];
    const leftPosts = posts.slice(1, 3);
    const rightPosts = posts.slice(3, 5);

    return (
        <div className="w-full flex flex-col gap-5">
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* 1. Left 2 Stacked Videos (Col 3) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {leftPosts.map((post) => (
                        <a
                            key={post._id}
                            href={showLink ? (post.postUrl || "#") : "#"}
                            className="group flex flex-col bg-white rounded-2xl border border-gray-200/80 p-3 shadow-2xs hover:shadow-md transition-all flex-1"
                        >
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
                                {post.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Icon icon="akar-icons:youtube-fill" className="w-8 h-8 text-red-600" />
                                    </div>
                                )}

                                {/* Side Play Icon */}
                                {showSidePlayIcon && (post.videoId || post.duration || post.image) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <Icon icon="solar:play-bold" className="w-4 h-4 ml-0.5" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded bg-black/85 text-white text-[10px] font-bold font-mono">
                                    {post.duration || "VIDEO"}
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 mt-2 leading-snug">
                                {post.title}
                            </h4>
                        </a>
                    ))}
                </div>

                {/* 2. Center Big Video Stage (Col 6) */}
                {centerPost && (
                    <div className="lg:col-span-6 flex flex-col bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-2xs overflow-hidden justify-between">
                        <div>
                            <a
                                href={showLink ? (centerPost.postUrl || "#") : "#"}
                                className="group relative aspect-video w-full rounded-xl overflow-hidden bg-black block shadow-xs"
                            >
                                {centerPost.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={centerPost.image} alt={centerPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Icon icon="akar-icons:youtube-fill" className="w-14 h-14 text-red-600" />
                                    </div>
                                )}

                                {/* Center Play Icon */}
                                {showCenterPlayIcon && (centerPost.videoId || centerPost.duration) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Icon icon="solar:play-bold" className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
                                        </div>
                                    </div>
                                )}
                            </a>

                            <div className="pt-3 space-y-1.5">
                                <a
                                    href={showLink ? (centerPost.postUrl || "#") : "#"}
                                    className="text-base sm:text-xl font-bold text-gray-900 hover:text-red-600 line-clamp-2 leading-snug transition-colors block"
                                >
                                    {centerPost.title}
                                </a>
                                {showExcerpt && centerPost.excerpt && (
                                    <p className="text-xs text-gray-500 line-clamp-3">
                                        {centerPost.excerpt.replace(/<[^>]*>/g, "").trim()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 mt-2 flex items-center justify-between">
                            {showCategory && centerPost.categoryTitle && (
                                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                                    {centerPost.categoryTitle}
                                </span>
                            )}
                            <span>{centerPost.createdAt ? new Date(centerPost.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                    </div>
                )}

                {/* 3. Right 2 Stacked Videos (Col 3) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {rightPosts.map((post) => (
                        <a
                            key={post._id}
                            href={showLink ? (post.postUrl || "#") : "#"}
                            className="group flex flex-col bg-white rounded-2xl border border-gray-200/80 p-3 shadow-2xs hover:shadow-md transition-all flex-1"
                        >
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
                                {post.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Icon icon="akar-icons:youtube-fill" className="w-8 h-8 text-red-600" />
                                    </div>
                                )}

                                {/* Side Play Icon */}
                                {showSidePlayIcon && (post.videoId || post.duration || post.image) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <Icon icon="solar:play-bold" className="w-4 h-4 ml-0.5" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded bg-black/85 text-white text-[10px] font-bold font-mono">
                                    {post.duration || "VIDEO"}
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 mt-2 leading-snug">
                                {post.title}
                            </h4>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Youtube5CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 5;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 5...</span>
            </div>
        );
    }

    return (
        <Youtube5UI
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
            showExcerpt={c.showExcerpt !== "false"}
            showCenterPlayIcon={c.showCenterPlayIcon !== "false"}
            showSidePlayIcon={c.showSidePlayIcon !== "false"}
        />
    );
}

const Youtube5Element = {
    type: "youtube-5",
    category: "youtube",
    label: "Center Video Showcase",
    icon: "solar:tv-bold",

    schema: {
        content: {
            title: "Spotlight Videos",
            categoryIds: [] as string[],
            limit: 5,
            showCategory: "true",
            showLink: "true",
            showExcerpt: "true",
            showCenterPlayIcon: "true",
            showSidePlayIcon: "true",
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
                    name: "showCenterPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Center Main Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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

    render: (element: any) => <Youtube5CanvasPreview element={element} />,
};

export default Youtube5Element;
