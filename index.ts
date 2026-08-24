import { addBuilderElement, addHook, type PluginMeta } from "@/hook";
import YoutubePostPage from "./admin/YoutubePostPage";
import YoutubeSettingsPage from "./settings/YoutubeSettingsPage";
import YoutubeField from "./ui/YoutubeField";
import YoutubeHeader from "./header/Header";
import YoutubeFooter from "./footer/Footer";
import YoutubeBlogLayout from "./blog/Layout";
import YoutubeRelated from "./blog/Related";
import YoutubeCategoryLayout from "./category/Layout";
import YoutubeBox from "./box/Box";

// Builder Elements
import Youtube1Element from "./elements/youtube1";
import Youtube2Element from "./elements/youtube2";
import Youtube3Element from "./elements/youtube3";
import Youtube4Element from "./elements/youtube4";
import Youtube5Element from "./elements/youtube5";
import Youtube6Element from "./elements/youtube6";
import Youtube7Element from "./elements/youtube7";
import Youtube8Element from "./elements/youtube8";
import Youtube9Element from "./elements/youtube9";
import Youtube10Element from "./elements/youtube10";

export const PLUGINS: PluginMeta = {
    nx: "youtube",
    name: "youtube",
    version: "1.0.0",
    description: "YouTube video importer, player, and 10 dynamic builder elements with custom category sorting and video cards.",
    author: "System",
    path: "https://github.com/HOTLancerX/youtube.git",
    icon: "logos:youtube-icon",
    color: "from-red-500 to-rose-600",
};

export function register() {
    // ─── Admin Navigation ───────────────────────────────────────────────────
    addHook("admin.nav", [
        {
            key: "youtube",
            label: "YouTube",
            icon: "logos:youtube-icon",
            slug: "youtube/post",
            parent: "",
            position: 25,
        },
        {
            key: "youtube-settings",
            label: "API Settings",
            icon: "solar:settings-bold",
            slug: "youtube/settings",
            parent: "youtube",
            position: 2,
        },
    ], PLUGINS.nx);

    // ─── Admin Pages ────────────────────────────────────────────────────────
    addHook("admin.pages", [
        {
            key: "youtube",
            label: "YouTube Video Importer",
            style: "left",
            position: 50,
            active: true,
            path: YoutubePostPage,
        },
        {
            key: "youtube/post",
            label: "YouTube Video Importer",
            style: "left",
            position: 51,
            active: true,
            path: YoutubePostPage,
        },
        {
            key: "youtube/settings",
            label: "YouTube API Settings",
            style: "left",
            position: 52,
            active: true,
            path: YoutubeSettingsPage,
        },
    ], PLUGINS.nx);

    // ─── Post Form Fields ───────────────────────────────────────────────────
    addHook("post.form", [
        {
            key: "youtube",
            label: "YouTube",
            type: "blog",
            style: "left",
            position: 10,
            component: YoutubeField,
        },
    ], PLUGINS.nx);

    // ─── Root Public Pages (Header, Footer, Category, Blog, Box & Related) ───
    addHook("root.pages", [
        {
            key: "youtube-header",
            label: "YouTube Header",
            type: "header",
            slug: "layout",
            style: "left",
            position: 30,
            active: true,
            component: YoutubeHeader,
        },
        {
            key: "youtube-footer",
            label: "YouTube Footer",
            type: "footer",
            slug: "layout",
            style: "left",
            position: 30,
            active: true,
            component: YoutubeFooter,
        },
        {
            key: "youtube-box",
            label: "YouTube Box",
            type: "blog-box",
            slug: "dynamic",
            style: "left",
            position: 30,
            active: true,
            component: YoutubeBox,
        },
        {
            key: "youtube-category",
            label: "YouTube Category",
            type: "blog-category",
            slug: "dynamic",
            style: "left",
            position: 30,
            active: true,
            component: YoutubeCategoryLayout,
        },
        {
            key: "youtube-blog",
            label: "YouTube Blog",
            type: "blog",
            slug: "dynamic",
            style: "left",
            position: 30,
            active: true,
            component: YoutubeBlogLayout,
        },
        {
            key: "youtube-related",
            label: "YouTube Related",
            type: "blog-related",
            slug: "dynamic",
            style: "left",
            position: 30,
            active: true,
            component: YoutubeRelated,
        },
    ], PLUGINS.nx);

    // ─── 10 YouTube Builder Elements ─────────────────────────────────────────
    addBuilderElement(Youtube1Element, PLUGINS.nx);
    addBuilderElement(Youtube2Element, PLUGINS.nx);
    addBuilderElement(Youtube3Element, PLUGINS.nx);
    addBuilderElement(Youtube4Element, PLUGINS.nx);
    addBuilderElement(Youtube5Element, PLUGINS.nx);
    addBuilderElement(Youtube6Element, PLUGINS.nx);
    addBuilderElement(Youtube7Element, PLUGINS.nx);
    addBuilderElement(Youtube8Element, PLUGINS.nx);
    addBuilderElement(Youtube9Element, PLUGINS.nx);
    addBuilderElement(Youtube10Element, PLUGINS.nx);
}
