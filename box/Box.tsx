"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import Image from "next/image";

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

export default function YoutubeBox({ data, postUrl }: BlogBoxProps) {
    const rawYoutube = data.info?.youtube || "";
    const videoId = extractVideoId(rawYoutube);
    const image = data.info?.images
        ? (() => {
              try {
                  const a = JSON.parse(data.info.images);
                  return Array.isArray(a) ? a[0] : "";
              } catch {
                  return "";
              }
          })()
        : "";
    const thumbnail = image || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");

    return (
        <article className="group flex flex-col w-full cursor-pointer space-y-2">
            {/* 16:9 Thumbnail Stage with Duration Badge */}
            <Link
                href={postUrl}
                className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-2xs block"
            >
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        width={300}
                        height={300}
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
                {videoId && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/30 group-hover:bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Icon icon="solar:play-bold" className="w-5 h-5 ml-0.5" />
                        </div>
                    </div>
                )}
            </Link>

            {/* Video Details & Meta */}
            <div className="flex-1 min-w-0">
                <Link
                    href={postUrl}
                    className="text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors"
                >
                    {data.title}
                </Link>
            </div>
        </article>
    );
}
