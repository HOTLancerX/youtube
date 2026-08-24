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

export interface Youtube1Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    columnsDesktop?: number;
    columnsTablet?: number;
    columnsMobile?: number;
    leadHeightDesktop?: number;
    leadHeightMobile?: number;
    gridHeightDesktop?: number;
    gridHeightMobile?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showExcerpt?: boolean;
    showLeadPlayIcon?: boolean;
    showGridPlayIcon?: boolean;
}

export function Youtube1UI({
    title = "",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 5,
    columnsDesktop = 4,
    columnsTablet = 2,
    columnsMobile = 1,
    leadHeightDesktop = 380,
    leadHeightMobile = 220,
    gridHeightDesktop = 180,
    gridHeightMobile = 140,
    colors = {},
    showCategory = true,
    showLink = true,
    showExcerpt = true,
    showLeadPlayIcon = true,
    showGridPlayIcon = true,
}: Youtube1Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const leadPost = posts[0];
    const gridPosts = posts.slice(1);

    const deskCols = Number(columnsDesktop) || 4;
    const tabCols = Number(columnsTablet) || 2;
    const mobCols = Number(columnsMobile) || 1;

    const gridClass = `grid grid-cols-${mobCols} md:grid-cols-${tabCols} lg:grid-cols-${deskCols} gap-4 sm:gap-5`;

    return (
        <div className="w-full flex flex-col gap-5">
            {/* Header */}
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            {/* 1. Large Hero Video Card (Top) */}
            {leadPost && (
                <a
                    href={showLink ? (leadPost.postUrl || "#") : "#"}
                    className="group relative flex flex-col md:flex-row gap-4 md:gap-6 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden"
                    style={{ backgroundColor: colors.box0Bg || undefined }}
                >
                    {/* 16:9 Thumbnail Left */}
                    <div
                        className="w-full md:w-3/5 shrink-0 rounded-xl overflow-hidden bg-black relative aspect-video"
                        style={{
                            maxHeight: `${leadHeightDesktop}px`,
                        }}
                    >
                        {leadPost.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={leadPost.image}
                                alt={leadPost.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Icon icon="akar-icons:youtube-fill" className="w-16 h-16 text-red-600" />
                            </div>
                        )}

                        {/* Center Play Button */}
                        {showLeadPlayIcon && (leadPost.videoId || leadPost.duration) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Icon icon="solar:play-bold" className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text Right */}
                    <div className="flex-1 flex flex-col justify-center gap-2 py-1">
                        {showCategory && leadPost.categoryTitle && (
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                                {leadPost.categoryTitle}
                            </span>
                        )}
                        <h2
                            className="text-lg md:text-xl lg:text-2xl font-bold leading-snug line-clamp-3 group-hover:text-red-600 transition-colors"
                            style={{ color: colors.title || undefined }}
                        >
                            {leadPost.title}
                        </h2>

                        {showExcerpt && leadPost.excerpt && (
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-3 leading-relaxed">
                                {leadPost.excerpt.replace(/<[^>]*>/g, "").trim()}
                            </p>
                        )}

                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                            <span>{leadPost.author || "YouTube Video"}</span>
                            <span>•</span>
                            <span>{leadPost.createdAt ? new Date(leadPost.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                    </div>
                </a>
            )}

            {/* 2. Bottom Video Grid */}
            {gridPosts.length > 0 && (
                <div className={gridClass}>
                    {gridPosts.map((post) => (
                        <a
                            key={post._id}
                            href={showLink ? (post.postUrl || "#") : "#"}
                            className="group flex flex-col rounded-xl overflow-hidden transition-all"
                            style={{ backgroundColor: colors.box1Bg || undefined }}
                        >
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xs">
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
                                        <Icon icon="akar-icons:youtube-fill" className="w-10 h-10 text-red-600" />
                                    </div>
                                )}

                                {/* Center Play Button */}
                                {showGridPlayIcon && (post.videoId || post.duration) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <Icon icon="solar:play-bold" className="w-4 h-4 ml-0.5" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2.5 space-y-1">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors">
                                    {post.title}
                                </h3>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

function Youtube1CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 5;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 1...</span>
            </div>
        );
    }

    return (
        <Youtube1UI
            title={c.title ?? ""}
            categoryIds={categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            columnsDesktop={Number(c.columnsDesktop) || 4}
            columnsTablet={Number(c.columnsTablet) || 2}
            columnsMobile={Number(c.columnsMobile) || 1}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
                box0Bg: s.box0BgColor || "",
                box1Bg: s.box1BgColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showExcerpt={c.showExcerpt !== "false"}
            showLeadPlayIcon={c.showLeadPlayIcon !== "false"}
            showGridPlayIcon={c.showGridPlayIcon !== "false"}
        />
    );
}

const Youtube1Element = {
    type: "youtube-1",
    category: "youtube",
    label: "Hero Video Lead + Grid",
    icon: "solar:video-frame-bold",

    schema: {
        content: {
            title: "Featured Videos",
            categoryIds: [] as string[],
            limit: 5,
            columnsDesktop: 4,
            columnsTablet: 2,
            columnsMobile: 1,
            showCategory: "true",
            showLink: "true",
            showExcerpt: "true",
            showLeadPlayIcon: "true",
            showGridPlayIcon: "true",
        },
        style: {
            titleColor: "",
            activeTabColor: "#dc2626",
            activeTabTextColor: "#ffffff",
            box0BgColor: "",
            box1BgColor: "",
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
                        <NumberControl label="Total Limit" value={value ?? 5} onChange={onChange} min={2} max={24} />
                    ),
                },
                {
                    name: "columnsDesktop",
                    render: (value: any, onChange: any) => (
                        <NumberControl label="Grid Desktop Columns" value={value ?? 4} onChange={onChange} min={1} max={6} />
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
                        <Toggle label="Show Lead Excerpt" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
            ],
        },
        {
            tab: "Layout",
            section: "Video Play Icons",
            controls: [
                {
                    name: "showLeadPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Top Lead Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
                    ),
                },
                {
                    name: "showGridPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Grid Cards Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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

    render: (element: any) => <Youtube1CanvasPreview element={element} />,
};

export default Youtube1Element;
