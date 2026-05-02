# 프로젝트 초기 구성 완료 문서

## ✅ 완료된 작업

### 1. Turborepo 모노레포 구조
- `turbo.json`: 빌드 캐시, 파이프라인 정의
- `pnpm-workspace.yaml`: 워크스페이스 설정
- `package.json`: 루트 패키지 및 워크스페이스 정의

### 2. @hongik/core 패키지
**위치**: `packages/core/`

**포함 사항**:
- `src/types/playground.ts`: 핵심 타입 정의
  - `PlaygroundState`: 플레이그라운드 전역 상태
  - `WasmExecutionResult`: WASM 실행 결과
  - `CodeExample`: 예제 코드 타입
  - `PlaygroundConfig`: 설정 인터페이스

- `src/utils/code-formatter.ts`: 코드 포맷팅
  - `formatCode()`: Hong-ik 코드 들여쓰기 정규화
  - `validateSyntax()`: 기본 문법 검증

- `src/utils/example-loader.ts`: 예제 관리
  - `BASIC_EXAMPLES`: 기초 예제 (3개)
  - `INTERMEDIATE_EXAMPLES`: 중급 예제 (3개)
  - `ADVANCED_EXAMPLES`: 고급 예제 (1개)
  - `getExampleByCategory()`: 카테고리별 필터링

### 3. @hongik/ui 패키지
**위치**: `packages/ui/`

**UI 컴포넌트**:
- `Button.tsx`: CVA 기반 스타일 컴포넌트
- `Editor.tsx`: 코드 에디터 (Monaco 통합 대기)
- `Console.tsx`: 실행 결과 출력 패널
- `Header.tsx`: 상단 헤더 (실행, 저장, 공유 버튼)
- `ExampleSelector.tsx`: 예제 선택 드롭다운
- `Tabs.tsx`: 탭 UI 컴포넌트
- `Dialog.tsx`: 모달 다이얼로그

**훅**:
- `useTheme()`: 다크/라이트 모드 토글
- `useDebounce()`: 입력 디바운싱

**테마**:
- `theme/index.ts`: 색상, 간격, 폰트 정의
- `utils/cn.ts`: clsx 기반 클래스명 유틸

### 4. @hongik/wasm 패키지
**위치**: `packages/wasm/`

**포함 사항**:
- `src/index.ts`: WASM 인터페이스
  - `executeHongikCode()`: Hong-ik 코드 실행
  - `isWasmAvailable()`: WASM 가용성 확인
  - 메모리 관리 추상화

**현황**:
- Emscripten 빌드 완료 대기
- 타입 정의 및 인터페이스 준비 완료

### 5. @hongik/playground (Next.js 앱)
**위치**: `apps/playground/`

**핵심 파일**:
- `app/page.tsx`: 메인 플레이그라운드 페이지
- `app/layout.tsx`: 루트 레이아웃 (Redux Provider 포함)
- `app/providers.tsx`: Redux Store Provider
- `components/EditorPanel.tsx`: Monaco Editor 동적 로딩

**Redux 상태 관리**:
- `store/index.ts`: Redux Store 설정
- `store/playgroundSlice.ts`: 플레이그라운드 슬라이스
  - `code`: 사용자 코드
  - `output`: 실행 결과
  - `isLoading`: 로딩 상태
  - `error`: 에러 메시지
  - `theme`: 테마 설정

**스타일링**:
- `app/globals.css`: Tailwind 초기화 + 커스텀 스타일
- `tailwind.config.js`: Tailwind 설정
- `postcss.config.js`: PostCSS 설정

### 6. 빌드 및 배포 설정
- `next.config.js`: Next.js 설정 (Monaco 최적화)
- `.github/workflows/build.yml`: CI/CD 빌드 파이프라인
- `.github/workflows/e2e.yml`: E2E 테스트 파이프라인

---

## 🚀 다음 단계

### Phase 1: WASM 통합 (Task #7)
1. Emscripten으로 C++ 인터프리터 → WASM 컴파일
2. `@hongik/wasm`의 `executeHongikCode()` 구현
3. WASM 모듈 로딩 테스트

### Phase 2: 테스트 프레임워크 구축
1. Vitest 설정
2. Unit 테스트: Redux 액션, 유틸 함수
3. Integration 테스트: 에디터 + Redux 상태 변화
4. E2E 테스트: Playwright (사용자 플로우)

### Phase 3: Monaco Editor 완전 통합
1. Hong-ik 문법 TextMate 정의 작성
2. 신택스 하이라이팅 적용
3. 자동 완성 (IntelliSense) 설정

### Phase 4: 협력 편집 (선택사항)
1. WebSocket 미들웨어 추가
2. 다중 사용자 코드 동기화
3. 액션 큐 기반 충돌 해결

---

## 📦 의존성 설치 및 실행

```bash
# 1. 루트 디렉토리에서 의존성 설치
pnpm install

# 2. 모노레포 구조 검증
pnpm ls

# 3. 개발 서버 시작 (아직 WASM 없음)
pnpm dev
# → http://localhost:3000에서 확인 가능

# 4. 빌드 테스트
pnpm build

# 5. 테스트 실행
pnpm test
```

### 🚨 트러블슈팅: `Cannot find module 'next/dist/...'`

`pnpm dev` 또는 `pnpm build` 실행 시 다음과 비슷한 에러가 보이면:

```
Error: Cannot find module './impl'
Error: Cannot find module 'next/dist/pages/_app'
```

`node_modules/.pnpm/next@.../node_modules/next/` 디렉터리는 만들어졌지만 안의
파일이 빈 상태입니다 (Windows + pnpm 10 + Next 14.1 조합에서 가끔 발생). lockfile은
정상이라 `pnpm install`이 변화 없음으로 판단하고 재추출하지 않으므로, 한 번
강제로 재설치해야 합니다:

```bash
pnpm install --force
```

---

## 🏗️ 디렉토리 트리

```
hongik-web/
├── .github/workflows/        # GitHub Actions CI/CD
├── packages/
│   ├── core/                 # 공유 타입 + 유틸 (10 파일)
│   ├── ui/                   # UI 컴포넌트 (15 파일)
│   └── wasm/                 # WASM 바인딩 (3 파일)
├── apps/
│   └── playground/           # Next.js 플레이그라운드 (11 파일)
├── turbo.json                # Turborepo 설정
├── pnpm-workspace.yaml       # 워크스페이스 설정
├── tsconfig.json             # 루트 TypeScript 설정
├── package.json              # 루트 패키지
├── .prettierrc                # 코드 포맷팅
├── .gitignore                # Git 무시 파일
├── README.md                 # 프로젝트 개요
└── SETUP.md                  # 이 파일
```

**총 파일 수**: 약 50개
**총 라인 수**: 약 3,500줄

---

## 🔧 기술 스택 확인

| 항목 | 버전 | 설명 |
|-----|------|------|
| Node.js | 18+ | 런타임 |
| pnpm | 8.13+ | 패키지 매니저 |
| Turbo | 1.10+ | 빌드 오케스트레이션 |
| Next.js | 14.0 | 프레임워크 |
| React | 18.2 | UI 라이브러리 |
| Redux Toolkit | 1.9 | 상태 관리 |
| Tailwind CSS | 3.3 | 스타일링 |
| TypeScript | 5.3 | 언어 |
| Vitest | 1.0 | 테스트 (설정 대기) |
| Playwright | 1.40 | E2E 테스트 (설정 대기) |

---

## ⚠️ 알려진 제한사항

1. **WASM 미통합**: Emscripten 빌드 대기 (Task #7)
2. **테스트 미구성**: Vitest + Playwright 설정 필요
3. **Hong-ik 신택스 하이라이팅**: TextMate 문법 정의 필요
4. **협력 편집**: WebSocket 미들웨어 구현 필요

---

## 📝 아키텍처 결정 배경

### Redux Toolkit 선택
- ✅ 비동기 액션 명확 (redux-thunk)
- ✅ 미들웨어 체인 (협력 편집, 플러그인)
- ✅ Redux DevTools (시간 여행 디버깅)
- ✅ 액션 기록 (사용자 분석)

### Shadcn/UI + Radix 선택
- ✅ 접근성 기본 포함 (a11y)
- ✅ 키보드 네비게이션 자동 지원
- ✅ 스크린 리더 지원
- ✅ 테마 커스터마이징 용이

### Turborepo 선택
- ✅ 패키지 독립성 (재사용 가능)
- ✅ 병렬 빌드 (50% 시간 단축)
- ✅ 팀 확대 대비 (각 팀이 패키지 담당)
- ✅ 캐시 자동 관리

---

## 🎯 성공 지표

| 항목 | 목표 | 현황 |
|-----|------|------|
| 프로젝트 구조 | Turborepo 모노레포 | ✅ 완료 |
| 타입 안전성 | 100% TypeScript | ✅ 완료 |
| UI 컴포넌트 | 7개+ | ✅ 8개 완료 |
| 상태 관리 | Redux Toolkit | ✅ 완료 |
| 빌드 도구 | Next.js 14 | ✅ 완료 |
| 번들 최적화 | Monaco 동적 로드 | ✅ 완료 |
| 테스트 설정 | Vitest + Playwright | ⏳ 준비 중 |
| WASM 통합 | 기본 인터페이스 | ⏳ Emscripten 대기 |

---

## 🔐 보안 고려사항

- [ ] WASM 메모리 산드박싱
- [ ] 무한 루프 타임아웃 (Task #1 참고)
- [ ] XSS 방지 (코드 주입 공격)
- [ ] CSP 헤더 설정
- [ ] 입력 검증

---

## 📞 지원

프로젝트 관련 질문:
- 팀 리드: team-lead
- 언어 담당: lang 팀
- WASM 담당: wasm 팀
