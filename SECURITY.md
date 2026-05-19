# Security Policy

## 지원 버전

현재 `main` 브랜치만 보안 업데이트를 받습니다.

## 취약점 신고

보안 취약점을 발견하셨다면 **공개 이슈로 등록하지 말아 주세요**.

비공개 채널:

1. **GitHub Security Advisory (권장)** — 저장소의 `Security` 탭 → `Report a vulnerability`
2. **이메일** — 메인테이너에게 직접

## 신고 시 포함하면 도움 되는 정보

- 취약점 유형 (예: XSS, prototype pollution, 로컬 스토리지 노출, WASM 메모리 누출 등)
- 영향받는 페이지/컴포넌트/버전
- 재현 단계 + 브라우저/OS 정보
- PoC 또는 스크린샷
- 영향 범위 (정보 노출 / 세션 탈취 / 코드 실행 등)

## 응답 일정

- **48시간 이내**: 접수 확인
- **7일 이내**: 평가 + 수정 일정
- **30일 이내**: 패치 + 공개

## 보안 모델 요약

- **사용자 코드 실행**: WASM 인터프리터를 Web Worker에서 실행 — 메인 스레드와 격리. WASM 자체가 또 다른 샌드박스 레이어. 백엔드 `/api/execute` fallback은 제거됨 (사용자 코드는 사용자 브라우저 밖으로 나가지 않음).
- **인증**: JWT는 `Authorization: Bearer` 헤더, `localStorage` 저장 (XSS 시 노출 위험 있음 — 추후 httpOnly 쿠키 전환 고려 항목).
- **CSP**: 정적 자산은 같은 origin에서만 서빙. `connect-src`로 백엔드 API URL만 허용.
- **dependency 스캔**: Dependabot이 weekly로 npm/Actions 업데이트 PR 자동 생성.
