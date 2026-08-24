"use client";

import { useState, useEffect } from "react";
import type { FieldProps } from "@/hook";
import { Icon } from "@iconify/react";

function extractVideoId(input: string): string {
    const trimmed = (input || "").trim();
    if (!trimmed) return "";

    // If input is a JSON string (e.g. {"videoId":"AvHW9svIZ3Y", ...})
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed.videoId) return parsed.videoId;
            if (parsed.id) return parsed.id;
        } catch { /* ignore */ }
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
        return watchMatch[1];
    }

    const paramMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (paramMatch && paramMatch[1]) {
        return paramMatch[1];
    }

    return trimmed;
}

export default function YoutubeField({ name, label = "YouTube", value = "", onChange }: FieldProps) {
    const rawId = extractVideoId(value);
    const [inputValue, setInputValue] = useState(rawId);

    useEffect(() => {
        const clean = extractVideoId(value);
        setInputValue(clean);
    }, [value]);

    const handleInputChange = (val: string) => {
        const clean = extractVideoId(val);
        setInputValue(clean || val);
        onChange(clean || val.trim());
    };

    const hasVideo = Boolean(inputValue && inputValue.trim());

    return (
        <div className="flex flex-col gap-1.5 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
                <label htmlFor={name} className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    <Icon icon="logos:youtube-icon" className="w-4 h-4" />
                    {label}
                </label>
                {hasVideo && (
                    <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        ID: {inputValue}
                    </span>
                )}
            </div>

            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Enter YouTube Video ID (e.g. AvHW9svIZ3Y)"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 focus:bg-white px-3 py-2 text-xs outline-none transition focus:border-red-500 font-mono"
                />
                {hasVideo && (
                    <button
                        type="button"
                        onClick={() => handleInputChange("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 text-xs"
                    >
                        <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* If video ID exists, show simple preview link/player */}
            {hasVideo && (
                <div className="mt-1 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="truncate font-mono text-[10px]">https://youtu.be/{inputValue}</span>
                    <a
                        href={`https://www.youtube.com/watch?v=${inputValue}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:underline flex items-center gap-1 font-semibold shrink-0"
                    >
                        Watch <Icon icon="solar:arrow-right-up-linear" className="w-3 h-3" />
                    </a>
                </div>
            )}
        </div>
    );
}
