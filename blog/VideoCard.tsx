"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

interface VideoCardProps {
    data: {
        _id: string;
        title: string;
        slug: string;
        createdAt?: string;
        info?: Record<string, string>;
    };
    postUrl: string;
    horizontal?: boolean;
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

function getThumbnail(info?: Record<string, string>, videoId?: string): string {
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

export default function VideoCard({ data, postUrl, horizontal = true }: VideoCardProps) {
    const rawYoutube = data.info?.youtube || data.info?.youtubeId || data.info?.youtubeUrl || "";
    const videoId = extractVideoId(rawYoutube);
    const thumbnail = getThumbnail(data.info, videoId);
    const authorName = data.info?.author || data.info?.channelTitle || data.info?.userName || "YouTube Video";

    const formattedDate = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : null;

    if (horizontal) {
        return (
            <Link
                href={postUrl}
                className="group flex gap-3 p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
            >
                {/* 16:9 Thumbnail preview on left */}
                <div className="relative w-40 sm:w-44 aspect-video rounded-lg overflow-hidden bg-gray-900 shrink-0 border border-gray-200/80 shadow-2xs">
                    {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={thumbnail}
                            alt={data.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                            <Icon icon="akar-icons:youtube-fill" className="w-8 h-8" />
                        </div>
                    )}
                    {/* Center Play Icon */}
                    {videoId && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <Icon icon="solar:play-bold" className="w-4 h-4 ml-0.5" />
                            </div>
                        </div>
                    )}

                    {/* YouTube badge or duration overlay */}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold flex items-center gap-1">
                        {videoId ? (
                            <>
                                <Icon icon="akar-icons:youtube-fill" className="text-red-500 w-3 h-3" />
                                <span>VIDEO</span>
                            </>
                        ) : (
                            <span>ARTICLE</span>
                        )}
                    </div>
                </div>

                {/* Video Info on right */}
                <div className="flex-1 min-w-0 flex flex-col justify-start py-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors">
                        {data.title}
                    </h3>
                    <div className="text-[11px] text-gray-500 mt-1 truncate">{authorName}</div>
                    {formattedDate && (
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <span>{formattedDate}</span>
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={postUrl}
            className="group flex flex-col gap-2 p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
        >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-200/80 shadow-2xs">
                {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={thumbnail}
                        alt={data.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                        <Icon icon="akar-icons:youtube-fill" className="w-10 h-10" />
                    </div>
                )}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold flex items-center gap-1">
                    {videoId ? (
                        <>
                            <Icon icon="akar-icons:youtube-fill" className="text-red-500 w-3 h-3" />
                            <span>VIDEO</span>
                        </>
                    ) : (
                        <span>ARTICLE</span>
                    )}
                </div>
            </div>

            <div className="pt-1">
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors">
                    {data.title}
                </h3>
                <div className="text-xs text-gray-500 mt-1">{authorName}</div>
                {formattedDate && <div className="text-[11px] text-gray-400 mt-0.5">{formattedDate}</div>}
            </div>
        </Link>
    );
}
