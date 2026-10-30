---
title: "문자 (String)"
---

문자 타입은 텍스트 데이터를 나타냅니다.

## 선언

```hik
문자 이름 = "홍길동"
문자 빈문자 = ""
```

## 문자열 보간

중괄호 `{}`를 사용하여 변수 값을 문자열에 삽입합니다:

```hik
문자 이름 = "홍길동"
문자 인사 = "안녕 {이름}님"    // "안녕 홍길동님"
출력(인사)
```

## 문자열 연결

`+` 연산자로 문자열을 연결합니다:

```hik
문자 성 = "홍"
문자 이름 = "길동"
문자 전체이름 = 성 + 이름    // "홍길동"
```

## 인덱싱

문자열의 개별 문자에 접근할 수 있습니다:

```hik
문자 텍스트 = "안녕하세요"
출력(텍스트[0])     // "안"
출력(텍스트[-1])    // "요" (음수 인덱싱)
```

## 관련 내장 함수

- [`길이(문자열)`](/docs/builtin-functions/string/) - 문자열 길이
- [`대문자(문자열)`](/docs/builtin-functions/string/) - 대문자 변환
- [`소문자(문자열)`](/docs/builtin-functions/string/) - 소문자 변환
- [`분리(문자열, 구분자)`](/docs/builtin-functions/string/) - 문자열 분리
- [`치환(원본, 대상, 교체)`](/docs/builtin-functions/string/) - 문자열 치환
- [`자르기(문자열)`](/docs/builtin-functions/string/) - 양쪽 공백 제거
- [`포함(문자열, 대상)`](/docs/builtin-functions/string/) - 포함 여부 확인
- [`뒤집기(문자열)`](/docs/builtin-functions/string/) - 문자열 뒤집기
