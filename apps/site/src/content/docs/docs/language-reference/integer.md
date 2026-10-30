---
title: "정수 (Integer)"
---

정수 타입은 소수점 없는 숫자를 나타냅니다.

## 선언

```hik
정수 x = 42
정수 음수 = -10
정수 영 = 0
```

## 연산

```hik
정수 a = 10
정수 b = 3

출력(a + b)    // 13 (덧셈)
출력(a - b)    // 7  (뺄셈)
출력(a * b)    // 30 (곱셈)
출력(a / b)    // 3  (나눗셈)
출력(a % b)    // 1  (나머지)
```

## 비교 연산

```hik
10 == 10    // true
10 != 5     // true
10 > 5      // true
10 < 20     // true
10 >= 10    // true
10 <= 15    // true
```

## 복합 대입

```hik
정수 x = 10
x += 5     // x = 15
x -= 3     // x = 12
x *= 2     // x = 24
x /= 4     // x = 6
```

## 관련 내장 함수

- [`정수변환(값)`](/docs/builtin-functions/type-conversion/) - 다른 타입을 정수로 변환
- [`절대값(숫자)`](/docs/builtin-functions/math/) - 절대값 반환
- [`최대(a, b)`](/docs/builtin-functions/math/) - 큰 값 반환
- [`최소(a, b)`](/docs/builtin-functions/math/) - 작은 값 반환
