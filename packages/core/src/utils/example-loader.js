/**
 * Load example code for Hong-ik playground
 */
export const BASIC_EXAMPLES = [
    {
        id: 'hello-world',
        title: 'Hello World',
        category: 'basic',
        description: '기본 출력 예제',
        code: '출력("안녕하세요, 홍익!");',
        expectedOutput: '안녕하세요, 홍익!',
    },
    {
        id: 'variables',
        title: '변수 선언',
        category: 'basic',
        description: '변수 타입과 선언',
        code: `정수 x = 10;
실수 pi = 3.14;
문자 이름 = "홍길동";
불린 참값 = 참;

출력(x);
출력(pi);
출력(이름);
출력(참값);`,
        expectedOutput: `10
3.14
홍길동
참`,
    },
    {
        id: 'arithmetic',
        title: '산술 연산',
        category: 'basic',
        description: '기본 수학 연산',
        code: `정수 a = 10;
정수 b = 3;

출력(a + b);
출력(a - b);
출력(a * b);
출력(a / b);
출력(a % b);`,
        expectedOutput: `13
7
30
3
1`,
    },
];
export const INTERMEDIATE_EXAMPLES = [
    {
        id: 'function-basic',
        title: '함수 선언',
        category: 'intermediate',
        description: '기본 함수 작성',
        code: `함수 더하기(a, b) {
  리턴 a + b;
}

출력(더하기(5, 3));`,
        expectedOutput: '8',
    },
    {
        id: 'if-statement',
        title: '조건문',
        category: 'intermediate',
        description: '조건문 사용',
        code: `정수 x = 10;

만약 (x > 5) 라면 {
  출력("x는 5보다 크다");
} 아니면 {
  출력("x는 5 이하다");
}`,
        expectedOutput: 'x는 5보다 크다',
    },
    {
        id: 'for-loop',
        title: 'For 반복문',
        category: 'intermediate',
        description: '범위 반복',
        code: `반복 (정수 i = 0; i < 5; i = i + 1) {
  출력(i);
}`,
        expectedOutput: `0
1
2
3
4`,
    },
];
export const ADVANCED_EXAMPLES = [
    {
        id: 'class-basic',
        title: '클래스 선언',
        category: 'advanced',
        description: '객체 지향 프로그래밍',
        code: `클래스 동물 {
  문자 이름;
  정수 나이;

  함수 생성자(이름, 나이) {
    자기.이름 = 이름;
    자기.나이 = 나이;
  }

  함수 소개() {
    리턴 자기.이름;
  }
}

동물 개 = 동물("뽀삐", 3);
출력(개.소개());`,
        expectedOutput: '뽀삐',
    },
    {
        id: 'error-handling',
        title: '에러 처리',
        category: 'advanced',
        description: '시도-실패 구문',
        code: `함수 나누기(a, b) {
  만약 (b == 0) 라면 {
    오류("0으로 나눌 수 없습니다!");
  }
  리턴 a / b;
}

시도 {
  정수 결과 = 나누기(10, 0);
} 실패 (에러) {
  출력("에러: " + 에러);
}`,
        expectedOutput: '에러: 0으로 나눌 수 없습니다!',
    },
];
export function getExampleByCategory(category) {
    switch (category) {
        case 'basic':
            return BASIC_EXAMPLES;
        case 'intermediate':
            return INTERMEDIATE_EXAMPLES;
        case 'advanced':
            return ADVANCED_EXAMPLES;
        default:
            return [];
    }
}
export function getAllExamples() {
    return [...BASIC_EXAMPLES, ...INTERMEDIATE_EXAMPLES, ...ADVANCED_EXAMPLES];
}
//# sourceMappingURL=example-loader.js.map