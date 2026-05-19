## 요약
<!-- 무엇을 / 왜 바꾸는지 1-3줄로 -->

## 변경 유형
- [ ] 버그 수정
- [ ] 새 기능 (UI/UX 추가)
- [ ] Breaking change (공유 패키지 API 변경)
- [ ] 리팩토링 / 타입 정리
- [ ] 디자인/스타일
- [ ] 인프라/CI/패키지

## 영향받는 워크스페이스
- [ ] `apps/playground`
- [ ] `packages/core`
- [ ] `packages/ui`
- [ ] `packages/wasm`
- [ ] `packages/eslint-config`

## 테스트
- [ ] `pnpm turbo run typecheck` 통과
- [ ] `pnpm turbo run lint` 통과
- [ ] `pnpm turbo run test` 통과
- [ ] (해당 시) `pnpm --filter @hongik/playground e2e` 통과
- [ ] 수동 브라우저 검증 (Chrome / Firefox / Safari 중 ≥ 1)

## 스크린샷 (UI 변경 시)
<!-- before / after -->

## 체크리스트
- [ ] 새 dependency 추가 시 사유 명시 + 번들 영향 확인
- [ ] accessibility 회귀 없음 (키보드 탐색 / aria 라벨)
- [ ] 모바일 레이아웃 확인
- [ ] 관련 이슈 링크 (`Fixes #N`)
