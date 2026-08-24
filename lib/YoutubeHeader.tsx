"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Tab, YoutubeColors } from "./types";

interface YoutubeHeaderProps {
    title?: string;
    titleIcon?: string;
    tabs?: Tab[];
    activeTab?: string;
    onTabChange?: (id: string) => void;
    seeMoreUrl?: string;
    seeMoreText?: string;
    seeMoreIcon?: string;
    showSeeMore?: boolean;
    colors?: YoutubeColors;
}

export function YoutubeHeader({
    title = "",
    titleIcon = "akar-icons:youtube-fill",
    tabs = [],
    activeTab = "",
    onTabChange,
    seeMoreUrl,
    seeMoreText = "See All",
    seeMoreIcon = "solar:alt-arrow-right-bold",
    showSeeMore = true,
    colors = {},
}: YoutubeHeaderProps) {
    const hasTitle = Boolean(title && title.trim().length > 0);

    if (!hasTitle) {
        return null;
    }

    const showTabs = Boolean(tabs && tabs.length >= 2);
    const displaySeeMore = showSeeMore && !showTabs;
    const targetUrl = seeMoreUrl || (tabs && tabs.length === 1 ? tabs[0].url || "#" : "#");

    const activeBg = colors.active || "#dc2626";
    const activeText = colors.activeText || "#ffffff";
    const inactiveBg = colors.inactive || "#f3f4f6";
    const inactiveText = colors.inactiveText || "#374151";
    const titleColor = colors.title || "#111827";
    const seeMoreBg = colors.iconColor || "#dc2626";
    const headerBg = colors.headerBg || undefined;

    return (
        <div
            className={`w-full flex items-center justify-between ${!headerBg ? "bg-white" : ""} rounded-xl px-4 py-2 border border-gray-200/80 shadow-2xs`}
            style={headerBg ? { backgroundColor: headerBg } : undefined}
        >
            {/* Title with YouTube Icon */}
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Icon icon={titleIcon || "akar-icons:youtube-fill"} width={18} height={18} />
                </div>
                <h3
                    className="text-lg md:text-xl font-bold tracking-tight truncate leading-none"
                    style={{ color: titleColor }}
                >
                    {title}
                </h3>
            </div>

            {/* Tabs or See More */}
            {showTabs ? (
                <div className="flex flex-wrap items-center gap-1.5 py-1">
                    {tabs.map((tab) => {
                        const isActive = tab._id === activeTab;
                        return (
                            <button
                                key={tab._id}
                                type="button"
                                onClick={() => onTabChange && onTabChange(tab._id)}
                                className="px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-2xs"
                                style={{
                                    backgroundColor: isActive ? activeBg : inactiveBg,
                                    color: isActive ? activeText : inactiveText,
                                }}
                            >
                                {tab.title}
                            </button>
                        );
                    })}
                </div>
            ) : displaySeeMore ? (
                <a
                    href={targetUrl}
                    className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shrink-0 shadow-2xs hover:brightness-110"
                    style={{ backgroundColor: seeMoreBg }}
                >
                    <span>{seeMoreText}</span>
                    <Icon icon={seeMoreIcon} width={14} height={14} />
                </a>
            ) : null}
        </div>
    );
}
