"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

interface BlogBoxProps {
    data: {
        _id: string;
        title: string;
        slug: string;
        status: string;
        createdAt?: string;
        info: Record<string, string>;
    };
    postUrl: string;
}

function extractVideoId(input?: string): string {
    if (!input) return "";
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }
    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) return watchMatch[1];
    return "";
}

function getImage(info?: Record<string, string>, videoId?: string): string {
    if (info?.images) {
        try {
            const parsed = JSON.parse(info.images);
            if (Array.isArray(parsed) && parsed[0]) return parsed[0];
            if (typeof parsed === "string" && parsed) return parsed;
        } catch {
            if (info.images.startsWith("http")) return info.images;
        }
    }
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return "";
}

function formatDuration(isoDuration?: string): string {
    if (!isoDuration) return "";
    if (!isoDuration.startsWith("PT")) return isoDuration;

    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";

    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);

    const pad = (n: number) => n.toString().padStart(2, "0");

    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${minutes}:${pad(seconds)}`;
}

function timeAgo(dateString?: string): string {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    if (isNaN(diffMs)) return "";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    return "just now";
}

export default function YoutubeBox({ data, postUrl }: BlogBoxProps) {
    const rawYoutube = data.info?.youtube || data.info?.youtubeId || data.info?.youtubeUrl || "";
    const videoId = extractVideoId(rawYoutube);
    const thumbnail = getImage(data.info, videoId);
    const duration = formatDuration(data.info?.duration);
    const authorName = data.info?.author || data.info?.channelTitle || data.info?.userName || "";
    const views = data.info?.views || data.info?.viewCount;
    const timeText = timeAgo(data.createdAt);

    return (
        <article className="group flex flex-col w-full cursor-pointer">
            {/* 16:9 Thumbnail Stage with Duration Badge */}
            <Link
                href={postUrl}
                className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 shadow-2xs block"
            >
                {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={thumbnail}
                        alt={data.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
                        <Icon icon="akar-icons:youtube-fill" className="w-12 h-12 text-red-600" />
                    </div>
                )}

                {/* Center Video Play Icon */}
                {(videoId || rawYoutube) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Icon icon="solar:play-bold" className="w-5 h-5 ml-0.5" />
                        </div>
                    </div>
                )}

                {/* Duration Badge / YouTube Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-white text-[11px] font-bold font-mono tracking-tight flex items-center gap-1 shadow-sm">
                    {duration ? (
                        <span>{duration}</span>
                    ) : videoId ? (
                        <span className="flex items-center gap-1">
                            <Icon icon="akar-icons:youtube-fill" className="text-red-500 w-3 h-3" />
                            <span>VIDEO</span>
                        </span>
                    ) : (
                        <span>ARTICLE</span>
                    )}
                </div>
            </Link>

            {/* Video Details & Meta */}
            <div className="flex gap-2.5 pt-3">
                <div className="flex-1 min-w-0">
                    <Link
                        href={postUrl}
                        className="text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors"
                    >
                        {data.title}
                    </Link>

                    <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                        {authorName && <span className="truncate font-medium hover:text-gray-700">{authorName}</span>}
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            {views && (
                                <>
                                    <span>{views} views</span>
                                    <span>•</span>
                                </>
                            )}
                            {timeText && <span>{timeText}</span>}
                        </div>
                    </div>
                </div>

                {/* YouTube 3-Dot Action Icon */}
                <div className="text-gray-400 hover:text-gray-700 p-1 shrink-0 self-start">
                    <Icon icon="solar:menu-dots-vertical-bold" className="w-4 h-4" />
                </div>
            </div>
        </article>
    );
}
