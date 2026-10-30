---
title: "논리 (Boolean)"
---

논리 타입은 참(`true`) 또는 거짓(`false`) 값을 나타냅니다.

## 선언

```hik
논리 참값 = true
논리 거짓값 = false
```

## 논리 연산

```hik
true && true     // true  (AND)
true || false    // true  (OR)
!true            // false (NOT)
```

## 비교 연산 결과

비교 연산의 결과는 항상 논리 값입니다:

```hik
정수 x = 10
논리 결과 = x > 5     // true
논리 같음 = x == 10   // true
```

## 조건문에서의 사용

논리 값은 조건문에서 직접 사용됩니다:

```hik
논리 활성 = true

만약 활성 라면:
    출력("활성 상태입니다")
```
