import type { languages, editor, IRange } from "monaco-editor";

/**
 * Hong-ik language keyword completions
 */
const keywordCompletions: {
  label: string;
  detail: string;
  insertText: string;
  kind: "Keyword" | "Snippet";
}[] = [
  // Type keywords
  { label: "정수", detail: "정수형 변수", insertText: "정수", kind: "Keyword" },
  { label: "실수", detail: "실수형 변수", insertText: "실수", kind: "Keyword" },
  { label: "문자", detail: "문자열 변수", insertText: "문자", kind: "Keyword" },
  { label: "불린", detail: "불린형 변수", insertText: "불린", kind: "Keyword" },
  { label: "상수", detail: "상수 선언", insertText: "상수", kind: "Keyword" },

  // Control flow
  { label: "만약", detail: "조건문", insertText: "만약", kind: "Keyword" },
  { label: "라면", detail: "조건문 (then)", insertText: "라면", kind: "Keyword" },
  { label: "아니면", detail: "else 블록", insertText: "아니면", kind: "Keyword" },
  { label: "아니라면", detail: "else if 블록", insertText: "아니라면", kind: "Keyword" },

  // Loops
  { label: "반복", detail: "반복문", insertText: "반복", kind: "Keyword" },
  { label: "동안", detail: "while 반복", insertText: "동안", kind: "Keyword" },
  { label: "멈춤", detail: "반복 중단 (break)", insertText: "멈춤", kind: "Keyword" },
  { label: "계속", detail: "다음 반복 (continue)", insertText: "계속", kind: "Keyword" },

  // Functions & Classes
  { label: "함수", detail: "함수 선언", insertText: "함수", kind: "Keyword" },
  { label: "리턴", detail: "값 반환", insertText: "리턴", kind: "Keyword" },
  { label: "클래스", detail: "클래스 선언", insertText: "클래스", kind: "Keyword" },
  { label: "자기", detail: "현재 인스턴스 (this)", insertText: "자기", kind: "Keyword" },
  { label: "생성자", detail: "생성자 함수", insertText: "생성자", kind: "Keyword" },
  { label: "새로운", detail: "인스턴스 생성 (new)", insertText: "새로운", kind: "Keyword" },

  // Error handling
  { label: "시도", detail: "try 블록", insertText: "시도", kind: "Keyword" },
  { label: "실패", detail: "catch 블록", insertText: "실패", kind: "Keyword" },
  { label: "마침내", detail: "finally 블록", insertText: "마침내", kind: "Keyword" },

  // Literals
  { label: "참", detail: "true", insertText: "참", kind: "Keyword" },
  { label: "거짓", detail: "false", insertText: "거짓", kind: "Keyword" },
  { label: "없음", detail: "null", insertText: "없음", kind: "Keyword" },

  // Logical operators
  { label: "그리고", detail: "논리 AND (&&)", insertText: "그리고", kind: "Keyword" },
  { label: "또는", detail: "논리 OR (||)", insertText: "또는", kind: "Keyword" },
  { label: "아님", detail: "논리 NOT (!)", insertText: "아님", kind: "Keyword" },

  // Built-in functions
  { label: "출력", detail: "콘솔 출력 함수", insertText: "출력", kind: "Keyword" },
  { label: "입력", detail: "사용자 입력 함수", insertText: "입력", kind: "Keyword" },
  { label: "오류", detail: "에러 발생", insertText: "오류", kind: "Keyword" },
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
    documentation: "새로운 함수를 정의합니다.",
    insertText: [
      "함수 ${1:이름}(${2:매개변수}) {",
      "\t${3:// 본문}",
      "\t리턴 ${4:값};",
      "}",
    ].join("\n"),
  },
  {
    label: "만약-라면",
    detail: "조건문 템플릿",
    documentation: "조건 분기문을 생성합니다.",
    insertText: [
      "만약 (${1:조건}) 라면 {",
      "\t${2:// 참일 때}",
      "}",
    ].join("\n"),
  },
  {
    label: "만약-아니면",
    detail: "조건문 + else 템플릿",
    documentation: "조건 분기문과 else 블록을 생성합니다.",
    insertText: [
      "만약 (${1:조건}) 라면 {",
      "\t${2:// 참일 때}",
      "} 아니면 {",
      "\t${3:// 거짓일 때}",
      "}",
    ].join("\n"),
  },
  {
    label: "반복문 (for)",
    detail: "for 반복문 템플릿",
    documentation: "카운터 기반 반복문을 생성합니다.",
    insertText: [
      "반복 (정수 ${1:i} = ${2:0}; ${1:i} < ${3:10}; ${1:i} = ${1:i} + 1) {",
      "\t${4:// 본문}",
      "}",
    ].join("\n"),
  },
  {
    label: "동안 반복 (while)",
    detail: "while 반복문 템플릿",
    documentation: "조건 기반 반복문을 생성합니다.",
    insertText: [
      "동안 (${1:조건}) {",
      "\t${2:// 본문}",
      "}",
    ].join("\n"),
  },
  {
    label: "클래스 정의",
    detail: "클래스 선언 템플릿",
    documentation: "새로운 클래스를 정의합니다.",
    insertText: [
      "클래스 ${1:이름} {",
      "\t${2:문자} ${3:속성};",
      "",
      "\t함수 생성자(${4:매개변수}) {",
      "\t\t자기.${3:속성} = ${4:매개변수};",
      "\t}",
      "",
      "\t함수 ${5:메서드}() {",
      "\t\t${6:// 본문}",
      "\t}",
      "}",
    ].join("\n"),
  },
  {
    label: "시도-실패",
    detail: "try-catch 템플릿",
    documentation: "에러 처리 블록을 생성합니다.",
    insertText: [
      "시도 {",
      "\t${1:// 시도할 코드}",
      "} 실패 (${2:에러}) {",
      "\t출력(${2:에러});",
      "}",
    ].join("\n"),
  },
  {
    label: "변수 선언 (정수)",
    detail: "정수형 변수 선언",
    documentation: "정수형 변수를 선언합니다.",
    insertText: "정수 ${1:변수명} = ${2:0};",
  },
  {
    label: "변수 선언 (문자)",
    detail: "문자열 변수 선언",
    documentation: "문자열 변수를 선언합니다.",
    insertText: '문자 ${1:변수명} = "${2:값}";',
  },
  {
    label: "출력문",
    detail: "출력 함수 호출",
    documentation: "값을 콘솔에 출력합니다.",
    insertText: '출력(${1:"메시지"});',
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
          kind: kw.kind === "Keyword"
            ? monacoInstance.languages.CompletionItemKind.Keyword
            : monacoInstance.languages.CompletionItemKind.Snippet,
          detail: kw.detail,
          insertText: kw.insertText,
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
