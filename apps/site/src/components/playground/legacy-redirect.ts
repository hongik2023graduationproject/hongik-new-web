// 옛 공유 링크(https://hongik.tolelom.xyz/#code=…, /?code=…, /?share=…)는 이제 소개 페이지(/)에 떨어진다.
// 소개 페이지에서 이 모듈을 불러오면 쿼리·프래그먼트를 그대로 붙여 /playground/로 옮긴다.
//   index.astro:  <script>import "../components/playground/legacy-redirect";</script>
// lib/share.ts(lz-string)를 끌어오지 않도록 일부러 독립 모듈로 둔다.

/** 옮겨야 하면 이동할 경로(쿼리·프래그먼트 포함), 아니면 null. */
export function legacyPlaygroundTarget(search: string, hash: string): string | null {
  const params = new URLSearchParams(search);
  const hasShared = /^#(?:.*&)?code=/.test(hash) || params.has("code") || params.has("share");
  return hasShared ? `/playground/${search}${hash}` : null;
}

if (typeof window !== "undefined") {
  const target = legacyPlaygroundTarget(window.location.search, window.location.hash);
  if (target) window.location.replace(target);
}
