import connectDB from "@/lib/mongodb";
import Setting from "@/models/settings";

export interface VideoItem {
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    thumbnails?: {
        default?: string;
        medium?: string;
        high?: string;
        maxres?: string;
    };
    channelTitle: string;
    channelId?: string;
    publishedAt?: string;
    tags?: string[];
    duration?: string;
    url: string;
}

export function extractVideoId(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return "";

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

export function extractChannelIdentifier(input: string): { type: "id" | "handle" | "custom" | "user"; value: string } {
    let clean = input.trim();

    if (/^UC[a-zA-Z0-9_-]{22}$/.test(clean)) {
        return { type: "id", value: clean };
    }

    if (clean.startsWith("@")) {
        return { type: "handle", value: clean.replace(/^@/, "") };
    }

    try {
        const url = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
        const path = url.pathname.replace(/^\/+|\/+$/g, "");
        const parts = path.split("/");

        if (parts[0] === "channel" && parts[1]) {
            return { type: "id", value: parts[1] };
        }
        if (parts[0].startsWith("@")) {
            return { type: "handle", value: parts[0].replace(/^@/, "") };
        }
        if (parts[0] === "c" && parts[1]) {
            return { type: "custom", value: parts[1] };
        }
        if (parts[0] === "user" && parts[1]) {
            return { type: "user", value: parts[1] };
        }
        if (parts[0]) {
            return { type: "handle", value: parts[0].replace(/^@/, "") };
        }
    } catch {
        // Not a valid URL format
    }

    return { type: "handle", value: clean.replace(/^@/, "") };
}

/**
 * Fetch API keys from settings table (or env fallback)
 */
export async function getActiveApiKeys(): Promise<string[]> {
    try {
        await connectDB();
        const settingDoc = await Setting.findOne({ title: "youtube_api_keys" }).lean();
        let keys: string[] = [];

        if (settingDoc && settingDoc.content) {
            if (Array.isArray(settingDoc.content)) {
                keys = settingDoc.content
                    .map((item: any) => (typeof item === "string" ? item.trim() : (item?.key || "").trim()))
                    .filter(Boolean);
            } else if (typeof settingDoc.content === "string") {
                try {
                    const parsed = JSON.parse(settingDoc.content);
                    if (Array.isArray(parsed)) {
                        keys = parsed
                            .map((item: any) => (typeof item === "string" ? item.trim() : (item?.key || "").trim()))
                            .filter(Boolean);
                    } else if (typeof parsed === "string") {
                        keys = parsed.split(/[\n,]+/).map((k: string) => k.trim()).filter(Boolean);
                    }
                } catch {
                    keys = settingDoc.content.split(/[\n,]+/).map((k: string) => k.trim()).filter(Boolean);
                }
            }
        }

        if (keys.length === 0) {
            // Also check single key fallback in setting
            const singleKeyDoc = await Setting.findOne({ title: "youtube_api_key" }).lean();
            if (singleKeyDoc && typeof singleKeyDoc.content === "string" && singleKeyDoc.content.trim()) {
                keys.push(singleKeyDoc.content.trim());
            }
        }

        if (keys.length === 0 && process.env.YOUTUBE_API_KEY) {
            keys.push(process.env.YOUTUBE_API_KEY.trim());
        }

        return keys;
    } catch {
        return process.env.YOUTUBE_API_KEY ? [process.env.YOUTUBE_API_KEY.trim()] : [];
    }
}

/**
 * Call YouTube Data API v3 with automatic key rotation
 */
export async function callYoutubeApi<T>(
    endpoint: string,
    params: Record<string, string>,
    specificKey?: string
): Promise<{ data?: T; error?: string }> {
    const keys = specificKey ? [specificKey] : await getActiveApiKeys();

    if (keys.length === 0) {
        return { error: "No YouTube API key found. Please save your API key in YouTube Settings." };
    }

    let lastError = "";

    for (const key of keys) {
        try {
            const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                    url.searchParams.set(k, v);
                }
            });
            url.searchParams.set("key", key);

            const res = await fetch(url.toString(), {
                headers: { Accept: "application/json" },
                cache: "no-store",
            });

            const json = await res.json();

            if (res.ok) {
                return { data: json as T };
            }

            const errObj = json?.error;
            const message = errObj?.message || `HTTP ${res.status}`;
            const reason = errObj?.errors?.[0]?.reason || "";

            lastError = `YouTube API Error (${reason || res.status}): ${message}`;

            if (reason === "quotaExceeded" || reason === "rateLimitExceeded" || res.status === 403) {
                console.warn(`[YouTube Plugin] API key ${key.slice(0, 8)}... exhausted quota. Trying next key...`);
                continue;
            }
        } catch (err: any) {
            lastError = err.message || "Network request failed";
        }
    }

    return { error: lastError || "Failed to execute YouTube API call across configured keys" };
}

export function getBestThumbnail(thumbnails?: any, videoId?: string): string {
    if (!thumbnails) {
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
    }
    return (
        thumbnails.maxres?.url ||
        thumbnails.standard?.url ||
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url ||
        (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "")
    );
}

/**
 * Fetch a single video details
 */
export async function fetchSingleVideo(videoIdOrUrl: string, specificKey?: string): Promise<{ video?: VideoItem; error?: string }> {
    const videoId = extractVideoId(videoIdOrUrl);
    if (!videoId) {
        return { error: "Invalid YouTube Video ID or URL" };
    }

    const { data, error } = await callYoutubeApi<any>("videos", {
        part: "snippet,contentDetails,statistics",
        id: videoId,
    }, specificKey);

    if (error || !data) {
        // Fallback: oEmbed
        try {
            const oEmbedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (oEmbedRes.ok) {
                const oEmbed = await oEmbedRes.json();
                return {
                    video: {
                        videoId,
                        title: oEmbed.title || `YouTube Video ${videoId}`,
                        description: "",
                        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                        channelTitle: oEmbed.author_name || "",
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                    },
                };
            }
        } catch { /* ignore */ }
        return { error: error || "Video not found on YouTube" };
    }

    const item = data.items?.[0];
    if (!item) {
        return { error: "Video not found on YouTube" };
    }

    const snippet = item.snippet || {};
    const bestThumb = getBestThumbnail(snippet.thumbnails, videoId);

    return {
        video: {
            videoId,
            title: snippet.title || "",
            description: snippet.description || "",
            thumbnailUrl: bestThumb,
            thumbnails: {
                default: snippet.thumbnails?.default?.url,
                medium: snippet.thumbnails?.medium?.url,
                high: snippet.thumbnails?.high?.url,
                maxres: snippet.thumbnails?.maxres?.url,
            },
            channelTitle: snippet.channelTitle || "",
            channelId: snippet.channelId || "",
            publishedAt: snippet.publishedAt || "",
            tags: snippet.tags || [],
            duration: item.contentDetails?.duration || "",
            url: `https://www.youtube.com/watch?v=${videoId}`,
        },
    };
}

/**
 * Search videos by keyword (maximum results)
 */
export async function searchVideosByKeyword(
    keyword: string,
    maxResults: number = 50,
    pageToken?: string,
    specificKey?: string
): Promise<{ videos?: VideoItem[]; nextPageToken?: string; totalResults?: number; error?: string }> {
    if (!keyword || !keyword.trim()) {
        return { error: "Please enter a search keyword" };
    }

    const limit = Math.min(Math.max(1, maxResults), 50);

    const { data, error } = await callYoutubeApi<any>("search", {
        part: "snippet",
        q: keyword.trim(),
        type: "video",
        maxResults: limit.toString(),
        ...(pageToken ? { pageToken } : {}),
    }, specificKey);

    if (error || !data) {
        return { error };
    }

    const items: any[] = data.items || [];
    const videos: VideoItem[] = items.map((item) => {
        const vid = item.id?.videoId || "";
        const snip = item.snippet || {};
        return {
            videoId: vid,
            title: snip.title || "",
            description: snip.description || "",
            thumbnailUrl: getBestThumbnail(snip.thumbnails, vid),
            thumbnails: {
                default: snip.thumbnails?.default?.url,
                medium: snip.thumbnails?.medium?.url,
                high: snip.thumbnails?.high?.url,
                maxres: snip.thumbnails?.maxres?.url,
            },
            channelTitle: snip.channelTitle || "",
            channelId: snip.channelId || "",
            publishedAt: snip.publishedAt || "",
            url: `https://www.youtube.com/watch?v=${vid}`,
        };
    });

    return {
        videos,
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo?.totalResults,
    };
}

/**
 * Fetch all/latest videos from a channel
 */
export async function fetchChannelVideos(
    channelInput: string,
    maxResults: number = 50,
    pageToken?: string,
    specificKey?: string
): Promise<{ videos?: VideoItem[]; channelInfo?: { id: string; title: string; customUrl?: string; thumbnail?: string }; nextPageToken?: string; error?: string }> {
    const ident = extractChannelIdentifier(channelInput);
    if (!ident.value) {
        return { error: "Invalid Channel ID, handle, or URL" };
    }

    let channelId = "";
    let uploadsPlaylistId = "";
    let channelTitle = "";
    let channelThumb = "";

    const channelParams: Record<string, string> = {
        part: "snippet,contentDetails",
    };

    if (ident.type === "id") {
        channelParams.id = ident.value;
    } else if (ident.type === "handle") {
        channelParams.forHandle = ident.value;
    } else if (ident.type === "user") {
        channelParams.forUsername = ident.value;
    } else {
        channelParams.forHandle = ident.value;
    }

    let chRes = await callYoutubeApi<any>("channels", channelParams, specificKey);

    if ((!chRes.data || !chRes.data.items?.length) && ident.type !== "id") {
        const searchCh = await callYoutubeApi<any>("search", {
            part: "snippet",
            q: ident.value,
            type: "channel",
            maxResults: "1",
        }, specificKey);
        if (searchCh.data?.items?.[0]?.id?.channelId) {
            channelId = searchCh.data.items[0].id.channelId;
            chRes = await callYoutubeApi<any>("channels", {
                part: "snippet,contentDetails",
                id: channelId,
            }, specificKey);
        }
    }

    if (chRes.data?.items?.[0]) {
        const ch = chRes.data.items[0];
        channelId = ch.id;
        channelTitle = ch.snippet?.title || "";
        channelThumb = ch.snippet?.thumbnails?.default?.url || "";
        uploadsPlaylistId = ch.contentDetails?.relatedPlaylists?.uploads || "";
    } else if (ident.type === "id") {
        channelId = ident.value;
        uploadsPlaylistId = channelId.startsWith("UC") ? `UU${channelId.slice(2)}` : "";
    }

    if (uploadsPlaylistId) {
        const limit = Math.min(Math.max(1, maxResults), 50);
        const plRes = await callYoutubeApi<any>("playlistItems", {
            part: "snippet,contentDetails",
            playlistId: uploadsPlaylistId,
            maxResults: limit.toString(),
            ...(pageToken ? { pageToken } : {}),
        }, specificKey);

        if (plRes.data?.items) {
            const videos: VideoItem[] = plRes.data.items.map((item: any) => {
                const vid = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || "";
                const snip = item.snippet || {};
                return {
                    videoId: vid,
                    title: snip.title || "",
                    description: snip.description || "",
                    thumbnailUrl: getBestThumbnail(snip.thumbnails, vid),
                    thumbnails: {
                        default: snip.thumbnails?.default?.url,
                        medium: snip.thumbnails?.medium?.url,
                        high: snip.thumbnails?.high?.url,
                        maxres: snip.thumbnails?.maxres?.url,
                    },
                    channelTitle: snip.channelTitle || channelTitle,
                    channelId: channelId || snip.channelId,
                    publishedAt: snip.publishedAt || "",
                    url: `https://www.youtube.com/watch?v=${vid}`,
                };
            });

            return {
                videos,
                channelInfo: {
                    id: channelId,
                    title: channelTitle,
                    thumbnail: channelThumb,
                },
                nextPageToken: plRes.data.nextPageToken,
            };
        }
    }

    if (channelId) {
        const searchRes = await callYoutubeApi<any>("search", {
            part: "snippet",
            channelId,
            type: "video",
            order: "date",
            maxResults: Math.min(maxResults, 50).toString(),
            ...(pageToken ? { pageToken } : {}),
        }, specificKey);

        if (searchRes.data?.items) {
            const videos: VideoItem[] = searchRes.data.items.map((item: any) => {
                const vid = item.id?.videoId || "";
                const snip = item.snippet || {};
                return {
                    videoId: vid,
                    title: snip.title || "",
                    description: snip.description || "",
                    thumbnailUrl: getBestThumbnail(snip.thumbnails, vid),
                    thumbnails: {
                        default: snip.thumbnails?.default?.url,
                        medium: snip.thumbnails?.medium?.url,
                        high: snip.thumbnails?.high?.url,
                        maxres: snip.thumbnails?.maxres?.url,
                    },
                    channelTitle: snip.channelTitle || channelTitle,
                    channelId,
                    publishedAt: snip.publishedAt || "",
                    url: `https://www.youtube.com/watch?v=${vid}`,
                };
            });

            return {
                videos,
                channelInfo: {
                    id: channelId,
                    title: channelTitle,
                    thumbnail: channelThumb,
                },
                nextPageToken: searchRes.data.nextPageToken,
            };
        }
    }

    return { error: chRes.error || "Failed to find channel videos" };
}
