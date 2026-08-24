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

export interface Youtube3Props {
    title?: string;
    categoryIds?: string[];
    tabs?: Tab[];
    postsByCategory?: Record<string, TabPost[]>;
    limit?: number;
    columnsDesktop?: number;
    columnsTablet?: number;
    columnsMobile?: number;
    colors?: YoutubeColors;
    showCategory?: boolean;
    showLink?: boolean;
    showPlayIcon?: boolean;
}

export function Youtube3UI({
    title = "",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 8,
    columnsDesktop = 4,
    columnsTablet = 2,
    columnsMobile = 1,
    colors = {},
    showCategory = true,
    showLink = true,
    showPlayIcon = true,
}: Youtube3Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const deskCols = Number(columnsDesktop) || 4;
    const tabCols = Number(columnsTablet) || 2;
    const mobCols = Number(columnsMobile) || 1;

    const gridClass = `grid grid-cols-${mobCols} md:grid-cols-${tabCols} lg:grid-cols-${deskCols} gap-4 sm:gap-6`;

    return (
        <div className="w-full flex flex-col gap-5">
            <YoutubeHeader
                title={title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            <div className={gridClass}>
                {posts.map((post) => (
                    <article key={post._id} className="group flex flex-col w-full">
                        <a
                            href={showLink ? (post.postUrl || "#") : "#"}
                            className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xs block"
                        >
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
                            {showPlayIcon && (post.videoId || post.duration || post.image) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <Icon icon="solar:play-bold" className="w-5 h-5 ml-0.5" />
                                    </div>
                                </div>
                            )}

                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-white text-[11px] font-bold font-mono tracking-tight shadow-sm">
                                {post.duration || (post.videoId ? "VIDEO" : "ARTICLE")}
                            </div>
                        </a>

                        <div className="flex gap-2.5 pt-3">
                            <div className="flex-1 min-w-0">
                                
                                <a
                                    href={showLink ? (post.postUrl || "#") : "#"}
                                    className="text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors"
                                >
                                    {post.title}
                                </a>

                                <div className="text-xs text-gray-500 mt-1 flex items-center justify-between gap-0.5">
                                    {showCategory && post.categoryTitle && (
                                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-0.5">
                                            {post.categoryTitle}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

function Youtube3CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 8;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 3...</span>
            </div>
        );
    }

    return (
        <Youtube3UI
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
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showPlayIcon={c.showPlayIcon !== "false"}
        />
    );
}

const Youtube3Element = {
    type: "youtube-3",
    category: "youtube",
    label: "Classic 4-Column Feed",
    icon: "solar:widget-add-bold",

    schema: {
        content: {
            title: "Latest Videos",
            categoryIds: [] as string[],
            limit: 8,
            columnsDesktop: 4,
            columnsTablet: 2,
            columnsMobile: 1,
            showCategory: "true",
            showLink: "true",
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
                        <NumberControl label="Total Limit" value={value ?? 8} onChange={onChange} min={2} max={24} />
                    ),
                },
                {
                    name: "columnsDesktop",
                    render: (value: any, onChange: any) => (
                        <NumberControl label="Desktop Columns" value={value ?? 4} onChange={onChange} min={1} max={6} />
                    ),
                },
                {
                    name: "showCategory",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Category" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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

    render: (element: any) => <Youtube3CanvasPreview element={element} />,
};

export default Youtube3Element;
