"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import useSettings from "@/lib/useSettings";

export interface YoutubeFooterProps {
    settings?: Record<string, any>;
}

interface FooterItem {
    id?: string;
    icon?: string;
    name?: string;
    link?: string;
}

interface FooterSectionData {
    title: string;
    items: FooterItem[];
}

export default function YoutubeFooter({ settings: propSettings }: YoutubeFooterProps) {
    const { settings: hookSettings } = useSettings();
    const settings = propSettings && Object.keys(propSettings).length > 0 ? propSettings : hookSettings;

    const sections: FooterSectionData[] = [];

    for (let s = 1; s <= 5; s++) {
        const title = settings[`footer_section_${s}_title`];
        let items: FooterItem[] = [];

        if (typeof settings[`footer_section_${s}_items`] === "string") {
            try {
                const parsed = JSON.parse(settings[`footer_section_${s}_items`]);
                if (Array.isArray(parsed)) {
                    items = parsed;
                }
            } catch {}
        } else {
            const icon = settings[`footer_item_${s}_icon`];
            const name = settings[`footer_item_${s}_name`];
            const link = settings[`footer_item_${s}_link`];
            if (icon || name || link) {
                items = [{ icon, name, link }];
            }
        }

        sections.push({ title, items });
    }

    const year = new Date().getFullYear();
    const siteName = settings.siteName || "YouTube Video Portal";
    const logo = settings.logo;

    const sec1 = sections[0]; // Section 1: Navigation / Links
    const sec2 = sections[1]; // Section 2: Categories / Highlights
    const sec3 = sections[2]; // Section 3: Social Media Links

    return (
        <footer className="w-full bg-white text-gray-700 text-sm border-t border-gray-200 mt-12 divide-y divide-gray-100">
            {/* Top Brand & Quick Links Bar */}
            <div className="container py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt={siteName} className="h-9 w-auto object-contain" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                                    <Icon icon="akar-icons:youtube-fill" className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-black text-gray-900 tracking-tight">{siteName}</span>
                            </div>
                        )}
                    </Link>

                    {/* Quick navigation links */}
                    {sec1?.items && sec1.items.length > 0 && (
                        <div className="flex flex-wrap gap-4 items-center justify-center font-semibold text-xs text-gray-600">
                            {sec1.items.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.link || "/"}
                                    className="hover:text-red-600 transition-colors flex items-center gap-1.5"
                                >
                                    {item.icon && <Icon icon={item.icon} className="w-3.5 h-3.5 text-gray-400" />}
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Columns: About / Contact & Social */}
            <div className="container py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Contact / About */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">About & Contact</h4>
                        {settings.email && <p className="text-xs text-gray-600">{settings.email}</p>}
                        {settings.address && <p className="text-xs text-gray-500">{settings.address}</p>}
                    </div>

                    {/* Column 2: Categories / Helpful links */}
                    <div className="space-y-2">
                        {sec2?.title && <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">{sec2.title}</h4>}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {sec2?.items?.map((item, idx) => (
                                <Link key={idx} href={item.link || "/"} className="hover:text-red-600 transition-colors">
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Social Channels */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Follow Channels</h4>
                        <div className="flex items-center gap-3 pt-1">
                            {sec3?.items && sec3.items.length > 0 ? (
                                sec3.items.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.link || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 flex items-center justify-center transition shadow-2xs"
                                        title={item.name || "Social Channel"}
                                    >
                                        <Icon icon={item.icon || "solar:link-bold"} className="w-4 h-4" />
                                    </a>
                                ))
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                        <Icon icon="akar-icons:youtube-fill" className="w-4 h-4" />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="container py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                    <p>
                        Copyright © {year} {siteName}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="hover:text-gray-600">Privacy Policy</Link>
                        <Link href="/" className="hover:text-gray-600">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
