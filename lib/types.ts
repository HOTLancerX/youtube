export interface Tab {
    _id: string;
    title: string;
    url: string;
}

export interface TabPost {
    _id: string;
    title: string;
    slug: string;
    postUrl: string;
    categoryTitle: string | null;
    categoryUrl?: string | null;
    createdAt: string;
    image: string;
    excerpt: string;
    duration?: string;
    videoId?: string;
    views?: string;
    author?: string;
}

export interface YoutubeColors {
    active?: string;
    activeText?: string;
    inactive?: string;
    inactiveText?: string;
    title?: string;
    titleHover?: string;
    iconColor?: string;
    headerBg?: string;
    box0Bg?: string;
    box1Bg?: string;
    box2Bg?: string;
    box3Bg?: string;
    box4Bg?: string;
}
