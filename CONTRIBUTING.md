# 기여 안내

홍익 프로그래밍 언어 웹사이트(소개·플레이그라운드·문서). pnpm + Turborepo 모노레포, 사이트는 Astro.

## 개발 환경 세팅

### 필수 도구

- Node.js 24 (최소 22.23, Astro 7 요구 사항)
- pnpm 9.15.9 (`corepack enable` 또는 `npm i -g pnpm@9.15.9`)

설치와 실행은 [README의 시작하기](README.md#시작하기)에 있습니다.

## 모노레포 구조

워크스페이스 구성은 [ARCHITECTURE.md](ARCHITECTURE.md)에 있습니다.

## 개발 워크플로

### 브랜치 / 커밋
- `feat/<summary>`, `fix/<summary>`, `refactor/<summary>` 등으로 분기.
- conventional commits 권장 (`feat(site):`, `fix(site):`, `docs(docs):`, `fix(wasm):`).

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

E2E는 `pnpm build`로 만든 `dist/`를 `astro preview`로 띄워 검사하므로 빌드 뒤에 돌립니다.

### 새 패키지/의존성
- 워크스페이스 간 의존은 `workspace:*` 사용.
- 외부 npm 추가 시 PR 본문에 사유 + 번들 영향 설명.
- 잠금 파일 무결성: CI는 `--frozen-lockfile`로 install. 로컬에서 의존 추가 후 lockfile도 같이 커밋.

### WASM 빌드 산출물
`apps/site/public/hongik-wasm.{js,wasm}`는 `hong-ik` 저장소 릴리스(`wasm-latest`)에서 `./scripts/sync-wasm.sh`로 받는 산출물이고, `hongik-worker.js`는 `packages/wasm` 빌드 결과를 복사한 것입니다. 둘 다 커밋하지 않습니다(`apps/site/.gitignore`).

- `hongik-worker.js`는 `dev`·`build`가 먼저 실행하는 `apps/site/scripts/copy-worker.mjs`가 복사합니다. `public/`의 사본을 직접 고치지 않습니다.
- 특정 hong-ik 빌드로 고정하려면 `./scripts/sync-wasm.sh wasm-<커밋 SHA>`를 씁니다. hong-ik 저장소는 SHA 릴리스를 최근 10개만 남깁니다.

## 문서 작성

문서는 `apps/site/src/content/docs/docs/` 아래 Markdown입니다.

- 사이드바 순서는 `apps/site/astro.config.mjs`의 `starlight({ sidebar })`에 있습니다.
- 실행 가능한 예제가 필요한 페이지는 `.mdx`로 만들고 `src/components/docs/`의 `InlinePlayground.vue`나 `RunCode.vue`를 `client:visible`로 넣습니다.
- 알림 상자는 `:::tip`, `:::caution[제목]`으로 씁니다.

## PR 제출

1. 위 워크플로 + 검증
2. `pnpm changeset` (공유 패키지의 외부 영향 있는 변경 시, TBD)
3. PR 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`) 따라 작성

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/ci.yml`)가 lint·테스트 → WASM 동기화 → 빌드 후 `apps/site/dist`를 nginx 이미지(`ghcr.io/hongik2023graduationproject/hongik-web`, linux/arm64, 포트 3000)로 만들어 올립니다. 태그는 `latest`, `main`, 커밋 SHA입니다. nginx 설정은 [`nginx.conf`](./nginx.conf)에 있습니다.

첫 빌드 전에 hong-ik 저장소의 release 워크플로가 한 번 이상 돌아 `wasm-latest` 릴리스가 있어야 합니다.

## 보안

[`SECURITY.md`](./SECURITY.md)에 있습니다.
