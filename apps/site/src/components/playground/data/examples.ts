export type ExampleCategory = "기본" | "제어흐름" | "함수" | "클래스" | "고급";

export interface Example {
  id: string;
  name: string;
  description: string;
  category: ExampleCategory;
  code: string;
}

export const categories: ExampleCategory[] = [
  "기본",
  "제어흐름",
  "함수",
  "클래스",
  "고급",
];

export const examples: Example[] = [
  {
    id: "hello",
    name: "기본 출력",
    description: "변수 선언과 출력",
    category: "기본",
    code: `// 기본 변수와 출력
정수 나이 = 25
실수 키 = 175.5
문자 이름 = "홍길동"

출력("이름: " + 이름)
출력("나이: {나이}")
출력("키: {키}")
`,
  },
  {
    id: "loop",
    name: "반복문",
    description: "반복문 사용 예제",
    category: "제어흐름",
    code: `// 반복문 예제
정수 합계 = 0
정수 i = 1
반복 i <= 10 동안:
    합계 += i
    i += 1

출력("1부터 10까지의 합: {합계}")
`,
  },
  {
    id: "function",
    name: "함수 정의",
    description: "함수 선언과 호출",
    category: "함수",
    code: `// 함수 정의와 호출
함수 더하기(정수 a, 정수 b) -> 정수:
    리턴 a + b

함수 팩토리얼(정수 n) -> 정수:
    만약 n <= 1 라면:
        리턴 1
    리턴 n * 팩토리얼(n - 1)

정수 합 = 더하기(3, 5)
정수 팩 = 팩토리얼(5)
출력("3 + 5 = {합}")
출력("5! = {팩}")
`,
  },
  {
    id: "class",
    name: "클래스",
    description: "클래스 정의와 사용",
    category: "클래스",
    code: `// 클래스 예제
클래스 동물:
    문자 이름
    문자 소리말
    생성(문자 이름, 문자 소리말):
        자기.이름 = 이름
        자기.소리말 = 소리말
    함수 울기() -> 문자:
        리턴 자기.이름 + ": " + 자기.소리말

동물 고양이 = 동물("나비", "야옹")
동물 강아지 = 동물("멍멍이", "멍멍")

출력(고양이.울기())
출력(강아지.울기())
`,
  },
  {
    id: "error-handling",
    name: "에러 처리",
    description: "시도-실패 구문",
    category: "고급",
    code: `// 에러 처리 예제
시도:
    정수 결과 = 10 / 2
    출력("10 / 2 = {결과}")
    정수 오류결과 = 10 / 0
    출력("이 줄은 실행되지 않습니다")
실패 오류:
    출력("에러 발생: " + 오류)
`,
  },
  {
    id: "fibonacci",
    name: "피보나치",
    description: "피보나치 수열 계산",
    category: "함수",
    code: `// 피보나치 수열
함수 피보나치(정수 n) -> 정수:
    만약 n == 0 라면:
        리턴 0
    만약 n == 1 라면:
        리턴 1
    리턴 피보나치(n - 1) + 피보나치(n - 2)

출력("피보나치 수열 (처음 10개):")
정수 i = 0
반복 i < 10 동안:
    정수 결과 = 피보나치(i)
    출력("F({i}) = {결과}")
    i += 1
`,
  },
];
