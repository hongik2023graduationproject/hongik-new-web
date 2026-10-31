# hong-ik 웹사이트

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE.svg?logo=astro)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)

한글 프로그래밍 언어 [`hong-ik`](https://github.com/hongik2023graduationproject/hong-ik)의 웹사이트입니다.
소개, 플레이그라운드, 문서가 정적 사이트 하나(https://hongik.tolelom.xyz)에 들어 있습니다.

| 경로 | 내용 | 소스 |
| --- | --- | --- |
| `/` | 소개 | `apps/site/src/pages/index.astro` |
| `/playground/` | 플레이그라운드 (Monaco 편집기 + 브라우저 WASM 실행) | `apps/site/src/components/playground/` (React 섬) |
| `/docs/` | 문서 (Starlight) | `apps/site/src/content/docs/docs/` |

📖 [기여 가이드](./CONTRIBUTING.md) · [보안 정책](./SECURITY.md) · [변경 이력](./CHANGELOG.md) · [라이선스](./LICENSE)

## 구조

```
apps/
  site/            # Astro 7 + Starlight. React(플레이그라운드)·Vue(문서 예제 실행 상자) 섬
packages/
  wasm/            # WASM 인터프리터 래퍼 + Web Worker (hongik-worker.js)
  core/            # 공유 TS 유틸·타입
  ui/              # 공유 React 컴포넌트
  eslint-config/   # 공유 ESLint 설정
scripts/sync-wasm.sh   # hong-ik 릴리스(wasm-latest)에서 WASM 런타임을 apps/site/public으로 받기
```

백엔드 서버는 없습니다. 코드는 브라우저의 WASM 인터프리터에서 실행되고, 공유 링크는 코드를 압축해
URL 프래그먼트(`/playground/#code=...`)에 담습니다. 예전 `/#code=`, `/?code=` 링크는 소개 페이지가
`/playground/`로 넘깁니다.

## 시작하기

Node.js 24(최소 22.23 — Astro 7 요구 사항)와 pnpm 9가 필요합니다.

```bash
pnpm install
./scripts/sync-wasm.sh    # WASM 런타임 받기 (최초 1회, 이후 hong-ik이 바뀔 때)
pnpm dev                  # http://localhost:4321
pnpm build                # apps/site/dist 에 정적 사이트 생성
```

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/build.yml`)가 테스트 → WASM 동기화 → 빌드 후
`apps/site/dist`를 nginx 이미지(`ghcr.io/hongik2023graduationproject/hongik-web`, linux/arm64, 포트 3000)로
만들어 올립니다. 서버 반영은 server-config 저장소의 Renovate(digest 갱신)와 git-sync가 맡습니다.
nginx 설정은 [`nginx.conf`](./nginx.conf)입니다.
