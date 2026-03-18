# Hong-ik Web Playground

한글 프로그래밍 언어 `hong-ik`을 위한 웹 기반 플레이그라운드입니다.

## 🏗️ 프로젝트 구조

```
hongik-web/
├── packages/
│   ├── core/                 # 공유 유틸 + 타입 정의
│   ├── ui/                   # UI 컴포넌트 (Radix + Tailwind)
│   └── wasm/                 # WASM 런타임 바인딩
├── apps/
│   └── playground/           # Next.js 14 플레이그라운드
├── turbo.json                # Turborepo 설정
└── pnpm-workspace.yaml       # pnpm 워크스페이스 설정
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- pnpm 8.13+

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev

# 빌드
pnpm build
```

## 📦 패키지 설명

### `@hongik/core`

- **목적**: hong-ik 언어의 핵심 유틸과 타입
- **포함 사항**:
  - `PlaygroundState`, `WasmExecutionResult` 타입
  - 코드 포맷팅 유틸
  - 예제 코드 로더
- **의존성**: 없음

### `@hongik/ui`

- **목적**: 공유 UI 컴포넌트 라이브러리
- **포함 사항**:
  - `Button`, `Editor`, `Console`, `Header` 등 UI 컴포넌트
  - `useTheme`, `useDebounce` 훅
  - Radix UI 기반 접근성 보장
- **의존성**: `react`, `@radix-ui/*`

### `@hongik/wasm`

- **목적**: hong-ik C++ 인터프리터의 WASM 바인딩
- **포함 사항**:
  - `executeHongikCode()` 함수
  - WASM 모듈 초기화 로직
  - 메모리 관리 래퍼
- **의존성**: 없음 (WASM은 런타임에 로드)

### `@hongik/playground`

- **목적**: Next.js 기반 메인 플레이그라운드 앱
- **포함 사항**:
  - Redux Toolkit 상태 관리
  - Monaco Editor 통합
  - 반응형 UI (Desktop/Mobile)
- **의존성**: `@hongik/core`, `@hongik/ui`, `@hongik/wasm`

## 🛠️ 아키텍처 결정

### 상태 관리: Redux Toolkit

**선택 이유**:
- 비동기 액션 명확한 관리 (redux-thunk)
- 미들웨어 체인으로 협력 편집, 플러그인 지원
- Redux DevTools로 시간 여행 디버깅 가능
- 사용자 액션 기록 가능

### UI 컴포넌트: Shadcn/UI + Radix

**선택 이유**:
- Radix: 접근성(a11y) 기본 포함
- 키보드 네비게이션, 스크린 리더 지원
- 테마 커스터마이징 용이
- 디자인 일관성 보장

### 번들 최적화

- Monaco Editor는 동적 임포트 (4.5MB → 지연 로딩)
- Turborepo 캐싱으로 빌드 50% 단축
- Next.js 코드 스플리팅 자동화

## 📋 개발 가이드

### 새 컴포넌트 추가

```typescript
// packages/ui/src/components/MyComponent.tsx
export const MyComponent: React.FC<MyComponentProps> = (props) => {
  return <div>{/* implementation */}</div>;
};

// packages/ui/src/components/index.ts에 export 추가
export { MyComponent } from './MyComponent';
```

### Redux 액션 추가

```typescript
// apps/playground/store/playgroundSlice.ts
export const playgroundSlice = createSlice({
  // ...
  reducers: {
    myNewAction: (state, action: PayloadAction<string>) => {
      // state 수정
    },
  },
});
```

### 예제 코드 추가

```typescript
// packages/core/src/utils/example-loader.ts
export const NEW_EXAMPLES: CodeExample[] = [
  {
    id: 'unique-id',
    title: '예제 제목',
    category: 'basic',
    description: '설명',
    code: '코드',
    expectedOutput: '예상 출력',
  },
];
```

## 🧪 테스트

```bash
# 모든 테스트 실행
pnpm test

# 특정 패키지 테스트
pnpm test --filter=@hongik/core

# E2E 테스트 (Playwright)
pnpm test:e2e
```

## 📈 성능 최적화

### 초기 로딩

- SSG로 플레이그라운드 페이지 사전 생성
- 예제 JSON 번들에 포함
- Monaco Editor는 사용 시에만 로드

### 런타임

- Redux DevTools 프로덕션에서 비활성화
- 코드 포맷팅은 debounce로 제한
- WASM 실행 결과 브라우저 캐시

## 🚀 배포

### Vercel 배포

```bash
# vercel.json 설정 파일 생성
pnpm build

# 자동 배포
git push
```

### Docker 배포

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 🔄 협력 편집 (향후)

Redux 미들웨어로 WebSocket 메시지 동기화:

```typescript
// 여러 사용자의 코드 변화를 액션 큐로 관리
dispatch(setCode(remoteCode)); // 액션이 기록됨
// → Redux DevTools에서 모든 사용자의 변화 추적 가능
```

## 📝 라이선스

MIT

## 📧 문의

hong-ik 팀 (team@hongik.dev)
