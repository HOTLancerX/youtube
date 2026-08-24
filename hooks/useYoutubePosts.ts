"use client";

import { useState, useEffect } from "react";
import { xFetch } from "@/lib/express";
import { Tab, TabPost } from "../lib/types";

const parsePostDate = (dateVal: any): number => {
    if (!dateVal) return 0;
    const t = new Date(dateVal).getTime();
    return isNaN(t) ? 0 : t;
};

export const sortPostsLatestFirst = (postsList: TabPost[]): TabPost[] => {
    return [...postsList].sort((a, b) => {
        const timeA = parsePostDate(a.createdAt);
        const timeB = parsePostDate(b.createdAt);
        if (timeA !== timeB) {
            return timeB - timeA;
        }
        return 0;
    });
};

function extractImage(info?: any): string {
    if (!info) return "";
    if (info.images) {
        try {
            const parsed = JSON.parse(info.images);
            if (Array.isArray(parsed) && parsed[0]) return parsed[0];
            if (typeof parsed === "string" && parsed) return parsed;
        } catch {
            if (typeof info.images === "string" && info.images.startsWith("http")) return info.images;
        }
    }
    if (info.image) return info.image;
    if (info.youtube || info.youtubeId) {
        const vid = info.youtube || info.youtubeId;
        return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
    }
    return "";
}

function extractVideoId(info?: any): string {
    if (!info) return "";
    const raw = info.youtube || info.youtubeId || info.youtubeUrl || "";
    if (!raw) return "";
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
    const match = raw.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (match && match[1]) return match[1];
    return "";
}

export function getDisplayPosts(
    postsByCategory: Record<string, TabPost[]> = {},
    activeTab: string = "",
    categoryIds?: string[],
    defaultFirstTabId: string = ""
): TabPost[] {
    let rawPosts: TabPost[] = [];
    if ((!categoryIds || categoryIds.length === 0) && (!activeTab || activeTab === defaultFirstTabId)) {
        const combined = Object.values(postsByCategory).flat();
        const uniqueMap = new Map<string, TabPost>();
        combined.forEach((p) => {
            if (p && p._id && !uniqueMap.has(p._id)) {
                uniqueMap.set(p._id, p);
            }
        });
        rawPosts = Array.from(uniqueMap.values());
    } else {
        rawPosts = postsByCategory[activeTab] ?? Object.values(postsByCategory)[0] ?? [];
    }

    return sortPostsLatestFirst(rawPosts);
}

export function useYoutubePosts(categoryIds: string[] = [], limit: number = 8) {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [postsByCategory, setPostsByCategory] = useState<Record<string, TabPost[]>>({});
    const [allPosts, setAllPosts] = useState<TabPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        xFetch("/builder-post/cats?type=blog-category")
            .then((r) => r.json())
            .then(async (data) => {
                const allCats: { _id: string; title: string; slug: string }[] = data.cats ?? [];
                const fetchCats = categoryIds && categoryIds.length
                    ? categoryIds.map((id) => allCats.find((cat) => cat._id === id)).filter(Boolean)
                    : allCats;

                const orderedTabs: Tab[] = categoryIds && categoryIds.length
                    ? categoryIds.map((id) => allCats.find((cat) => cat._id === id)).filter(Boolean).map((cat) => ({ _id: cat!._id, title: cat!.title, url: `/${cat!.slug}` }))
                    : [];

                setTabs(orderedTabs);
                const safeLimit = Math.min(Math.max(1, Number(limit) || 8), 50);
                const results = await Promise.all(
                    fetchCats.map((cat) => {
                        const catId = cat!._id;
                        const params = new URLSearchParams({ type: "blog", limit: String(safeLimit), cats: catId });
                        return xFetch(`/builder-post?${params}`)
                            .then((r) => r.json())
                            .then((d) => ({
                                id: catId,
                                posts: sortPostsLatestFirst(
                                    ((d.posts ?? []) as any[]).slice(0, safeLimit).map((p): TabPost => ({
                                        _id: p._id,
                                        title: p.title,
                                        slug: p.slug,
                                        postUrl: p.postUrl,
                                        categoryTitle: p.categoryTitle,
                                        categoryUrl: p.categoryUrl,
                                        createdAt: p.createdAt,
                                        image: extractImage(p.info),
                                        excerpt: p.info?.description || p.info?.excerpt || "",
                                        duration: p.info?.duration,
                                        videoId: extractVideoId(p.info),
                                        author: p.info?.author || p.info?.channelTitle || p.info?.userName,
                                    }))
                                ),
                            }))
                            .catch(() => ({ id: catId, posts: [] as TabPost[] }));
                    })
                );

                const map: Record<string, TabPost[]> = {};
                const combinedMap = new Map<string, TabPost>();

                for (const { id, posts } of results) {
                    map[id] = posts;
                    for (const p of posts) {
                        if (p && p._id && !combinedMap.has(p._id)) {
                            combinedMap.set(p._id, p);
                        }
                    }
                }

                if (!categoryIds || categoryIds.length === 0) {
                    try {
                        const globalRes = await xFetch(`/builder-post?type=blog&limit=${safeLimit}`);
                        const globalData = await globalRes.json();
                        const globalPosts: TabPost[] = ((globalData.posts ?? []) as any[]).map((p): TabPost => ({
                            _id: p._id,
                            title: p.title,
                            slug: p.slug,
                            postUrl: p.postUrl,
                            categoryTitle: p.categoryTitle,
                            categoryUrl: p.categoryUrl,
                            createdAt: p.createdAt,
                            image: extractImage(p.info),
                            excerpt: p.info?.description || p.info?.excerpt || "",
                            duration: p.info?.duration,
                            videoId: extractVideoId(p.info),
                            author: p.info?.author || p.info?.channelTitle || p.info?.userName,
                        }));
                        for (const p of globalPosts) {
                            if (p && p._id && !combinedMap.has(p._id)) {
                                combinedMap.set(p._id, p);
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching global latest posts:", err);
                    }
                }

                const sortedCombined = sortPostsLatestFirst(Array.from(combinedMap.values()));
                setPostsByCategory(map);
                setAllPosts(sortedCombined);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [JSON.stringify(categoryIds), limit]);

    return { tabs, postsByCategory, allPosts, loading };
}
