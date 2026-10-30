import type { languages } from "monaco-editor";

export const HONGIK_LANGUAGE_ID = "hongik";

export const hongikLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

export const hongikTokensProvider: languages.IMonarchLanguage = {
  controlKeywords: [
    "만약", "라면", "아니면", "아니라면",
    "반복", "동안", "부터", "까지", "각각", "에서", "멈춤", "계속",
    "리턴",
    "비교", "경우", "기본",
    "시도", "실패", "마침내",
    "그리고", "또는", "아님",
  ],

  typeKeywords: [
    "정수", "실수", "문자", "불린", "논리", "배열", "사전", "상수",
  ],

  declarationKeywords: [
    "함수", "클래스", "생성", "생성자", "새로운", "가져오기",
  ],

  selfKeywords: [
    "자기", "부모",
  ],

  constantLiterals: [
    "참", "거짓", "없음",
  ],

  builtinFunctions: [
    "출력", "입력", "오류",
    "길이", "타입", "정수변환", "실수변환", "문자변환",
    "추가", "키목록", "포함", "설정", "삭제", "찾기", "조각", "정렬", "뒤집기",
    "분리", "대문자", "소문자", "치환", "자르기",
    "파일읽기", "파일쓰기",
    "절대값", "제곱근", "최대", "최소", "난수",
    "매핑", "걸러내기", "줄이기",
    "사인", "코사인", "탄젠트", "로그", "자연로그", "거듭제곱", "파이", "자연수e",
    "반올림", "올림", "내림",
  ],

  operators: [
    "=", ">", "<", "!", "~",
    "==", "!=", "<=", ">=",
    "+", "-", "*", "/", "%",
    "&&", "||",
  ],

  symbols: /[=><!~?:&|+\-*/^%]+/,

  tokenizer: {
    root: [
      // Comments
      [/\/\/.*$/, "comment"],
      [/\/\*/, "comment", "@comment"],

      // Strings
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/"/, "string", "@string_double"],
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      [/'/, "string", "@string_single"],

      // Numbers
      [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
      [/\d+/, "number"],

      // Keywords and identifiers
      [/[가-힣a-zA-Z_][가-힣a-zA-Z0-9_]*/, {
        cases: {
          "@controlKeywords": "keyword.control",
          "@typeKeywords": "keyword.type",
          "@declarationKeywords": "keyword.declaration",
          "@selfKeywords": "keyword.self",
          "@constantLiterals": "constant.language",
          "@builtinFunctions": "support.function",
          "@default": "identifier",
        },
      }],

      // Whitespace
      [/[ \t\r\n]+/, "white"],

      // Delimiters and operators
      [/[{}()[\]]/, "@brackets"],
      [/@symbols/, {
        cases: {
          "@operators": "operator",
          "@default": "",
        },
      }],

      // Delimiter
      [/[;,.]/, "delimiter"],
    ],

    comment: [
      [/[^/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[/*]/, "comment"],
    ],

    string_double: [
      [/\{/, "string.interpolation", "@interpolation"],
      [/[^\\"{]+/, "string"],
      [/\\./, "string.escape"],
      [/"/, "string", "@pop"],
    ],

    string_single: [
      [/\{/, "string.interpolation", "@interpolation"],
      [/[^\\'{]+/, "string"],
      [/\\./, "string.escape"],
      [/'/, "string", "@pop"],
    ],

    interpolation: [
      [/[가-힣a-zA-Z_][가-힣a-zA-Z0-9_]*/, "string.interpolation"],
      [/\./, "string.interpolation"],
      [/\}/, "string.interpolation", "@pop"],
      [/./, "string"],
    ],
  },
};

export const hongikDarkTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "keyword.control", foreground: "CBA6F7", fontStyle: "bold" },
    { token: "keyword.type", foreground: "89DCEB" },
    { token: "keyword.declaration", foreground: "F38BA8", fontStyle: "bold" },
    { token: "keyword.self", foreground: "F5C2E7", fontStyle: "italic" },
    { token: "constant.language", foreground: "FAB387" },
    { token: "support.function", foreground: "89B4FA" },
    { token: "string.interpolation", foreground: "A6E3A1" },
    { token: "identifier", foreground: "9CDCFE" },
    { token: "string", foreground: "CE9178" },
    { token: "string.escape", foreground: "D7BA7D" },
    { token: "number", foreground: "B5CEA8" },
    { token: "number.float", foreground: "B5CEA8" },
    { token: "comment", foreground: "6A9955", fontStyle: "italic" },
    { token: "operator", foreground: "D4D4D4" },
    { token: "delimiter", foreground: "D4D4D4" },
  ],
  colors: {
    "editor.background": "#1E1E2E",
    "editor.foreground": "#CDD6F4",
    "editor.lineHighlightBackground": "#313244",
    "editorCursor.foreground": "#F5E0DC",
    "editor.selectionBackground": "#45475A",
    "editorLineNumber.foreground": "#6C7086",
    "editorLineNumber.activeForeground": "#CDD6F4",
  },
};

export const hongikLightTheme = {
  base: "vs" as const,
  inherit: true,
  rules: [
    { token: "keyword.control", foreground: "8839EF", fontStyle: "bold" },
    { token: "keyword.type", foreground: "04A5E5" },
    { token: "keyword.declaration", foreground: "D20F39", fontStyle: "bold" },
    { token: "keyword.self", foreground: "EA76CB", fontStyle: "italic" },
    { token: "constant.language", foreground: "FE640B" },
    { token: "support.function", foreground: "1E66F5" },
    { token: "string.interpolation", foreground: "179299" },
    { token: "identifier", foreground: "4C4F69" },
    { token: "string", foreground: "40A02B" },
    { token: "string.escape", foreground: "DF8E1D" },
    { token: "number", foreground: "FE640B" },
    { token: "number.float", foreground: "FE640B" },
    { token: "comment", foreground: "9CA0B0", fontStyle: "italic" },
    { token: "operator", foreground: "04A5E5" },
    { token: "delimiter", foreground: "4C4F69" },
  ],
  colors: {
    "editor.background": "#EFF1F5",
    "editor.foreground": "#4C4F69",
    "editor.lineHighlightBackground": "#E6E9EF",
    "editorCursor.foreground": "#DC8A78",
    "editor.selectionBackground": "#ACB0BE55",
    "editorLineNumber.foreground": "#8C8FA1",
    "editorLineNumber.activeForeground": "#4C4F69",
  },
};
