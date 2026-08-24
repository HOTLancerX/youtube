"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { xFetch } from "@/lib/express";

export interface CategoryItem {
    _id: string;
    title: string;
    slug: string;
}

export function CategorySorter({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const [cats, setCats] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragIdx, setDragIdx] = useState<number | null>(null);

    useEffect(() => {
        setLoading(true);
        xFetch("/builder-post/cats?type=blog-category")
            .then((r) => r.json())
            .then((data) => {
                setCats(data.cats ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggle = (id: string) =>
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

    const handleDrop = (toIdx: number) => {
        if (dragIdx === null || dragIdx === toIdx) return;
        const next = [...value];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(toIdx, 0, moved);
        onChange(next);
        setDragIdx(null);
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-400 px-1 py-2">
                <Icon icon="svg-spinners:ring-resize" width={14} /> Loading categories...
            </div>
        );
    }

    if (cats.length === 0) return <p className="text-xs text-gray-400 px-1">No categories found.</p>;

    const selectedIds = value.filter((id) => cats.some((c) => c._id === id));
    const unselectedCats = cats.filter((c) => !selectedIds.includes(c._id));
    const catById = Object.fromEntries(cats.map((c) => [c._id, c]));

    return (
        <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 px-1 py-1 rounded cursor-pointer hover:bg-gray-50">
                <input
                    type="checkbox"
                    checked={value.length === 0}
                    onChange={() => onChange([])}
                    className="w-3.5 h-3.5 accent-red-600"
                />
                <span className="text-xs text-gray-700 font-medium">All categories</span>
            </label>
            <div className="border-t border-gray-100 my-1" />
            {selectedIds.length > 0 && (
                <>
                    <p className="text-[10px] text-gray-400 px-1 uppercase tracking-wide font-semibold">
                        Selected (drag to reorder)
                    </p>
                    {selectedIds.map((id, idx) => {
                        const cat = catById[id];
                        if (!cat) return null;
                        return (
                            <div
                                key={id}
                                draggable
                                onDragStart={() => setDragIdx(idx)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(idx)}
                                className={`flex items-center gap-2 px-1 py-1 rounded cursor-grab hover:bg-red-50 ${dragIdx === idx ? "opacity-50" : ""}`}
                            >
                                <Icon icon="mdi:drag" width={14} className="text-gray-300 shrink-0" />
                                <input
                                    type="checkbox"
                                    checked
                                    onChange={() => toggle(id)}
                                    className="w-3.5 h-3.5 accent-red-600"
                                />
                                <span className="text-xs text-gray-700">{cat.title}</span>
                                <span className="ml-auto text-[10px] text-red-500 font-semibold">#{idx + 1}</span>
                            </div>
                        );
                    })}
                    {unselectedCats.length > 0 && <div className="border-t border-gray-100 my-1" />}
                </>
            )}
            {unselectedCats.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 px-1 py-1 rounded cursor-pointer hover:bg-gray-50">
                    <span className="w-3.5 shrink-0" />
                    <input type="checkbox" checked={false} onChange={() => toggle(cat._id)} className="w-3.5 h-3.5 accent-red-600" />
                    <span className="text-xs text-gray-700">{cat.title}</span>
                </label>
            ))}
        </div>
    );
}
