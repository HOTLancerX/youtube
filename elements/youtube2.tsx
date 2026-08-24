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

export interface Youtube2Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    playlistCount?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showExcerpt?: boolean;
    showMainPlayIcon?: boolean;
    showPlaylistPlayIcon?: boolean;
}

export function Youtube2UI({
    title = "",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 6,
    playlistCount = 5,
    colors = {},
    showCategory = true,
    showLink = true,
    showExcerpt = true,
    showMainPlayIcon = true,
    showPlaylistPlayIcon = true,
}: Youtube2Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const mainPost = posts[0];
    const playlistPosts = posts.slice(1, 1 + (Number(playlistCount) || 5));

    return (
        <div className="w-full flex flex-col gap-5">
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 1. Left (60% / Col 7): Main Cinema Player Stage */}
                {mainPost && (
                    <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 shadow-2xs overflow-hidden">
                        <a
                            href={showLink ? (mainPost.postUrl || "#") : "#"}
                            className="group relative aspect-video w-full rounded-xl overflow-hidden bg-black block shadow-xs"
                        >
                            {mainPost.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={mainPost.image}
                                    alt={mainPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <Icon icon="akar-icons:youtube-fill" className="w-16 h-16 text-red-600" />
                                </div>
                            )}

                            {/* Main Center Play Icon */}
                            {showMainPlayIcon && (mainPost.videoId || mainPost.duration) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Icon icon="solar:play-bold" className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
                                    </div>
                                </div>
                            )}
                        </a>

                        <div className="pt-3 space-y-1.5">
                            {showCategory && mainPost.categoryTitle && (
                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                                    {mainPost.categoryTitle}
                                </span>
                            )}
                            <a
                                href={showLink ? (mainPost.postUrl || "#") : "#"}
                                className="text-base sm:text-lg font-bold text-gray-900 hover:text-red-600 line-clamp-2 leading-snug transition-colors block"
                            >
                                {mainPost.title}
                            </a>
                            {showExcerpt && mainPost.excerpt && (
                                <p className="text-xs text-gray-500 line-clamp-2">
                                    {mainPost.excerpt.replace(/<[^>]*>/g, "").trim()}
                                </p>
                            )}
                            <div className="text-[11px] text-gray-400 pt-1 flex items-center gap-2">
                                <span>{mainPost.author || "YouTube Video"}</span>
                                <span>•</span>
                                <span>{mainPost.createdAt ? new Date(mainPost.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Right (40% / Col 5): YouTube Playlist List */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                            <Icon icon="solar:playlist-minimalistic-2-bold" className="text-red-600 w-4 h-4" />
                            Up Next Playlist
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold">{playlistPosts.length} videos</span>
                    </div>

                    <div className="space-y-2 divide-y divide-gray-50 max-h-115 overflow-y-auto pr-1">
                        {playlistPosts.map((post, idx) => (
                            <a
                                key={post._id}
                                href={showLink ? (post.postUrl || "#") : "#"}
                                className="group flex gap-2.5 pt-2 first:pt-0 items-center hover:bg-gray-50 p-1.5 rounded-xl transition-colors"
                            >
                                <span className="text-xs font-bold text-gray-400 w-4 text-center shrink-0">{idx + 1}</span>
                                <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-black shrink-0 shadow-2xs">
                                    {post.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Icon icon="akar-icons:youtube-fill" className="w-6 h-6 text-red-600" />
                                        </div>
                                    )}

                                    {/* Playlist Play Icon */}
                                    {showPlaylistPlayIcon && (post.videoId || post.duration) && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                                <Icon icon="solar:play-bold" className="w-3.5 h-3.5 ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors">
                                        {post.title}
                                    </h4>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Youtube2CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 6;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 2...</span>
            </div>
        );
    }

    return (
        <Youtube2UI
            title={c.title ?? ""}
            categoryIds={categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            playlistCount={Number(c.playlistCount) || 5}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showExcerpt={c.showExcerpt !== "false"}
            showMainPlayIcon={c.showMainPlayIcon !== "false"}
            showPlaylistPlayIcon={c.showPlaylistPlayIcon !== "false"}
        />
    );
}

const Youtube2Element = {
    type: "youtube-2",
    category: "youtube",
    label: "Cinema Lead + Playlist",
    icon: "solar:video-library-bold",

    schema: {
        content: {
            title: "Watch Next",
            categoryIds: [] as string[],
            limit: 6,
            playlistCount: 5,
            showCategory: "true",
            showLink: "true",
            showExcerpt: "true",
            showMainPlayIcon: "true",
            showPlaylistPlayIcon: "true",
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
                    name: "playlistCount",
                    render: (value: any, onChange: any) => (
                        <NumberControl label="Right Playlist Videos Count" value={value ?? 5} onChange={onChange} min={2} max={10} />
                    ),
                },
                {
                    name: "showCategory",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Category" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
                {
                    name: "showExcerpt",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Excerpt" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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
                    name: "showPlaylistPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Playlist Videos Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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

    render: (element: any) => <Youtube2CanvasPreview element={element} />,
};

export default Youtube2Element;
