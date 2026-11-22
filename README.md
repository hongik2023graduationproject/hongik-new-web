# hongik-new-web

> 한글 프로그래밍 언어 [hong-ik](https://github.com/hongik2023graduationproject/hong-ik)의 소개, 플레이그라운드, 문서 사이트

Astro 7 · Starlight · React · Vue · TypeScript · WebAssembly · 데모 https://hongik.tolelom.xyz

## 기능

- 소개 페이지(`/`)
- 플레이그라운드(`/playground/`): Monaco 편집기, 브라우저 안 WASM 실행
- 코드를 URL에 담는 공유 링크(`/playground/#code=...`)
- 문서(`/docs/`)와 문서 안에서 바로 돌려 보는 예제

## 시작하기

Node.js 24와 pnpm 9.15.9가 필요합니다.

```bash
git clone https://github.com/hongik2023graduationproject/hongik-new-web.git
cd hongik-new-web
pnpm install
./scripts/sync-wasm.sh    # WASM 런타임 받기(처음 한 번, 이후 hong-ik이 바뀔 때)
pnpm dev
```

| 페이지 | 주소 |
|---|---|
| 소개 | http://localhost:4321/ |
| 플레이그라운드 | http://localhost:4321/playground/ |
| 문서 | http://localhost:4321/docs/ |

백엔드 서버나 `.env` 설정은 없습니다.

## 문서

| 문서 | 내용 |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 모노레포 구성과 실행 구조 |
| [CHANGELOG.md](CHANGELOG.md) | 변경 이력 |
| [SECURITY.md](SECURITY.md) | 보안 정책 |

## 기여

검증 명령, 코드 규칙, 문서 작성 방법, 배포 흐름은 [CONTRIBUTING.md](CONTRIBUTING.md)에 있습니다.

## 라이선스

MIT 라이선스입니다. [LICENSE](LICENSE)를 봅니다.
