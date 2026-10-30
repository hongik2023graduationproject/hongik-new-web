# 개발 환경 설정

## 필요한 것

| 도구 | 버전 | 비고 |
| --- | --- | --- |
| Node.js | 24 (최소 22.23) | Astro 7 요구 사항. CI도 24 |
| pnpm | 9.15.9 | CI와 같은 버전. `corepack enable` 또는 `npm i -g pnpm@9.15.9` |

## 처음 실행

```bash
pnpm install
./scripts/sync-wasm.sh          # hong-ik 릴리스 wasm-latest → apps/site/public/hongik-wasm.{js,wasm}, manifest.json
pnpm dev                        # http://localhost:4321  (/, /playground/, /docs/)
```

- `hongik-worker.js`는 `packages/wasm`의 빌드 결과를 `apps/site/scripts/copy-worker.mjs`가 `public/`으로
  복사합니다(`dev`·`build`가 먼저 실행). 직접 고친 사본을 두지 않습니다.
- WASM 런타임과 워커는 생성물이라 커밋하지 않습니다(`apps/site/.gitignore`).
- 특정 hong-ik 빌드로 고정하려면 `./scripts/sync-wasm.sh wasm-<커밋 SHA>` (최근 10개만 보관됨).

## 검증

```bash
pnpm lint
pnpm turbo run test                     # vitest (packages/wasm, apps/site)
pnpm --filter @hongik/site typecheck    # astro check
pnpm build
pnpm --filter @hongik/site exec playwright install chromium   # 최초 1회
pnpm --filter @hongik/site e2e          # astro preview 대상 스모크 테스트
```

## 문서 작성

문서는 `apps/site/src/content/docs/docs/` 아래 Markdown입니다. 사이드바 순서는 `apps/site/astro.config.mjs`의
`starlight({ sidebar })`에 있습니다. 실행 가능한 예제가 필요한 페이지는 `.mdx`로 만들고
`src/components/docs/InlinePlayground.vue`를 `client:visible`로 넣습니다. 알림 상자는 `:::tip` / `:::caution[제목]`.
