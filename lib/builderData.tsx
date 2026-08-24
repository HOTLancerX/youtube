/**
 * plugin/youtube/lib/builderData.tsx
 *
 * SERVER-ONLY. Registers server-side renderers for YouTube elements 1 through 10.
 */

import { registerBuilderElement } from "@/hook/builderDataHooks";
import { fetchEnrichedBuilderData } from "@/lib/builderDataEngine";
import { Youtube1UI } from "../elements/youtube1";
import { Youtube2UI } from "../elements/youtube2";
import { Youtube3UI } from "../elements/youtube3";
import { Youtube4UI } from "../elements/youtube4";
import { Youtube5UI } from "../elements/youtube5";
import { Youtube6UI } from "../elements/youtube6";
import { Youtube7UI } from "../elements/youtube7";
import { Youtube8UI } from "../elements/youtube8";
import { Youtube9UI } from "../elements/youtube9";
import { Youtube10UI } from "../elements/youtube10";
import { TabPost } from "./types";

function formatDuration(raw?: string): string | undefined {
    if (!raw) return undefined;
    if (raw.startsWith("PT")) {
        const match = raw.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
            const hours = parseInt(match[1] || "0", 10);
            const minutes = parseInt(match[2] || "0", 10);
            const seconds = parseInt(match[3] || "0", 10);
            const pad = (n: number) => n.toString().padStart(2, "0");
            return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
        }
    }
    return raw;
}

function extractVideoId(raw?: string): string | undefined {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (match && match[1]) return match[1];
    return undefined;
}

function mapToTabPosts(posts: any[]): TabPost[] {
    return posts.map((p) => {
        const info = p.info || {};
        const videoId = extractVideoId(info.youtube || info.youtubeId);
        const duration = formatDuration(info.duration);
        const author = p.authorName || info.author || info.channelTitle || info.userName || "YouTube Video";

        return {
            _id: p._id,
            title: p.title,
            slug: p.slug,
            postUrl: p.postUrl,
            categoryTitle: p.categoryTitle,
            categoryUrl: p.categoryUrl,
            createdAt: p.createdAt,
            image: p.image || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ""),
            excerpt: p.excerpt,
            duration,
            videoId,
            views: info.views,
            author,
        };
    });
}

async function getEnrichedData(categoryIds?: string[], limit: number = 12) {
    try {
        const res = await fetchEnrichedBuilderData({
            categoryIds: categoryIds ?? [],
            limit,
            postType: "blog",
            categoryType: "blog-category",
        });
        const mappedByCategory: Record<string, TabPost[]> = {};
        for (const key in res.postsByCategory) {
            mappedByCategory[key] = mapToTabPosts(res.postsByCategory[key] ?? []);
        }
        return { tabs: res.tabs ?? [], postsByCategory: mappedByCategory };
    } catch {
        return { tabs: [], postsByCategory: {} };
    }
}

function filterPostsByLimit(postsByCategory?: Record<string, TabPost[]>, limit?: number) {
    if (!postsByCategory || !limit) return postsByCategory ?? {};
    const result: Record<string, TabPost[]> = {};
    for (const catId in postsByCategory) {
        result[catId] = (postsByCategory[catId] ?? []).slice(0, Number(limit));
    }
    return result;
}

function getCategoryTabs(rawDataTabs: any[], categoryIds?: string[]) {
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
        return rawDataTabs ?? [];
    }
    return categoryIds
        .map((id: string) => rawDataTabs.find((t: any) => t._id === id))
        .filter(Boolean);
}

// ─── Register youtube-1 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-1", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 5;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube1UI
            title={c.title ?? ""}
            categoryIds={c.categoryIds}
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
});

// ─── Register youtube-2 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-2", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 6;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube2UI
            title={c.title ?? ""}
            categoryIds={c.categoryIds}
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
});

// ─── Register youtube-3 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-3", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 8;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube3UI
            title={c.title ?? ""}
            categoryIds={c.categoryIds}
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
});

// ─── Register youtube-4 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-4", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 6;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube4UI
            title={c.title ?? ""}
            categoryIds={c.categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            columnsDesktop={Number(c.columnsDesktop) || 3}
            columnsTablet={Number(c.columnsTablet) || 2}
            columnsMobile={Number(c.columnsMobile) || 1}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showExcerpt={c.showExcerpt !== "false"}
            showPlayIcon={c.showPlayIcon !== "false"}
        />
    );
});

// ─── Register youtube-5 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-5", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 5;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube5UI
            title={c.title ?? ""}
            categoryIds={c.categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showExcerpt={c.showExcerpt !== "false"}
            showCenterPlayIcon={c.showCenterPlayIcon !== "false"}
            showSidePlayIcon={c.showSidePlayIcon !== "false"}
        />
    );
});

// ─── Register youtube-6 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-6", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 4;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube6UI
            title={c.title ?? ""}
            categoryIds={c.categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showBannerPlayIcon={c.showBannerPlayIcon !== "false"}
            showGridPlayIcon={c.showGridPlayIcon !== "false"}
        />
    );
});

// ─── Register youtube-7 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-7", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 6;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube7UI
            title={c.title ?? "Shorts & Quick Clips"}
            categoryIds={c.categoryIds}
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
});

// ─── Register youtube-8 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-8", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 6;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube8UI
            title={c.title ?? ""}
            categoryIds={c.categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showDualPlayIcon={c.showDualPlayIcon !== "false"}
            showGridPlayIcon={c.showGridPlayIcon !== "false"}
        />
    );
});

// ─── Register youtube-9 ──────────────────────────────────────────────────────
registerBuilderElement("youtube-9", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 4;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube9UI
            title={c.title ?? "Theater Showcase"}
            categoryIds={c.categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "#ffffff",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showMainPlayIcon={c.showMainPlayIcon !== "false"}
            showSidePlayIcon={c.showSidePlayIcon !== "false"}
        />
    );
});

// ─── Register youtube-10 ─────────────────────────────────────────────────────
registerBuilderElement("youtube-10", async (schema) => {
    const c = { ...schema?.schema?.content, ...schema?.content };
    const s = { ...schema?.schema?.style, ...schema?.style };
    const limit = c.limit ? Number(c.limit) : 5;
    const rawData = await getEnrichedData(c.categoryIds, limit);
    const postsByCategory = filterPostsByLimit(rawData.postsByCategory, limit);
    const tabs = getCategoryTabs(rawData.tabs, c.categoryIds);

    return (
        <Youtube10UI
            title={c.title ?? "Video Feed"}
            categoryIds={c.categoryIds}
            tabs={tabs}
            postsByCategory={postsByCategory}
            limit={limit}
            colors={{
                active: s.activeTabColor || "#dc2626",
                activeText: s.activeTabTextColor || "#ffffff",
                title: s.titleColor || "",
            }}
            showCategory={c.showCategory !== "false"}
            showLink={c.showLink !== "false"}
            showExcerpt={c.showExcerpt !== "false"}
            showPlayIcon={c.showPlayIcon !== "false"}
        />
    );
});
