import Link from "next/link";
import { Icon } from "@iconify/react";
import MenuClients from "@/components/MenuClients";
import Search from "@/components/Search";
import SearchPopUp from "@/components/SearchPopUp";
import type { MenuItem } from "@/models/Menu";
import MobileDrawer from "@/components/page/header/MobileDrawer";

interface HeaderProps {
    settings?: Record<string, any>;
    mainItems?: MenuItem[];
    mobileItems?: MenuItem[];
    builderContent?: Record<string, any[]>;
}

export default function YoutubeHeader({
    settings = {},
    mainItems = [],
    mobileItems = [],
    builderContent = {},
}: HeaderProps) {
    const isSticky = settings.header_sticky !== "false";
    const siteName = settings.siteName || "YouTube";

    return (
        <header className={`z-50 bg-white border-b border-gray-200/80 shadow-2xs ${isSticky ? "sticky top-0" : "relative"}`}>
            <div className="container flex items-center justify-between gap-4 py-3">
                {/* 1. Left: Brand Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0 group">
                    {settings.logo ? (
                        <img
                            src={settings.logo}
                            alt={settings.siteName || 'NxCMS'}
                            className="w-auto object-contain max-h-11"
                            style={{
                            height: settings.header_logo_height
                                ? `${settings.header_logo_height}px`
                                : settings.headerLogoHeight
                                    ? `${settings.headerLogoHeight}px`
                                    : undefined,
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Icon icon="akar-icons:youtube-fill" className="w-10 h-10 text-red-600" />
                            <span className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                                {siteName}
                            </span>
                        </div>
                    )}
                </Link>

                {/* 2. Center: Desktop Search Bar (YouTube Style) */}
                <div className="hidden md:flex flex-1 max-w-xl mx-4">
                    <Search type="blog" className="w-full relative" />
                </div>

                {/* 3. Right: Mobile Search & Mobile Drawer Menu */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search PopUp */}
                    <div className="md:hidden">
                        <SearchPopUp type="blog" fontSize={22} iconColor="#374151" />
                    </div>

                    {/* Mobile Menu Drawer */}
                    <div className="md:hidden">
                        <MobileDrawer items={mobileItems.length > 0 ? mobileItems : mainItems} settings={settings} icon="boxicons:menu-right-filled" iconColor="#374151" />
                    </div>
                </div>
            </div>

            {/* 4. Desktop Navigation Bar (Categories / Main Menu) */}
            {mainItems.length > 0 && (
                <div className="border-t border-gray-100 hidden md:block bg-gray-50/50">
                    <div className="container flex items-center py-1">
                        <MenuClients
                            menuItems={mainItems}
                            settings={settings}
                            builderContent={builderContent}
                            className="flex items-center gap-1 font-semibold text-sm"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
