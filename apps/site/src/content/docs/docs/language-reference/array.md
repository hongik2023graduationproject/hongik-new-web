---
title: "배열 (Array)"
---

배열은 순서가 있는 값들의 컬렉션입니다.

## 선언

```hik
배열 숫자들 = [1, 2, 3, 4, 5]
배열 이름들 = ["김", "이", "박"]
배열 빈배열 = []
```

## 인덱싱

0부터 시작하는 인덱스로 요소에 접근합니다:

```hik
배열 목록 = [10, 20, 30]
출력(목록[0])     // 10
출력(목록[1])     // 20
출력(목록[2])     // 30
```

## 음수 인덱싱

음수 인덱스는 배열의 끝에서부터 접근합니다:

```hik
배열 목록 = [10, 20, 30]
출력(목록[-1])    // 30 (마지막 요소)
출력(목록[-2])    // 20
```

## 배열 수정

```hik
배열 목록 = [1, 2, 3]
목록[0] = 10
출력(목록)    // [10, 2, 3]
```

<a href="/playground/?code=%EB%B0%B0%EC%97%B4%20%EC%88%AB%EC%9E%90%EB%93%A4%20%3D%20%5B1%2C%202%2C%203%2C%204%2C%205%5D%0A%EC%B6%9C%EB%A0%A5(%EC%88%AB%EC%9E%90%EB%93%A4%5B0%5D)%0A%EC%B6%9C%EB%A0%A5(%EC%88%AB%EC%9E%90%EB%93%A4%5B-1%5D)%0A%EC%B6%9C%EB%A0%A5(%EA%B8%B8%EC%9D%B4(%EC%88%AB%EC%9E%90%EB%93%A4))%0A%0A%EC%B6%94%EA%B0%80(%EC%88%AB%EC%9E%90%EB%93%A4%2C%206)%0A%EC%B6%9C%EB%A0%A5(%EC%88%AB%EC%9E%90%EB%93%A4)" target="_blank">플레이그라운드에서 실행 →</a>

## 관련 내장 함수

- [`길이(배열)`](/docs/builtin-functions/array/) - 배열 길이
- [`추가(배열, 값)`](/docs/builtin-functions/array/) - 요소 추가
- [`삭제(배열, 인덱스)`](/docs/builtin-functions/array/) - 요소 삭제
- [`정렬(배열)`](/docs/builtin-functions/array/) - 배열 정렬
- [`뒤집기(배열)`](/docs/builtin-functions/array/) - 순서 뒤집기
- [`찾기(배열, 값)`](/docs/builtin-functions/array/) - 요소 검색
- [`조각(배열, 시작, 끝)`](/docs/builtin-functions/array/) - 부분 배열
- [`포함(배열, 값)`](/docs/builtin-functions/array/) - 포함 여부
- [`매핑(배열, 함수)`](/docs/builtin-functions/higher-order/) - 변환
- [`걸러내기(배열, 함수)`](/docs/builtin-functions/higher-order/) - 필터
- [`줄이기(배열, 함수, 초기값)`](/docs/builtin-functions/higher-order/) - 축약
