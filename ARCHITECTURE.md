# 구조

pnpm + Turborepo 모노레포입니다. 각 워크스페이스는 `package.json`을 가지며 turbo가 빌드 순서를 정합니다(`apps/site`는 `packages/wasm`에 의존).

## 워크스페이스

| 경로 | 패키지 | 내용 |
|---|---|---|
| `apps/site/` | @hongik/site | Astro 7 + Starlight 사이트. React(플레이그라운드)·Vue(문서 예제 실행 상자) 섬 |
| `packages/wasm/` | @hongik/wasm | WASM 인터프리터 래퍼와 Web Worker(`hongik-worker.js`) |
| `packages/core/` | @hongik/core | 공유 TS 유틸과 타입 |
| `packages/ui/` | @hongik/ui | 공유 React 컴포넌트 |
| `packages/eslint-config/` | @hongik/eslint-config | 공유 ESLint 설정 |
| `scripts/sync-wasm.sh` | | hong-ik 릴리스(`wasm-latest`)에서 WASM 런타임을 `apps/site/public`으로 받기 |

## 페이지

| 경로 | 소스 |
|---|---|
| `/` | `apps/site/src/pages/index.astro` |
| `/playground/` | `apps/site/src/components/playground/`(React 섬) |
| `/docs/` | `apps/site/src/content/docs/docs/` |

## 실행 구조

- 백엔드 서버가 없습니다. 코드는 브라우저의 WASM 인터프리터(Web Worker)에서 실행됩니다.
- 공유 링크는 코드를 압축해 URL 프래그먼트(`/playground/#code=...`)에 담습니다. 예전 `/#code=`, `/?code=` 링크는 소개 페이지가 `/playground/`로 넘깁니다.
