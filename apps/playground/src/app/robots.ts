import type { MetadataRoute } from "next";

// Next.js 14의 native robots 라우트. /robots.txt로 직접 서빙됨.
// 환경변수 미설정 시 운영 도메인을 기본값으로.
const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hongik.tolelom.xyz";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // 공유 링크 페이지는 인덱싱 안 함 — 임의 사용자 코드 노출 방지.
                disallow: ["/api/", "/share/"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
