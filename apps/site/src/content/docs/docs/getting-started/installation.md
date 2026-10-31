---
title: "설치 & 빌드"
---

:::tip[설치 없이 써 보기]
[플레이그라운드](/playground/)에서는 설치 없이 브라우저에서 바로 코드를 실행할 수 있습니다. 파일 입출력·`입력`·`가져오기`처럼 컴퓨터와 상호작용하는 기능을 쓰려면 아래처럼 직접 빌드하세요.
:::

## 필요한 환경

- **C++ 컴파일러**: C++26을 지원하는 최신 컴파일러 (네이티브 빌드는 `CMAKE_CXX_STANDARD 26`)
  - 예: GCC 13 이상, 최신 Clang / Apple Clang, Visual Studio 2022(MSVC)
- **CMake**: 3.28 이상
- **Git**: 저장소 클론용
- **인터넷 연결**: 처음 구성할 때 CMake가 Google Test 등 의존성을 내려받습니다
- (선택) WASM 빌드: [Emscripten](https://emscripten.org/) — WASM 타깃은 C++20으로 컴파일됩니다 (`scripts/build-wasm.sh`)

## 설치 단계

### 1. 저장소 클론

```bash
git clone https://github.com/hongik2023graduationproject/hong-ik.git
cd hong-ik
```

### 2. 빌드 구성

```bash
cmake -B cmake-build-debug
```

옵션:
- Release 빌드: `cmake -B cmake-build-release -DCMAKE_BUILD_TYPE=Release`

### 3. 빌드

```bash
cmake --build cmake-build-debug
```

빌드 완료 후 다음 위치에서 실행 파일을 찾을 수 있습니다:
- **인터프리터**: `cmake-build-debug/HongIk`
- **테스트**: `cmake-build-debug/HongIkTests`
- **Language Server** (VSCode 확장용, 선택): `cmake --build cmake-build-debug --target hongik-lsp`

## 테스트 실행

전체 테스트 실행:
```bash
ctest --test-dir cmake-build-debug
```

특정 테스트만 실행 (예: 렉서 테스트):
```bash
cmake-build-debug/HongIkTests --gtest_filter="LexerTest.*"
```

## 기본 사용법

### 파일 실행

```bash
./cmake-build-debug/HongIk filename.hik
```

기본 실행 엔진은 바이트코드 VM입니다.

### REPL 모드

```bash
./cmake-build-debug/HongIk
```

대화형 쉘에서 한 줄씩 코드를 실행합니다:
```text
>>> 정수 x = 10
>>> 출력(x)
10
>>> 종료하기
```

자세한 내용은 [REPL 모드](/docs/getting-started/repl/)를 참고하세요.

### 명령줄 옵션

| 옵션 | 설명 |
|------|------|
| (없음) | 바이트코드 VM으로 실행 (기본) |
| `--eval` | 트리워킹 인터프리터로 실행. 고차 함수(`매핑`·`걸러내기`·`줄이기`)와 `부모.메서드()`는 현재 이 모드에서만 동작합니다 |
| `--type-check=off\|warn\|strict` | 실행 전 정적 타입 검사. 기본 `warn`은 `type-warning[...]`을 출력하고 그대로 실행, `strict`는 `type-error[...]`를 출력하고 실행하지 않음, `off`는 검사 생략 |

```bash
./cmake-build-debug/HongIk --eval filename.hik
./cmake-build-debug/HongIk --type-check=strict filename.hik
```

예전 문서에 나오던 `--vm` 플래그는 호환을 위해 받아들이지만 아무 효과가 없습니다(이미 VM이 기본입니다). 두 실행 엔진의 차이는 [바이트코드 VM](/docs/language-reference/vm/)을 참고하세요.

## 플랫폼별 가이드

### Windows

```bash
# Visual Studio 2022를 사용하는 경우
cmake -B cmake-build-debug -G "Visual Studio 17 2022"
cmake --build cmake-build-debug
```

Visual Studio 생성기는 구성별 하위 폴더를 만들므로 실행 파일은 `cmake-build-debug\Debug\HongIk.exe`에 생깁니다.

### macOS

```bash
# Homebrew로 필요 도구 설치
brew install cmake

# 빌드
cmake -B cmake-build-debug
cmake --build cmake-build-debug
```

### Linux

```bash
# 필요한 패키지 설치 (배포판의 GCC가 13 미만이면 더 새 버전을 설치하세요)
sudo apt-get install cmake build-essential

# 빌드
cmake -B cmake-build-debug
cmake --build cmake-build-debug
```

## 트러블슈팅

**CMake 버전 오류**
```text
CMake 3.28 or higher is required.
```
해결: CMake 3.28 이상을 설치하고 버전을 확인하세요.
```bash
cmake --version
```

**C++ 컴파일 오류**

C++26 표준 옵션을 모르는 오래된 컴파일러에서는 구성이나 컴파일이 실패합니다. 컴파일러를 최신 버전으로 업그레이드하세요(C++ 표준을 낮추는 옵션으로는 빌드되지 않습니다).

**빌드 폴더 캐시 문제**
```bash
# 빌드 폴더 완전 삭제 후 재빌드
rm -rf cmake-build-debug
cmake -B cmake-build-debug
cmake --build cmake-build-debug
```

## 다음 단계

설치가 완료되었습니다! 이제:
- [첫 프로그램](/docs/getting-started/first-program/)을 작성해보세요
- [언어 레퍼런스](/docs/language-reference/types/)로 문법을 배우세요
