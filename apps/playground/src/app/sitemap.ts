import type { MetadataRoute } from "next";

// 정적으로 알려진 페이지만 sitemap에 포함.
// 사용자 생성 콘텐츠(/share/[token])는 동적이라 별도 ISR/DB 쿼리로 채워야 하므로 여기서는 제외.
const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hongik.tolelom.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        {
            url: siteUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
