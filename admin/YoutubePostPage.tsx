"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { xFetch } from "@/lib/express";
import Link from "next/link";
import { useUser } from "@/context/Provider";
import type { VideoItem } from "../lib/youtubeService";

type ImportMode = "single" | "keyword" | "channel";

interface CatItem {
    _id: string;
    title: string;
    slug?: string;
    parentId?: string | null;
}

interface ApiKeyOption {
    key: string;
    label: string;
}

interface AnnotatedVideoItem extends VideoItem {
    alreadyImported?: boolean;
    existingPost?: {
        _id: string;
        title: string;
        slug: string;
    } | null;
}

export default function YoutubePostPage() {
    const { user: currentUser } = useUser();
    const [mode, setMode] = useState<ImportMode>("single");

    // Available API keys from settings
    const [availableApiKeys, setAvailableApiKeys] = useState<ApiKeyOption[]>([]);
    const [selectedApiKey, setSelectedApiKey] = useState<string>("");

    // Input values
    const [singleInput, setSingleInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [channelInput, setChannelInput] = useState("");
    const [maxResults, setMaxResults] = useState(25);

    // Category state
    const [categories, setCategories] = useState<CatItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [catLoading, setCatLoading] = useState(false);

    // Results state
    const [singleVideo, setSingleVideo] = useState<AnnotatedVideoItem | null>(null);
    const [videoList, setVideoList] = useState<AnnotatedVideoItem[]>([]);
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
    const [channelInfo, setChannelInfo] = useState<{ id: string; title: string; thumbnail?: string } | null>(null);

    // Single video editing before publish
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editThumbnail, setEditThumbnail] = useState("");

    // Loading & status states
    const [fetching, setFetching] = useState(false);
    const [posting, setPosting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info" | "warning"; text: string } | null>(null);
    const [createdPosts, setCreatedPosts] = useState<any[]>([]);

    // Fetch API keys and categories on mount
    useEffect(() => {
        // 1. Fetch saved API keys from Settings API
        fetch("/api/settings", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
                const keysList: ApiKeyOption[] = [];
                if (data && data.youtube_api_keys) {
                    let loaded: any[] = [];
                    if (Array.isArray(data.youtube_api_keys)) {
                        loaded = data.youtube_api_keys;
                    } else if (typeof data.youtube_api_keys === "string") {
                        try {
                            const p = JSON.parse(data.youtube_api_keys);
                            if (Array.isArray(p)) loaded = p;
                        } catch {
                            loaded = data.youtube_api_keys.split(/[\n,]+/).map((k: string) => ({ key: k.trim() }));
                        }
                    }

                    loaded.forEach((item, idx) => {
                        const k = typeof item === "string" ? item.trim() : (item?.key || "").trim();
                        const lbl = typeof item === "object" && item.label ? item.label : `API Key ${idx + 1}`;
                        if (k) keysList.push({ key: k, label: lbl });
                    });
                }

                if (keysList.length === 0 && data?.youtube_api_key && typeof data.youtube_api_key === "string" && data.youtube_api_key.trim()) {
                    keysList.push({ key: data.youtube_api_key.trim(), label: "Primary Key" });
                }

                setAvailableApiKeys(keysList);
            })
            .catch(() => setAvailableApiKeys([]));

        // 2. Fetch categories
        setCatLoading(true);
        Promise.all([
            xFetch("/cat?type=blog-category", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ cats: [] })),
            xFetch("/cat", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ cats: [] })),
        ])
            .then(([resBlog, resAll]) => {
                const combined = [...(resBlog.cats || []), ...(resAll.cats || [])];
                const map = new Map<string, CatItem>();
                combined.forEach((c: CatItem) => {
                    if (c && c._id && !map.has(c._id)) {
                        map.set(c._id, c);
                    }
                });
                const list = Array.from(map.values());
                setCategories(list);

                // Auto-detect and preselect "Select" if available
                const selectCat = list.find((c) =>
                    c.title?.toLowerCase().includes("select") || c.slug?.toLowerCase().includes("select")
                );
                if (selectCat) {
                    setSelectedCategory(selectCat._id);
                } else if (list.length > 0) {
                    setSelectedCategory(list[0]._id);
                }
            })
            .catch((err) => console.error("Error fetching categories:", err))
            .finally(() => setCatLoading(false));
    }, []);

    const getKeyParam = () => (selectedApiKey ? `&apiKey=${encodeURIComponent(selectedApiKey)}` : "");

    // ─── Mode 1: Fetch Single Video ──────────────────────────────────────────
    const handleFetchSingle = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const input = singleInput.trim();
        if (!input) {
            setFeedback({ type: "error", text: "Please enter a YouTube video URL or Video ID" });
            return;
        }

        setFetching(true);
        setFeedback(null);
        setSingleVideo(null);
        setCreatedPosts([]);

        try {
            const res = await fetch(`/api/youtube/fetch?type=single&query=${encodeURIComponent(input)}${getKeyParam()}`);
            const data = await res.json();

            if (!res.ok || !data.video) {
                setFeedback({ type: "error", text: data.error || "Failed to fetch video details" });
            } else {
                const vid: AnnotatedVideoItem = data.video;
                setSingleVideo(vid);
                setEditTitle(vid.title);
                setEditDescription(vid.description);
                setEditThumbnail(vid.thumbnailUrl);

                if (vid.alreadyImported) {
                    setFeedback({
                        type: "warning",
                        text: `This video is already in the database as "${vid.existingPost?.title || vid.title}". Duplicate posting is disabled.`,
                    });
                } else {
                    setFeedback({ type: "info", text: "Video details loaded. Select category and click Publish." });
                }
            }
        } catch (err: any) {
            setFeedback({ type: "error", text: `Network error: ${err.message}` });
        } finally {
            setFetching(false);
        }
    };

    // ─── Mode 2: Search Videos by Keyword ─────────────────────────────────────
    const handleSearchKeyword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const kw = keywordInput.trim();
        if (!kw) {
            setFeedback({ type: "error", text: "Please enter a keyword to search" });
            return;
        }

        setFetching(true);
        setFeedback(null);
        setVideoList([]);
        setSelectedVideoIds(new Set());
        setCreatedPosts([]);

        try {
            const res = await fetch(`/api/youtube/fetch?type=search&query=${encodeURIComponent(kw)}&maxResults=${maxResults}${getKeyParam()}`);
            const data = await res.json();

            if (!res.ok || !data.videos) {
                setFeedback({ type: "error", text: data.error || "Failed to search videos" });
            } else {
                const list: AnnotatedVideoItem[] = data.videos || [];
                setVideoList(list);

                // Auto-select only new unimported videos
                const newIds = list.filter((v) => !v.alreadyImported).map((v) => v.videoId);
                setSelectedVideoIds(new Set(newIds));

                const alreadyCount = list.filter((v) => v.alreadyImported).length;
                setFeedback({
                    type: "info",
                    text: `Found ${list.length} videos for "${kw}" (${alreadyCount} already posted, ${newIds.length} new available).`,
                });
            }
        } catch (err: any) {
            setFeedback({ type: "error", text: `Network error: ${err.message}` });
        } finally {
            setFetching(false);
        }
    };

    // ─── Mode 3: Fetch Channel Videos ─────────────────────────────────────────
    const handleFetchChannel = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const ch = channelInput.trim();
        if (!ch) {
            setFeedback({ type: "error", text: "Please enter a Channel URL, Handle (@name), or Channel ID" });
            return;
        }

        setFetching(true);
        setFeedback(null);
        setVideoList([]);
        setChannelInfo(null);
        setSelectedVideoIds(new Set());
        setCreatedPosts([]);

        try {
            const res = await fetch(`/api/youtube/fetch?type=channel&query=${encodeURIComponent(ch)}&maxResults=${maxResults}${getKeyParam()}`);
            const data = await res.json();

            if (!res.ok || !data.videos) {
                setFeedback({ type: "error", text: data.error || "Failed to load channel videos" });
            } else {
                const list: AnnotatedVideoItem[] = data.videos || [];
                setVideoList(list);
                setChannelInfo(data.channelInfo || null);

                // Auto-select only new unimported videos
                const newIds = list.filter((v) => !v.alreadyImported).map((v) => v.videoId);
                setSelectedVideoIds(new Set(newIds));

                const alreadyCount = list.filter((v) => v.alreadyImported).length;
                setFeedback({
                    type: "info",
                    text: `Loaded ${list.length} videos from ${data.channelInfo?.title || "channel"} (${alreadyCount} already posted, ${newIds.length} new available).`,
                });
            }
        } catch (err: any) {
            setFeedback({ type: "error", text: `Network error: ${err.message}` });
        } finally {
            setFetching(false);
        }
    };

    // ─── Select/Deselect All Checklist ─────────────────────────────────────────
    const toggleVideoSelection = (video: AnnotatedVideoItem) => {
        if (video.alreadyImported) return;
        setSelectedVideoIds((prev) => {
            const next = new Set(prev);
            if (next.has(video.videoId)) next.delete(video.videoId);
            else next.add(video.videoId);
            return next;
        });
    };

    const handleSelectAll = () => {
        const selectableVideos = videoList.filter((v) => !v.alreadyImported);
        if (selectedVideoIds.size >= selectableVideos.length && selectableVideos.length > 0) {
            setSelectedVideoIds(new Set());
        } else {
            setSelectedVideoIds(new Set(selectableVideos.map((v) => v.videoId)));
        }
    };

    // ─── Submit Post to Database (type="blog") ────────────────────────────────
    const handlePublishSingle = async () => {
        if (!singleVideo || singleVideo.alreadyImported) return;
        setPosting(true);
        setFeedback(null);

        const payload = {
            postType: "blog",
            category: selectedCategory,
            status: "published",
            userId: currentUser?._id || "",
            items: [
                {
                    videoId: singleVideo.videoId,
                    title: editTitle.trim() || singleVideo.title,
                    description: editDescription,
                    thumbnailUrl: editThumbnail || singleVideo.thumbnailUrl,
                    channelTitle: singleVideo.channelTitle,
                    channelId: singleVideo.channelId,
                    publishedAt: singleVideo.publishedAt,
                    duration: singleVideo.duration,
                    url: singleVideo.url,
                },
            ],
        };

        try {
            const res = await fetch("/api/youtube/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok || !data.success || data.importedCount === 0) {
                const errMsg = data.errors?.[0]?.error || data.error || "Failed to publish post";
                setFeedback({ type: "error", text: errMsg });
            } else {
                setCreatedPosts(data.posts || []);
                setFeedback({
                    type: "success",
                    text: `Successfully published YouTube post "${data.posts?.[0]?.title || editTitle}" into the POST database (type=blog)!`,
                });
                setSingleVideo((prev) => (prev ? { ...prev, alreadyImported: true } : null));
            }
        } catch (err: any) {
            setFeedback({ type: "error", text: `Network error: ${err.message}` });
        } finally {
            setPosting(false);
        }
    };

    const handleBatchPublish = async () => {
        const selectedItems = videoList.filter(
            (v) => selectedVideoIds.has(v.videoId) && !v.alreadyImported
        );
        if (selectedItems.length === 0) {
            setFeedback({ type: "error", text: "Please select at least one new video to post" });
            return;
        }

        setPosting(true);
        setFeedback(null);

        const payload = {
            postType: "blog",
            category: selectedCategory,
            status: "published",
            userId: currentUser?._id || "",
            items: selectedItems,
        };

        try {
            const res = await fetch("/api/youtube/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setFeedback({ type: "error", text: data.error || "Failed to publish posts" });
            } else {
                setCreatedPosts(data.posts || []);

                const postedIds = new Set((data.posts || []).map((p: any) => p.videoId));
                setVideoList((prev) =>
                    prev.map((v) =>
                        postedIds.has(v.videoId) ? { ...v, alreadyImported: true } : v
                    )
                );
                setSelectedVideoIds(new Set());

                const skippedCount = data.errors?.length || 0;
                setFeedback({
                    type: "success",
                    text: `Successfully posted ${data.importedCount} new videos to the POST table!${
                        skippedCount > 0 ? ` (${skippedCount} already existed/skipped)` : ""
                    }`,
                });
            }
        } catch (err: any) {
            setFeedback({ type: "error", text: `Network error: ${err.message}` });
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="container space-y-6 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-10 rounded bg-red-600 text-white flex items-center justify-center shadow-sm">
                        <Icon icon="akar-icons:youtube-fill" className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">YouTube Video Importer & Publisher</h1>
                        <p className="text-xs text-gray-500">
                            Import and publish YouTube videos as blog posts with category assignment, title, description, and thumbnail
                        </p>
                    </div>
                </div>

                {/* Right controls: API Key Selector (only shown if keys exist) + Category Picker */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* API Key Selector — only shown if at least one API key is added */}
                    {availableApiKeys.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                            <Icon icon="solar:key-minimalistic-square-3-bold" className="text-amber-500 w-4 h-4 shrink-0" />
                            <label className="text-xs font-bold text-gray-700 whitespace-nowrap">API Key:</label>
                            <select
                                value={selectedApiKey}
                                onChange={(e) => setSelectedApiKey(e.target.value)}
                                disabled={fetching || posting}
                                className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-red-500 transition max-w-45 truncate"
                            >
                                <option value="">Auto (Rotate Keys)</option>
                                {availableApiKeys.map((item, idx) => (
                                    <option key={idx} value={item.key}>
                                        {item.label} ({item.key.slice(0, 6)}...{item.key.slice(-4)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Target Category Selector */}
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                        <Icon icon="solar:folder-with-files-bold" className="text-red-500 w-4 h-4 shrink-0" />
                        <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Category:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={catLoading || posting}
                            className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-red-500 transition"
                        >
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* No API key warning notice with direct link to settings */}
            {availableApiKeys.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-800">
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:info-circle-bold" className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>No YouTube API keys found. You can add one or more API keys in the settings page.</span>
                    </div>
                    <Link
                        href="/admin/youtube/settings"
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 transition"
                    >
                        Configure API Keys
                    </Link>
                </div>
            )}

            {/* Mode Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => {
                        setMode("single");
                        setFeedback(null);
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                        mode === "single"
                            ? "border-red-500 bg-red-50/50 shadow-xs text-red-900 font-semibold"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                    }`}
                >
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            mode === "single" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        <Icon icon="solar:play-circle-bold" className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold">1. Single ID / URL</div>
                        <div className="text-[11px] text-gray-500">Import one video by link or ID</div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setMode("keyword");
                        setFeedback(null);
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                        mode === "keyword"
                            ? "border-red-500 bg-red-50/50 shadow-xs text-red-900 font-semibold"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                    }`}
                >
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            mode === "keyword" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        <Icon icon="solar:magnifer-bold" className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold">2. Keyword Search</div>
                        <div className="text-[11px] text-gray-500">Search maximum videos by topic</div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setMode("channel");
                        setFeedback(null);
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                        mode === "channel"
                            ? "border-red-500 bg-red-50/50 shadow-xs text-red-900 font-semibold"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                    }`}
                >
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            mode === "channel" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        <Icon icon="solar:tv-bold" className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold">3. Channel ID / URL</div>
                        <div className="text-[11px] text-gray-500">Import all videos from a channel</div>
                    </div>
                </button>
            </div>

            {/* Feedback Alert */}
            {feedback && (
                <div
                    className={`rounded-xl px-4 py-3 text-sm font-medium border flex items-center gap-2 ${
                        feedback.type === "error"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : feedback.type === "warning"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : feedback.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                >
                    <Icon
                        icon={
                            feedback.type === "error"
                                ? "solar:danger-triangle-bold"
                                : feedback.type === "warning"
                                ? "solar:shield-warning-bold"
                                : feedback.type === "success"
                                ? "solar:check-circle-bold"
                                : "solar:info-circle-bold"
                        }
                        className="w-5 h-5 shrink-0"
                    />
                    <div className="flex-1">{feedback.text}</div>
                </div>
            )}

            {/* ─── Mode 1 Search Form: Single Video ─── */}
            {mode === "single" && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5">
                    <form onSubmit={handleFetchSingle} className="space-y-4">
                        <label className="block text-xs font-bold text-gray-700">YouTube Video URL or ID:</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={singleInput}
                                onChange={(e) => setSingleInput(e.target.value)}
                                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                                className="flex-1 text-sm bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 rounded-xl px-4 py-2.5 outline-none transition"
                            />
                            <button
                                type="submit"
                                disabled={fetching || !singleInput.trim()}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                                {fetching ? (
                                    <>
                                        <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 animate-spin" />
                                        Fetching…
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="solar:import-bold" className="w-4 h-4" />
                                        Fetch Video
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Single Video Preview Card */}
                    {singleVideo && (
                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                            <div>
                                <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-black relative group shadow-xs">
                                    <img
                                        src={editThumbnail || singleVideo.thumbnailUrl}
                                        alt={editTitle}
                                        className="w-full h-full object-cover"
                                    />
                                    <a
                                        href={singleVideo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white gap-1 text-xs font-semibold"
                                    >
                                        <Icon icon="logos:youtube-icon" className="w-5 h-5" />
                                        Watch on YouTube
                                    </a>
                                </div>
                                <div className="mt-2 text-[11px] text-gray-500 space-y-1">
                                    <div>
                                        <span className="font-semibold">Video ID:</span>{" "}
                                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700">{singleVideo.videoId}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Channel:</span> {singleVideo.channelTitle}
                                    </div>
                                    {singleVideo.alreadyImported && (
                                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                                            <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5 text-amber-600" />
                                            Already Posted in Database
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Post Title:</label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        disabled={singleVideo.alreadyImported}
                                        className="w-full text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-red-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description:</label>
                                    <textarea
                                        rows={4}
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        disabled={singleVideo.alreadyImported}
                                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-red-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Featured Image URL:</label>
                                    <input
                                        type="text"
                                        value={editThumbnail}
                                        onChange={(e) => setEditThumbnail(e.target.value)}
                                        disabled={singleVideo.alreadyImported}
                                        className="w-full text-xs font-mono border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-red-500 transition disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Post Type: <span className="font-bold text-gray-800">blog</span> | Status:{" "}
                                        <span className="font-bold text-emerald-600">published</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handlePublishSingle}
                                        disabled={posting || singleVideo.alreadyImported}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {posting ? (
                                            <>
                                                <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 animate-spin" />
                                                Publishing Post…
                                            </>
                                        ) : singleVideo.alreadyImported ? (
                                            <>
                                                <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                                                Already Published
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                                                Publish Blog Post
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Mode 2 Search Form: Keyword Search ─── */}
            {mode === "keyword" && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5">
                    <form onSubmit={handleSearchKeyword} className="space-y-4">
                        <label className="block text-xs font-bold text-gray-700">Search YouTube by Keyword:</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                placeholder="e.g. Select Tourist Spots, Select News, Food Vlog..."
                                className="flex-1 text-sm bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 rounded-xl px-4 py-2.5 outline-none transition"
                            />

                            <div className="flex items-center gap-2">
                                <select
                                    value={maxResults}
                                    onChange={(e) => setMaxResults(Number(e.target.value))}
                                    className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 transition"
                                >
                                    <option value={10}>10 results</option>
                                    <option value={25}>25 results</option>
                                    <option value={50}>50 max results</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={fetching || !keywordInput.trim()}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {fetching ? (
                                        <>
                                            <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 animate-spin" />
                                            Searching…
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="solar:magnifer-bold" className="w-4 h-4" />
                                            Search Videos
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* ─── Mode 3 Search Form: Channel ID or Channel URL ─── */}
            {mode === "channel" && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5">
                    <form onSubmit={handleFetchChannel} className="space-y-4">
                        <label className="block text-xs font-bold text-gray-700">
                            YouTube Channel URL, Handle, or Channel ID:
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={channelInput}
                                onChange={(e) => setChannelInput(e.target.value)}
                                placeholder="e.g. https://www.youtube.com/@SelectTV or @SelectTV or UC..."
                                className="flex-1 text-sm bg-gray-50 focus:bg-white border border-gray-200 focus:border-red-500 rounded-xl px-4 py-2.5 outline-none transition"
                            />

                            <div className="flex items-center gap-2">
                                <select
                                    value={maxResults}
                                    onChange={(e) => setMaxResults(Number(e.target.value))}
                                    className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-500 transition"
                                >
                                    <option value={10}>10 videos</option>
                                    <option value={25}>25 videos</option>
                                    <option value={50}>50 videos</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={fetching || !channelInput.trim()}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {fetching ? (
                                        <>
                                            <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 animate-spin" />
                                            Loading…
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="solar:tv-bold" className="w-4 h-4" />
                                            Fetch Channel Videos
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {channelInfo && (
                        <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                            {channelInfo.thumbnail && (
                                <img src={channelInfo.thumbnail} alt={channelInfo.title} className="w-10 h-10 rounded-full" />
                            )}
                            <div>
                                <div className="text-xs font-bold text-gray-900">{channelInfo.title}</div>
                                <div className="text-[11px] text-gray-500 font-mono">ID: {channelInfo.id}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Batch Video List (Keyword / Channel Results) ─── */}
            {(mode === "keyword" || mode === "channel") && videoList.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
                    {/* Batch Actions Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition cursor-pointer"
                            >
                                <Icon
                                    icon={
                                        selectedVideoIds.size > 0 &&
                                        selectedVideoIds.size === videoList.filter((v) => !v.alreadyImported).length
                                            ? "solar:check-square-bold"
                                            : "solar:square-minimalistic-linear"
                                    }
                                    className="w-4 h-4 text-red-600"
                                />
                                {selectedVideoIds.size > 0 &&
                                selectedVideoIds.size === videoList.filter((v) => !v.alreadyImported).length
                                    ? "Deselect All"
                                    : "Select All New"}
                            </button>
                            <span className="text-xs text-gray-500 font-medium">
                                {selectedVideoIds.size} of {videoList.filter((v) => !v.alreadyImported).length} new videos selected
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleBatchPublish}
                            disabled={posting || selectedVideoIds.size === 0}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {posting ? (
                                <>
                                    <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 animate-spin" />
                                    Posting {selectedVideoIds.size} Videos…
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:upload-track-2-bold" className="w-4 h-4" />
                                    Post {selectedVideoIds.size} Selected Videos (type=blog)
                                </>
                            )}
                        </button>
                    </div>

                    {/* Videos Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                        {videoList.map((video) => {
                            const isSelected = selectedVideoIds.has(video.videoId);
                            const isImported = video.alreadyImported;

                            return (
                                <div
                                    key={video.videoId}
                                    onClick={() => toggleVideoSelection(video)}
                                    className={`rounded-xl border p-3 transition-all flex flex-col justify-between space-y-3 ${
                                        isImported
                                            ? "border-amber-200 bg-amber-50/30 opacity-75 cursor-default"
                                            : isSelected
                                            ? "border-red-500 bg-red-50/20 shadow-2xs ring-1 ring-red-400/50 cursor-pointer"
                                            : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            {isImported ? (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                                                    <Icon icon="solar:check-circle-bold" className="w-3 h-3" />
                                                    Already Posted
                                                </div>
                                            ) : (
                                                <div
                                                    className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center shadow-md transition ${
                                                        isSelected ? "bg-red-600 text-white" : "bg-white/80 text-gray-400"
                                                    }`}
                                                >
                                                    {isSelected && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5" />}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                                            {video.title}
                                        </h3>
                                        <p className="text-[11px] text-gray-500 line-clamp-2">
                                            {video.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                                        <span className="truncate max-w-35 font-semibold">{video.channelTitle}</span>
                                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{video.videoId}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Submit Action */}
                    <div className="pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={handleBatchPublish}
                            disabled={posting || selectedVideoIds.size === 0}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {posting ? (
                                <>
                                    <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 animate-spin" />
                                    Submitting Posts…
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:upload-track-2-bold" className="w-4 h-4" />
                                    Submit & Post {selectedVideoIds.size} Selected Videos
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Created Posts Summary */}
            {createdPosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-6 space-y-4">
                    <h2 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                        <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-emerald-600" />
                        Successfully Saved in POST Table ({createdPosts.length} posts, type=blog)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {createdPosts.map((p) => (
                            <div key={p._id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3 items-center">
                                {p.thumbnailUrl && (
                                    <img src={p.thumbnailUrl} alt={p.title} className="w-14 h-10 object-cover rounded-md" />
                                )}
                                <div className="overflow-hidden">
                                    <div className="text-xs font-bold text-gray-900 truncate">{p.title}</div>
                                    <div className="text-[10px] text-emerald-700 font-mono">Slug: {p.slug}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
