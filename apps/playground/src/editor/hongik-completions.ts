import type { languages, editor, IRange } from "monaco-editor";

/**
 * Hong-ik language keyword completions
 */
const keywordCompletions: {
  label: string;
  detail: string;
  insertText: string;
  kind: "Keyword";
}[] = [
  // Type keywords
  { label: "정수", detail: "정수형 타입", insertText: "정수", kind: "Keyword" },
  { label: "실수", detail: "실수형 타입", insertText: "실수", kind: "Keyword" },
  { label: "문자", detail: "문자열 타입", insertText: "문자", kind: "Keyword" },
  { label: "논리", detail: "논리형 타입 (true/false)", insertText: "논리", kind: "Keyword" },
  { label: "불린", detail: "불린형 타입", insertText: "불린", kind: "Keyword" },
  { label: "배열", detail: "배열 타입", insertText: "배열", kind: "Keyword" },
  { label: "사전", detail: "사전(딕셔너리) 타입", insertText: "사전", kind: "Keyword" },
  { label: "상수", detail: "상수 선언", insertText: "상수", kind: "Keyword" },

  // Control flow
  { label: "만약", detail: "조건문 (if)", insertText: "만약", kind: "Keyword" },
  { label: "라면", detail: "조건문 then", insertText: "라면", kind: "Keyword" },
  { label: "아니면", detail: "else 블록", insertText: "아니면", kind: "Keyword" },
  { label: "아니라면", detail: "else if 블록", insertText: "아니라면", kind: "Keyword" },

  // Loops
  { label: "반복", detail: "반복문", insertText: "반복", kind: "Keyword" },
  { label: "동안", detail: "while 반복", insertText: "동안", kind: "Keyword" },
  { label: "부터", detail: "범위 시작 (for-range)", insertText: "부터", kind: "Keyword" },
  { label: "까지", detail: "범위 끝 (for-range)", insertText: "까지", kind: "Keyword" },
  { label: "각각", detail: "forEach 반복", insertText: "각각", kind: "Keyword" },
  { label: "에서", detail: "forEach 소스", insertText: "에서", kind: "Keyword" },
  { label: "멈춤", detail: "반복 중단 (break)", insertText: "멈춤", kind: "Keyword" },
  { label: "계속", detail: "다음 반복 (continue)", insertText: "계속", kind: "Keyword" },

  // Functions & Classes
  { label: "함수", detail: "함수 선언", insertText: "함수", kind: "Keyword" },
  { label: "리턴", detail: "값 반환 (return)", insertText: "리턴", kind: "Keyword" },
  { label: "클래스", detail: "클래스 선언", insertText: "클래스", kind: "Keyword" },
  { label: "자기", detail: "현재 인스턴스 (this)", insertText: "자기", kind: "Keyword" },
  { label: "부모", detail: "부모 클래스 (super)", insertText: "부모", kind: "Keyword" },
  { label: "생성", detail: "생성자 함수", insertText: "생성", kind: "Keyword" },
  { label: "생성자", detail: "생성자 함수", insertText: "생성자", kind: "Keyword" },
  { label: "새로운", detail: "인스턴스 생성 (new)", insertText: "새로운", kind: "Keyword" },

  // Error handling
  { label: "시도", detail: "try 블록", insertText: "시도", kind: "Keyword" },
  { label: "실패", detail: "catch 블록", insertText: "실패", kind: "Keyword" },
  { label: "마침내", detail: "finally 블록", insertText: "마침내", kind: "Keyword" },

  // Match/Switch
  { label: "비교", detail: "match/switch 문", insertText: "비교", kind: "Keyword" },
  { label: "경우", detail: "case 블록", insertText: "경우", kind: "Keyword" },
  { label: "기본", detail: "default 블록", insertText: "기본", kind: "Keyword" },

  // Module
  { label: "가져오기", detail: "모듈 가져오기 (import)", insertText: "가져오기", kind: "Keyword" },

  // Literals
  { label: "참", detail: "true", insertText: "참", kind: "Keyword" },
  { label: "거짓", detail: "false", insertText: "거짓", kind: "Keyword" },
  { label: "없음", detail: "null", insertText: "없음", kind: "Keyword" },

  // Logical operators
  { label: "그리고", detail: "논리 AND (&&)", insertText: "그리고", kind: "Keyword" },
  { label: "또는", detail: "논리 OR (||)", insertText: "또는", kind: "Keyword" },
  { label: "아님", detail: "논리 NOT (!)", insertText: "아님", kind: "Keyword" },

  // Misc
  { label: "오류", detail: "에러 발생", insertText: "오류", kind: "Keyword" },
];

/**
 * Hong-ik built-in function completions
 */
const builtinFunctionCompletions: {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
}[] = [
  // I/O
  {
    label: "출력",
    detail: "콘솔 출력 함수",
    documentation: '값을 콘솔에 출력합니다.\n\n예시: 출력("안녕")',
    insertText: "출력(${1:값})",
  },
  {
    label: "입력",
    detail: "사용자 입력 함수",
    documentation: '사용자로부터 입력을 받습니다.\n\n예시: 입력("이름: ")',
    insertText: '입력(${1:"프롬프트"})',
  },

  // Type / conversion
  {
    label: "길이",
    detail: "길이 반환",
    documentation: '문자열/배열/사전의 길이를 반환합니다.\n\n예시: 길이("abc") → 3',
    insertText: "길이(${1:값})",
  },
  {
    label: "타입",
    detail: "타입 문자열 반환",
    documentation: '값의 타입을 문자열로 반환합니다.\n\n예시: 타입(42) → "정수"',
    insertText: "타입(${1:값})",
  },
  {
    label: "정수변환",
    detail: "정수로 변환",
    documentation: '값을 정수로 변환합니다.\n\n예시: 정수변환("42") → 42',
    insertText: "정수변환(${1:값})",
  },
  {
    label: "실수변환",
    detail: "실수로 변환",
    documentation: '값을 실수로 변환합니다.\n\n예시: 실수변환("3.14") → 3.14',
    insertText: "실수변환(${1:값})",
  },
  {
    label: "문자변환",
    detail: "문자열로 변환",
    documentation: '값을 문자열로 변환합니다.\n\n예시: 문자변환(42) → "42"',
    insertText: "문자변환(${1:값})",
  },

  // Collection operations
  {
    label: "추가",
    detail: "배열에 원소 추가",
    documentation: "배열에 원소를 추가합니다.\n\n예시: 추가(목록, 4)",
    insertText: "추가(${1:배열}, ${2:값})",
  },
  {
    label: "키목록",
    detail: "사전의 키 배열",
    documentation: "사전의 모든 키를 배열로 반환합니다.\n\n예시: 키목록(정보)",
    insertText: "키목록(${1:사전})",
  },
  {
    label: "포함",
    detail: "포함 여부 확인",
    documentation: '컬렉션에 값이 포함되어 있는지 확인합니다.\n\n예시: 포함("hello", "ell") → 참',
    insertText: "포함(${1:컬렉션}, ${2:값})",
  },
  {
    label: "설정",
    detail: "사전에 값 설정",
    documentation: '사전에 키-값 쌍을 설정합니다.\n\n예시: 설정(정보, "키", "값")',
    insertText: "설정(${1:사전}, ${2:키}, ${3:값})",
  },
  {
    label: "삭제",
    detail: "원소 삭제",
    documentation: "배열/사전에서 원소를 삭제합니다.\n\n예시: 삭제(목록, 0)",
    insertText: "삭제(${1:컬렉션}, ${2:키})",
  },
  {
    label: "찾기",
    detail: "인덱스 반환",
    documentation: "배열에서 값의 인덱스를 반환합니다.\n\n예시: 찾기([10,20], 20) → 1",
    insertText: "찾기(${1:배열}, ${2:값})",
  },
  {
    label: "조각",
    detail: "부분 배열/문자열",
    documentation: "배열/문자열의 일부를 잘라냅니다.\n\n예시: 조각([1,2,3,4], 1, 3) → [2,3]",
    insertText: "조각(${1:배열}, ${2:시작}, ${3:끝})",
  },
  {
    label: "정렬",
    detail: "배열 정렬",
    documentation: "배열을 오름차순으로 정렬합니다.\n\n예시: 정렬([3,1,2]) → [1,2,3]",
    insertText: "정렬(${1:배열})",
  },
  {
    label: "뒤집기",
    detail: "순서 뒤집기",
    documentation: "배열/문자열의 순서를 뒤집습니다.\n\n예시: 뒤집기([1,2,3]) → [3,2,1]",
    insertText: "뒤집기(${1:배열})",
  },

  // String operations
  {
    label: "분리",
    detail: "문자열 분리",
    documentation: '문자열을 구분자로 분리합니다.\n\n예시: 분리("a,b", ",") → ["a", "b"]',
    insertText: "분리(${1:문자열}, ${2:구분자})",
  },
  {
    label: "대문자",
    detail: "대문자 변환",
    documentation: '문자열을 대문자로 변환합니다.\n\n예시: 대문자("hello") → "HELLO"',
    insertText: "대문자(${1:문자열})",
  },
  {
    label: "소문자",
    detail: "소문자 변환",
    documentation: '문자열을 소문자로 변환합니다.\n\n예시: 소문자("HELLO") → "hello"',
    insertText: "소문자(${1:문자열})",
  },
  {
    label: "치환",
    detail: "문자열 치환",
    documentation: '문자열에서 대상을 교체합니다.\n\n예시: 치환("hello", "l", "r") → "herro"',
    insertText: "치환(${1:원본}, ${2:대상}, ${3:교체})",
  },
  {
    label: "자르기",
    detail: "양쪽 공백 제거",
    documentation: '문자열의 양쪽 공백을 제거합니다.\n\n예시: 자르기("  hi  ") → "hi"',
    insertText: "자르기(${1:문자열})",
  },

  // File I/O
  {
    label: "파일읽기",
    detail: "파일 읽기",
    documentation: '파일의 내용을 읽어 반환합니다.\n\n예시: 파일읽기("data.txt")',
    insertText: '파일읽기(${1:"경로"})',
  },
  {
    label: "파일쓰기",
    detail: "파일 쓰기",
    documentation: '파일에 내용을 씁니다.\n\n예시: 파일쓰기("out.txt", "내용")',
    insertText: '파일쓰기(${1:"경로"}, ${2:내용})',
  },

  // Math basics
  {
    label: "절대값",
    detail: "절대값",
    documentation: "숫자의 절대값을 반환합니다.\n\n예시: 절대값(-42) → 42",
    insertText: "절대값(${1:숫자})",
  },
  {
    label: "제곱근",
    detail: "제곱근",
    documentation: "숫자의 제곱근을 반환합니다.\n\n예시: 제곱근(16) → 4.0",
    insertText: "제곱근(${1:숫자})",
  },
  {
    label: "최대",
    detail: "큰 값 반환",
    documentation: "두 값 중 큰 값을 반환합니다.\n\n예시: 최대(10, 20) → 20",
    insertText: "최대(${1:a}, ${2:b})",
  },
  {
    label: "최소",
    detail: "작은 값 반환",
    documentation: "두 값 중 작은 값을 반환합니다.\n\n예시: 최소(10, 20) → 10",
    insertText: "최소(${1:a}, ${2:b})",
  },
  {
    label: "난수",
    detail: "난수 생성",
    documentation: "범위 내 난수를 생성합니다.\n\n예시: 난수(1, 100)",
    insertText: "난수(${1:최소}, ${2:최대})",
  },

  // Higher-order functions
  {
    label: "매핑",
    detail: "배열 변환 (map)",
    documentation: "배열의 각 원소에 함수를 적용합니다.\n\n예시: 매핑([1,2,3], 두배) → [2,4,6]",
    insertText: "매핑(${1:배열}, ${2:함수})",
  },
  {
    label: "걸러내기",
    detail: "배열 필터 (filter)",
    documentation: "조건에 맞는 원소만 걸러냅니다.\n\n예시: 걸러내기([1,-2,3], 양수) → [1,3]",
    insertText: "걸러내기(${1:배열}, ${2:함수})",
  },
  {
    label: "줄이기",
    detail: "배열 축약 (reduce)",
    documentation: "배열을 하나의 값으로 축약합니다.\n\n예시: 줄이기([1,2,3], 합, 0) → 6",
    insertText: "줄이기(${1:배열}, ${2:함수}, ${3:초기값})",
  },

  // Math - trigonometric
  {
    label: "사인",
    detail: "사인 함수 (sin)",
    documentation: "라디안 값의 사인을 반환합니다.\n\n예시: 사인(0.0) → 0.0",
    insertText: "사인(${1:라디안})",
  },
  {
    label: "코사인",
    detail: "코사인 함수 (cos)",
    documentation: "라디안 값의 코사인을 반환합니다.\n\n예시: 코사인(0.0) → 1.0",
    insertText: "코사인(${1:라디안})",
  },
  {
    label: "탄젠트",
    detail: "탄젠트 함수 (tan)",
    documentation: "라디안 값의 탄젠트를 반환합니다.\n\n예시: 탄젠트(0.0) → 0.0",
    insertText: "탄젠트(${1:라디안})",
  },

  // Math - logarithmic
  {
    label: "로그",
    detail: "상용로그 (log10)",
    documentation: "상용로그(밑 10)를 반환합니다.\n\n예시: 로그(100.0) → 2.0",
    insertText: "로그(${1:숫자})",
  },
  {
    label: "자연로그",
    detail: "자연로그 (ln)",
    documentation: "자연로그(밑 e)를 반환합니다.\n\n예시: 자연로그(1.0) → 0.0",
    insertText: "자연로그(${1:숫자})",
  },

  // Math - power & constants
  {
    label: "거듭제곱",
    detail: "거듭제곱 (pow)",
    documentation: "밑의 지수 거듭제곱을 반환합니다.\n\n예시: 거듭제곱(2, 10) → 1024",
    insertText: "거듭제곱(${1:밑}, ${2:지수})",
  },
  {
    label: "파이",
    detail: "원주율 상수 (π)",
    documentation: "원주율 π 값을 반환합니다 (3.14159...).\n\n예시: 파이() → 3.14159...",
    insertText: "파이()",
  },
  {
    label: "자연수e",
    detail: "자연상수 (e)",
    documentation: "자연상수 e 값을 반환합니다 (2.71828...).\n\n예시: 자연수e() → 2.71828...",
    insertText: "자연수e()",
  },

  // Math - rounding
  {
    label: "반올림",
    detail: "반올림 (round)",
    documentation: "실수를 반올림합니다.\n\n예시: 반올림(3.7) → 4",
    insertText: "반올림(${1:숫자})",
  },
  {
    label: "올림",
    detail: "올림 (ceil)",
    documentation: "실수를 올림합니다.\n\n예시: 올림(3.2) → 4",
    insertText: "올림(${1:숫자})",
  },
  {
    label: "내림",
    detail: "내림 (floor)",
    documentation: "실수를 내림합니다.\n\n예시: 내림(3.9) → 3",
    insertText: "내림(${1:숫자})",
  },
];

/**
 * Hong-ik language snippet completions
 */
const snippetCompletions: {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
}[] = [
  {
    label: "함수 정의",
    detail: "함수 선언 템플릿",
    documentation: "새로운 함수를 정의합니다.\n\n함수 이름(타입 매개변수) -> 반환타입:\n    리턴 값",
    insertText: [
      "함수 ${1:이름}(${2:매개변수}) -> ${3:정수}:",
      "\t리턴 ${4:값}",
    ].join("\n"),
  },
  {
    label: "만약-라면",
    detail: "조건문 템플릿",
    documentation: "조건 분기문을 생성합니다.\n\n만약 조건 라면:\n    ...",
    insertText: [
      "만약 ${1:조건} 라면:",
      "\t${2:// 참일 때}",
    ].join("\n"),
  },
  {
    label: "만약-아니면",
    detail: "조건문 + else 템플릿",
    documentation: "조건 분기문과 else 블록을 생성합니다.\n\n만약 조건 라면:\n    ...\n아니면:\n    ...",
    insertText: [
      "만약 ${1:조건} 라면:",
      "\t${2:// 참일 때}",
      "아니면:",
      "\t${3:// 거짓일 때}",
    ].join("\n"),
  },
  {
    label: "반복 동안 (while)",
    detail: "while 반복문 템플릿",
    documentation: "조건 기반 반복문을 생성합니다.\n\n반복 조건 동안:\n    ...",
    insertText: [
      "반복 ${1:조건} 동안:",
      "\t${2:// 본문}",
    ].join("\n"),
  },
  {
    label: "반복 부터 까지 (for-range)",
    detail: "범위 반복문 템플릿",
    documentation: "범위 기반 반복문을 생성합니다.\n\n반복 정수 i = 0 부터 10 까지:\n    출력(i)",
    insertText: [
      "반복 정수 ${1:i} = ${2:0} 부터 ${3:10} 까지:",
      "\t${4:// 본문}",
    ].join("\n"),
  },
  {
    label: "각각 에서 (forEach)",
    detail: "forEach 반복문 템플릿",
    documentation: "배열의 각 원소를 순회합니다.\n\n각각 정수 원소 배열 에서:\n    출력(원소)",
    insertText: [
      "각각 ${1:정수} ${2:원소} ${3:배열} 에서:",
      "\t${4:// 본문}",
    ].join("\n"),
  },
  {
    label: "클래스 정의",
    detail: "클래스 선언 템플릿",
    documentation: "새로운 클래스를 정의합니다.\n\n클래스 이름:\n    속성\n    생성(매개변수):\n        ...",
    insertText: [
      "클래스 ${1:이름}:",
      "\t${2:문자} ${3:속성}",
      "",
      "\t생성(${4:매개변수}):",
      "\t\t자기.${3:속성} = ${4:매개변수}",
      "",
      "\t함수 ${5:메서드}() -> ${6:문자}:",
      "\t\t${7:리턴 자기.${3:속성}}",
    ].join("\n"),
  },
  {
    label: "시도-실패",
    detail: "try-catch 템플릿",
    documentation: "에러 처리 블록을 생성합니다.\n\n시도:\n    ...\n실패 오류:\n    출력(오류)",
    insertText: [
      "시도:",
      "\t${1:// 시도할 코드}",
      "실패 ${2:오류}:",
      "\t출력(${2:오류})",
    ].join("\n"),
  },
  {
    label: "비교문 (match/switch)",
    detail: "match/switch 템플릿",
    documentation: "값에 따라 분기하는 비교문을 생성합니다.\n\n비교 값:\n    경우 1:\n        ...\n    기본:\n        ...",
    insertText: [
      "비교 ${1:값}:",
      "\t경우 ${2:1}:",
      "\t\t${3:// 처리}",
      "\t경우 ${4:2}:",
      "\t\t${5:// 처리}",
      "\t기본:",
      "\t\t${6:// 기본 처리}",
    ].join("\n"),
  },
  {
    label: "변수 선언 (정수)",
    detail: "정수형 변수 선언",
    documentation: "정수형 변수를 선언합니다.\n\n정수 변수명 = 0",
    insertText: "정수 ${1:변수명} = ${2:0}",
  },
  {
    label: "변수 선언 (문자)",
    detail: "문자열 변수 선언",
    documentation: '문자열 변수를 선언합니다.\n\n문자 변수명 = "값"',
    insertText: '문자 ${1:변수명} = "${2:값}"',
  },
  {
    label: "변수 선언 (배열)",
    detail: "배열 변수 선언",
    documentation: "배열 변수를 선언합니다.\n\n배열 목록 = [1, 2, 3]",
    insertText: "배열 ${1:목록} = [${2:값}]",
  },
  {
    label: "변수 선언 (사전)",
    detail: "사전 변수 선언",
    documentation: '사전 변수를 선언합니다.\n\n사전 정보 = {"키": "값"}',
    insertText: '사전 ${1:정보} = {"${2:키}": "${3:값}"}',
  },
  {
    label: "출력문",
    detail: "출력 함수 호출",
    documentation: '값을 콘솔에 출력합니다.\n\n출력("메시지")',
    insertText: '출력(${1:"메시지"})',
  },
  {
    label: "가져오기 (import)",
    detail: "모듈 가져오기 템플릿",
    documentation: '외부 파일을 가져옵니다.\n\n가져오기 "파일명.hik"',
    insertText: '가져오기 "${1:파일명.hik}"',
  },
];

/**
 * Register the Hong-ik CompletionItemProvider with Monaco
 */
export function registerHongikCompletions(
  monacoInstance: typeof import("monaco-editor"),
  languageId: string
): void {
  monacoInstance.languages.registerCompletionItemProvider(languageId, {
    provideCompletionItems(
      model: editor.ITextModel,
      position: { lineNumber: number; column: number }
    ): languages.ProviderResult<languages.CompletionList> {
      const word = model.getWordUntilPosition(position);
      const range: IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: languages.CompletionItem[] = [];

      // Keyword completions
      for (const kw of keywordCompletions) {
        suggestions.push({
          label: kw.label,
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          detail: kw.detail,
          insertText: kw.insertText,
          range,
        });
      }

      // Built-in function completions
      for (const fn of builtinFunctionCompletions) {
        suggestions.push({
          label: fn.label,
          kind: monacoInstance.languages.CompletionItemKind.Function,
          detail: fn.detail,
          documentation: fn.documentation,
          insertText: fn.insertText,
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        });
      }

      // Snippet completions
      for (const snip of snippetCompletions) {
        suggestions.push({
          label: snip.label,
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          detail: snip.detail,
          documentation: snip.documentation,
          insertText: snip.insertText,
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        });
      }

      return { suggestions };
    },
  });
}
