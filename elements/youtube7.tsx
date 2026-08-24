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

export interface Youtube7Props {
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

export function Youtube7UI({
    title = "Shorts & Quick Clips",
    categoryIds = [],
    tabs = [],
    postsByCategory = {},
    limit = 6,
    columnsDesktop = 6,
    columnsTablet = 3,
    columnsMobile = 2,
    colors = {},
    showCategory = true,
    showLink = true,
    showPlayIcon = true,
}: Youtube7Props) {
    const [activeTab, setActiveTab] = useState<string>(tabs[0]?._id ?? "");

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((t) => t._id === activeTab)) {
            setActiveTab(tabs[0]._id);
        }
    }, [tabs, activeTab]);

    const allPosts = getDisplayPosts(postsByCategory, activeTab, categoryIds, tabs[0]?._id);
    const posts = limit ? allPosts.slice(0, Number(limit)) : allPosts;

    const deskCols = Number(columnsDesktop) || 6;
    const tabCols = Number(columnsTablet) || 3;
    const mobCols = Number(columnsMobile) || 2;

    const gridClass = `grid grid-cols-${mobCols} md:grid-cols-${tabCols} lg:grid-cols-${deskCols} gap-3 sm:gap-4`;

    return (
        <div className="w-full flex flex-col gap-4">
            <YoutubeHeader
                title={title}
                titleIcon="solar:bolt-bold"
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                colors={colors}
            />

            <div className={gridClass}>
                {posts.map((post) => (
                    <a
                        key={post._id}
                        href={showLink ? (post.postUrl || "#") : "#"}
                        className="group relative flex flex-col rounded overflow-hidden aspect-9/16 shadow-md transition-all hover:scale-[1.02]"
                    >
                        {post.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
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
                                <div className="w-10 h-10 rounded-full bg-black/20 group-hover:bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Icon icon="solar:play-bold" className="w-5 h-5 ml-0.5" />
                                </div>
                            </div>
                        )}

                        {/* Top Shorts Icon */}
                        {showPlayIcon && (post.videoId || post.duration) && (
                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                                <Icon icon="solar:bolt-bold" className="w-3 h-3" />
                                <span>SHORTS</span>
                            </div>
                        )}

                        {/* Bottom Gradient Overlay & Title */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end">
                            <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
                                {post.title}
                            </h3>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

function Youtube7CanvasPreview({ element }: { element: any }) {
    const c = { ...element.schema?.content, ...element.content };
    const s = { ...element.schema?.style, ...element.style };
    const categoryIds: string[] = c.categoryIds ?? [];
    const limit = Number(c.limit) || 6;
    const { tabs, postsByCategory, loading } = useYoutubePosts(categoryIds, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={20} />
                <span className="text-xs">Loading YouTube 7...</span>
            </div>
        );
    }

    return (
        <Youtube7UI
            title={c.title ?? "Shorts & Quick Clips"}
            categoryIds={categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            columnsDesktop={Number(c.columnsDesktop) || 6}
            columnsTablet={Number(c.columnsTablet) || 3}
            columnsMobile={Number(c.columnsMobile) || 2}
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

const Youtube7Element = {
    type: "youtube-7",
    category: "youtube",
    label: "Shorts 9:16 Vertical Grid",
    icon: "solar:smartphone-2-bold",

    schema: {
        content: {
            title: "Shorts & Quick Clips",
            categoryIds: [] as string[],
            limit: 6,
            columnsDesktop: 6,
            columnsTablet: 3,
            columnsMobile: 2,
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
                        <NumberControl label="Total Limit" value={value ?? 6} onChange={onChange} min={2} max={18} />
                    ),
                },
                {
                    name: "columnsDesktop",
                    render: (value: any, onChange: any) => (
                        <NumberControl label="Desktop Columns" value={value ?? 6} onChange={onChange} min={2} max={8} />
                    ),
                },
                {
                    name: "showPlayIcon",
                    render: (value: any, onChange: any) => (
                        <Toggle label="Show Shorts Play Icon" value={value !== "false"} onChange={(v: boolean) => onChange(v ? "true" : "false")} />
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

    render: (element: any) => <Youtube7CanvasPreview element={element} />,
};

export default Youtube7Element;
