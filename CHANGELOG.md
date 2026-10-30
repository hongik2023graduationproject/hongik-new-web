# Changelog

이 모노레포의 주요 변경 사항을 기록합니다. [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/) 형식을 따릅니다.

## [Unreleased] - 2026-05-19

### 변경 (Changed) — 백엔드 제거
- **공유 링크를 서버리스로 전환**: 코드를 lz-string(`compressToEncodedURIComponent`)으로 압축해 URL 프래그먼트 `/#code=<압축>`에 담는다. 프래그먼트는 서버로 전송되지 않는다. 링크가 8000자를 넘으면 복사 후 경고 토스트를 띄운다. 구현은 `apps/playground/src/lib/share.ts`.
- 구형 `?code=<urlencoded>` 링크는 계속 열린다. 구형 `?share=TOKEN` 서버 링크는 더 이상 불러올 수 없으며 콘솔에 안내 메시지를 띄운다.
- 이미 열린 탭에 `#code=` 링크를 붙여 넣어도(hashchange) 코드를 불러온다.
- `lib/api.ts`(`shareCode`, `fetchSharedCode`)와 `zod` 의존성 제거. 더 이상 백엔드(hongik-backend)가 필요 없다.
- `NEXT_PUBLIC_API_URL` 제거 — `build.yml`, 루트/플레이그라운드 `.env.example`에서 삭제.
- `robots.ts`에서 존재하지 않는 `/api/`, `/share/` disallow 제거.

### 변경 (Changed) — WASM-only 마이그
- `Header.tsx`의 백엔드 API fallback 제거 — WASM-only 실행. WASM 미지원 브라우저(매우 드문 구형)에서는 사용 불가하지만, 사용자 코드가 서버에 도달하지 않으므로 서버 측 샌드박싱 격차 자체가 해소됨.
- `lib/api.ts`에서 `executeViaAPI`, `ExecuteRequest`, `ExecuteResponseSchema` 제거. `shareCode`와 `fetchSharedCode`는 그대로 유지.
- `apps/playground/public/hongik-wasm.{js,wasm}` untrack + `.gitignore` 추가. `build.yml`의 `pnpm install` 직후 `./scripts/sync-wasm.sh`가 hong-ik release에서 fetch.
- 전제 조건: hong-ik의 `WASM Publish` 워크플로가 1회 이상 실행되어 `wasm-latest` release가 존재해야 한다.
- 로컬 개발: `./scripts/sync-wasm.sh` 1회 실행 후 `pnpm dev`.

### 추가 (Added)
- `@hongik/playground`에 vitest 단위 테스트(`pnpm --filter @hongik/playground test`) — 공유 링크 인코딩/디코딩 왕복(한글·이모지·빈 코드·대용량)과 구형 링크 처리.
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
