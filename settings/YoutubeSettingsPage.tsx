"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { xFetch } from "@/lib/express";

interface ApiKeyRow {
    id: string;
    key: string;
    label: string;
    status?: "active" | "testing" | "valid" | "invalid" | "quotaExceeded";
    message?: string;
}

export default function YoutubeSettingsPage() {
    const [keys, setKeys] = useState<ApiKeyRow[]>([
        { id: "key-1", key: "", label: "Primary Key" },
    ]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Load existing settings from the Settings API
    useEffect(() => {
        setLoading(true);
        fetch("/api/settings", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
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

                    if (loaded.length > 0) {
                        setKeys(
                            loaded.map((item, idx) => ({
                                id: `key-${Date.now()}-${idx}`,
                                key: typeof item === "string" ? item : (item.key || ""),
                                label: typeof item === "object" && item.label ? item.label : `API Key ${idx + 1}`,
                                status: "active",
                            }))
                        );
                        return;
                    }
                }

                // Single key fallback
                if (data && data.youtube_api_key && typeof data.youtube_api_key === "string" && data.youtube_api_key.trim()) {
                    setKeys([{ id: "key-1", key: data.youtube_api_key.trim(), label: "Primary Key", status: "active" }]);
                }
            })
            .catch((err) => console.error("Error loading YouTube settings:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleAddKey = () => {
        setKeys((prev) => [
            ...prev,
            {
                id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                key: "",
                label: `API Key ${prev.length + 1}`,
                status: "active",
            },
        ]);
    };

    const handleRemoveKey = (id: string) => {
        if (keys.length <= 1) {
            setKeys([{ id: "key-1", key: "", label: "Primary Key" }]);
            return;
        }
        setKeys((prev) => prev.filter((k) => k.id !== id));
    };

    const handleKeyChange = (id: string, field: "key" | "label", value: string) => {
        setKeys((prev) =>
            prev.map((k) => (k.id === id ? { ...k, [field]: value, status: "active", message: "" } : k))
        );
    };

    const testSingleKey = async (id: string, keyValue: string) => {
        const trimmed = keyValue.trim();
        if (!trimmed) {
            setKeys((prev) =>
                prev.map((k) => (k.id === id ? { ...k, status: "invalid", message: "Enter an API key first" } : k))
            );
            return;
        }

        setKeys((prev) =>
            prev.map((k) => (k.id === id ? { ...k, status: "testing", message: "Testing key connection..." } : k))
        );

        try {
            const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1&key=${encodeURIComponent(trimmed)}`;
            const res = await fetch(testUrl);
            const json = await res.json();

            if (res.ok) {
                setKeys((prev) =>
                    prev.map((k) => (k.id === id ? { ...k, status: "valid", message: "Verified: Active & Valid" } : k))
                );
            } else {
                const reason = json?.error?.errors?.[0]?.reason || "";
                const msg = json?.error?.message || `HTTP ${res.status}`;
                const isQuota = reason === "quotaExceeded" || reason === "rateLimitExceeded" || res.status === 403;
                setKeys((prev) =>
                    prev.map((k) =>
                        k.id === id
                            ? {
                                  ...k,
                                  status: isQuota ? "quotaExceeded" : "invalid",
                                  message: `${isQuota ? "Quota Limit Reached" : "Invalid Key"}: ${msg.slice(0, 80)}`,
                              }
                            : k
                    )
                );
            }
        } catch (err: any) {
            setKeys((prev) =>
                prev.map((k) =>
                    k.id === id ? { ...k, status: "invalid", message: `Network error: ${err.message}` } : k
                )
            );
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        // Format clean keys array for the settings table
        const cleanKeys = keys
            .map((k) => ({
                key: k.key.trim(),
                label: k.label.trim(),
            }))
            .filter((k) => k.key.length > 0);

        try {
            // Save via settings API (/settings endpoint)
            const res = await xFetch("/settings", {
                method: "PUT",
                body: JSON.stringify({
                    youtube_api_keys: cleanKeys,
                    youtube_api_key: cleanKeys[0]?.key || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setMessage(`Error: ${data.error ?? "Failed to save settings"}`);
            } else {
                setMessage("YouTube API settings saved successfully!");
                setTimeout(() => setMessage(""), 4000);
            }
        } catch (err: any) {
            setMessage(`Network error: ${err.message || "Could not save"}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                <Icon icon="svg-spinners:ring-resize" className="w-6 h-6 text-red-600 animate-spin" />
                <span className="text-sm font-medium">Loading YouTube settings…</span>
            </div>
        );
    }

    return (
        <div className="container space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-xs">
                        <Icon icon="logos:youtube-icon" className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">YouTube API Settings</h1>
                        <p className="text-xs text-gray-500">
                            Configure multiple YouTube Data API v3 keys with dynamic fields and automatic rotation
                        </p>
                    </div>
                </div>
            </div>

            {message && (
                <div
                    className={`rounded-xl px-4 py-3 text-sm font-medium border flex items-center gap-2 ${
                        message.startsWith("Error")
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                >
                    <Icon
                        icon={message.startsWith("Error") ? "solar:danger-triangle-bold" : "solar:check-circle-bold"}
                        className="w-5 h-5 shrink-0"
                    />
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Dynamic API Keys Panel */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Icon icon="solar:key-minimalistic-square-3-bold" className="text-red-500 w-4 h-4" />
                                Dynamic YouTube API Keys ({keys.length})
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Add one or more API keys. If a key exhausts its 10,000 daily quota, the system will automatically rotate to the next key.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddKey}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition cursor-pointer"
                        >
                            <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                            Add API Key
                        </button>
                    </div>

                    {/* Keys list */}
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {keys.map((item, index) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-gray-300 transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-mono text-xs font-bold flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => handleKeyChange(item.id, "label", e.target.value)}
                                            placeholder="Key Label (e.g. Account 1 Key)"
                                            className="text-xs font-semibold bg-transparent text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-red-500 focus:bg-white px-1 py-0.5 outline-none rounded transition"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => testSingleKey(item.id, item.key)}
                                            disabled={!item.key.trim() || item.status === "testing"}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-300 transition disabled:opacity-40 cursor-pointer"
                                        >
                                            {item.status === "testing" ? (
                                                <>
                                                    <Icon icon="svg-spinners:ring-resize" className="w-3.5 h-3.5 animate-spin text-red-500" />
                                                    Testing…
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-blue-600" />
                                                    Test Key
                                                </>
                                            )}
                                        </button>

                                        {keys.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveKey(item.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                                title="Delete key"
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <input
                                        type="password"
                                        value={item.key}
                                        onChange={(e) => handleKeyChange(item.id, "key", e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full text-xs font-mono bg-white border border-gray-200 focus:border-red-500 rounded-lg px-3.5 py-2.5 outline-none transition shadow-2xs"
                                    />
                                </div>

                                {/* Status message banner */}
                                {item.message && (
                                    <div
                                        className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                                            item.status === "valid"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : item.status === "quotaExceeded"
                                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                : "bg-red-50 text-red-700 border border-red-200"
                                        }`}
                                    >
                                        <Icon
                                            icon={
                                                item.status === "valid"
                                                    ? "solar:check-circle-bold"
                                                    : item.status === "quotaExceeded"
                                                    ? "solar:hourglass-line-bold"
                                                    : "solar:danger-circle-bold"
                                            }
                                            className="w-4 h-4 shrink-0"
                                        />
                                        <span>{item.message}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleAddKey}
                            className="w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-red-400 rounded-xl text-gray-600 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition bg-white"
                        >
                            <Icon icon="solar:add-square-bold" className="w-4 h-4 text-red-500" />
                            Add Another Dynamic API Key
                        </button>
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 animate-spin" />
                                Saving Settings…
                            </>
                        ) : (
                            <>
                                <Icon icon="solar:diskette-bold" className="w-4 h-4" />
                                Save YouTube Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
