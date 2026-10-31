# Contributing to hongik-web

홍익 프로그래밍 언어 웹사이트(소개·플레이그라운드·문서). pnpm + Turborepo 모노레포, 사이트는 Astro.

## 개발 환경 세팅

### 필수 도구

- Node.js 24 (최소 22.23, Astro 7 요구 사항)
- pnpm 9.15.9 (`corepack enable` 또는 `npm i -g pnpm@9.15.9`)

### 시작하기

```bash
git clone https://github.com/hongik2023graduationproject/hongik-new-web.git
cd hongik-new-web
pnpm install
./scripts/sync-wasm.sh   # WASM 런타임 받기 (최초 1회)
pnpm dev                 # apps/site — http://localhost:4321
```

백엔드 서버나 `.env` 설정 없이 바로 동작합니다 (실행은 브라우저 WASM, 공유는 URL 프래그먼트).

## 모노레포 구조

```
apps/
  site/                    # Astro 사이트: / 소개, /playground/ (React 섬), /docs/ (Starlight)
packages/
  core/                    # 순수 TS 유틸 + 타입
  ui/                      # 공유 React 컴포넌트 (Radix 기반)
  wasm/                    # WASM 인터프리터 래퍼 + Web Worker
  eslint-config/           # 공유 ESLint 설정
```

각 워크스페이스는 `package.json`을 가지며 turbo로 빌드 순서가 결정됩니다 (`apps/site`는 `packages/wasm`에 의존).

## 개발 워크플로

### 브랜치 / 커밋
- `feat/<summary>`, `fix/<summary>`, `refactor/<summary>` 등으로 분기.
- conventional commits 권장 (`feat(site):`, `fix(playground):`, `docs(docs):`, `fix(wasm):`).

### 코드 스타일
- TypeScript strict 유지. `any` 회피, 외부 입력은 `unknown` + Zod로 좁히기.
- React: 함수형 컴포넌트, props에 명시적 인터페이스, hooks 의존 배열 정확히.
- 임포트 정렬은 ESLint가 자동.

### 검증
```bash
pnpm turbo run typecheck      # 모든 워크스페이스 tsc --noEmit
pnpm turbo run lint           # ESLint
pnpm turbo run test           # vitest 등 (있는 워크스페이스만)
pnpm turbo run build          # 빌드 자체 검증
```

### E2E
```bash
pnpm --filter @hongik/site exec playwright install --with-deps chromium  # 최초 1회
pnpm --filter @hongik/site e2e
```

### 새 패키지/의존성
- 워크스페이스 간 의존은 `workspace:*` 사용.
- 외부 npm 추가 시 PR 본문에 사유 + 번들 영향 설명.
- 잠금 파일 무결성: CI는 `--frozen-lockfile`로 install. 로컬에서 의존 추가 후 lockfile도 같이 커밋.

### WASM 빌드 산출물
`apps/site/public/hongik-wasm.{js,wasm}`는 `hong-ik` 저장소 릴리스(`wasm-latest`)에서 `./scripts/sync-wasm.sh`로 받는 산출물이고, `hongik-worker.js`는 `packages/wasm` 빌드 결과를 복사한 것입니다. 둘 다 커밋하지 않습니다.

## PR 제출

1. 위 워크플로 + 검증
2. `pnpm changeset` (공유 패키지의 외부 영향 있는 변경 시) — TBD
3. PR 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`) 따라 작성

## 보안

[`SECURITY.md`](./SECURITY.md) 참조.
