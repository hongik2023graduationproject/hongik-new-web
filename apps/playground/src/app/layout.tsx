import type { Metadata, Viewport } from "next";
import { ReduxProvider } from "@/store/Provider";
import "./globals.css";

// 사이트 절대 URL. OG/Twitter 이미지의 절대 경로 계산에 사용.
// 환경변수로 override 가능 (개발 vs 운영 도메인).
const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hongik.tolelom.xyz";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "홍익 Playground",
        template: "%s · 홍익 Playground",
    },
    description:
        "한글 프로그래밍 언어 홍익(hong-ik)의 온라인 플레이그라운드. 브라우저에서 바로 한글로 코드를 작성하고 실행하세요.",
    keywords: [
        "홍익",
        "hong-ik",
        "한글 프로그래밍 언어",
        "한국어 프로그래밍",
        "Korean programming language",
        "playground",
        "online IDE",
        "코딩 교육",
    ],
    authors: [{ name: "hong-ik contributors" }],
    creator: "hong-ik contributors",
    publisher: "hong-ik",
    applicationName: "홍익 Playground",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "ko_KR",
        url: siteUrl,
        siteName: "홍익 Playground",
        title: "홍익 Playground",
        description:
            "한글 프로그래밍 언어 홍익의 온라인 플레이그라운드. 한글로 코드를 작성하고 즉시 실행해보세요.",
        // og-image.png는 public/에 배치 (1200x630 권장). 없으면 카드에 이미지만 빠짐 — 깨지지는 않음.
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "홍익 Playground",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "홍익 Playground",
        description:
            "한글 프로그래밍 언어 홍익의 온라인 플레이그라운드.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    alternates: {
        canonical: siteUrl,
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body>
                <ReduxProvider>{children}</ReduxProvider>
            </body>
        </html>
    );
}
