---
title: "설치 & 빌드"
---

## 필요한 환경

- **C++ 컴파일러**: C++17 이상 지원
  - GCC 7.0+, Clang 5.0+, MSVC 2017+
- **CMake**: 3.10 이상
- **Git**: 저장소 클론용

## 설치 단계

### 1. 저장소 클론

```bash
git clone https://github.com/hongik2023graduationproject/hong-ik.git
cd hong-ik
```

### 2. 빌드 디렉토리 생성

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

### REPL 모드

```bash
./cmake-build-debug/HongIk
```

대화형 쉘에서 한 줄씩 코드를 실행합니다:
```
> 정수 x = 10
> 출력(x)
10
>
```

### 바이트코드 VM으로 실행

```bash
./cmake-build-debug/HongIk --vm filename.hik
```

## 플랫폼별 가이드

### Windows

```bash
# Visual Studio 를 사용하는 경우
cmake -B cmake-build-debug -G "Visual Studio 17 2022"
cmake --build cmake-build-debug
```

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
# 필요한 패키지 설치
sudo apt-get install cmake build-essential

# 빌드
cmake -B cmake-build-debug
cmake --build cmake-build-debug
```

## 트러블슈팅

**CMake 버전 오류**
```
CMake 3.10 이상 필요합니다
```
해결: CMake 최신 버전 설치
```bash
cmake --version
```

**C++ 컴파일 오류**
```
C++17을 지원하지 않는 컴파일러
```
해결: 컴파일러 버전 업그레이드 또는 `-DCMAKE_CXX_STANDARD=17` 옵션 추가

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
