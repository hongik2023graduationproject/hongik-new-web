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
                // 공유 링크는 URL 프래그먼트(#code=)에 코드를 담아 크롤러에 노출되지 않으므로
                // 별도 disallow가 필요 없다 (서버 /api/, /share/ 경로는 더 이상 없음).
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
