# Changelog

이 모노레포의 주요 변경 사항을 기록합니다. [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/) 형식을 따릅니다.

## [Unreleased] - 2026-05-19

### 추가 (Added)
- **Next.js 에러 페이지**: `apps/playground/src/app/{not-found,error,global-error}.tsx`. 이전에는 기본 빨간 에러 화면이 노출됐다.
- **SEO 풀 셋업**: `layout.tsx`에 OpenGraph + Twitter 카드 + 키워드/canonical/icons/viewport/metadataBase, Next.js 14 native `app/robots.ts` + `app/sitemap.ts`. `/share/*`는 임의 사용자 코드 노출 가능성으로 인덱싱 차단.
- **SVG favicon**: `public/favicon.svg` (한글 "ㅎ" 로고, prefers-color-scheme 대응). `.ico`/apple-touch-icon은 PNG 생성 후 추가 예정.
- **Playwright 스캐폴딩**: `apps/playground/{playwright.config.ts,e2e/smoke.spec.ts}` + npm 스크립트 + turbo 파이프라인. 활성화: `pnpm install` + `pnpm --filter @hongik/playground exec playwright install --with-deps chromium`.
- LICENSE (MIT), SECURITY.md, CONTRIBUTING.md, PR 템플릿, `.env.example`, Dependabot (npm/actions).
- 공유 ESLint 워크스페이스(`packages/eslint-config`)는 앞선 메인 PR 흐름에서 정착됨.

### 수정 (Fixed)
- `packages/wasm/src/index.ts`의 module-level `let requestId = 0`을 `loadInterpreter` 클로저 안으로 이동. 다중 인스턴스/HMR 재로드 상황에서 ID 충돌이 다른 인스턴스의 pending 핸들러를 잘못 매칭하던 위험 차단.
- CI `pnpm install --no-frozen-lockfile` → `--frozen-lockfile`. 락파일 드리프트가 사일런트로 통과되던 문제 차단.

### 리팩토링 (Refactor)
- `packages/wasm/src/types.ts`에 `WorkerRequestPayload` 신설 — `Omit<WorkerRequest, 'id'>`가 유니온에서 분포되지 않던 문제 해결. `send()` 호출지점의 `as Omit<...>` 캐스트 7곳 제거.
- `hongik-worker.ts`의 `requireInterpreter` 반환 타입을 `{ ok: true; interp } | { ok: false; response }` discriminated union으로 — `'execute' in interp` duck-type 검사 제거.

### 운영/인프라 (Ops)
- LICENSE (MIT), SECURITY.md, CONTRIBUTING.md, PR 템플릿, Dependabot.
- `.env.example` 추가 — `NEXT_PUBLIC_API_BASE_URL` 등.
