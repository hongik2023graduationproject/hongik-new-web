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
  keywords: [
    // Types
    "정수", "실수", "문자", "불린", "논리", "배열", "사전", "상수",
    // Control flow
    "만약", "라면", "아니면", "아니라면",
    // Loops
    "반복", "동안", "부터", "까지", "각각", "에서", "멈춤", "계속",
    // Functions & Classes
    "함수", "리턴", "클래스", "자기", "부모", "생성", "생성자", "새로운",
    // Error handling
    "시도", "실패", "마침내",
    // Match/Switch
    "비교", "경우", "기본",
    // Module
    "가져오기",
    // Literals & Logical
    "참", "거짓", "없음", "그리고", "또는", "아님",
    // Built-in
    "출력", "입력", "오류",
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
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
      [/\d+/, "number"],

      // Keywords and identifiers
      [/[가-힣a-zA-Z_]\w*/, {
        cases: {
          "@keywords": "keyword",
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
      [/[^\\"]+/, "string"],
      [/\\./, "string.escape"],
      [/"/, "string", "@pop"],
    ],

    string_single: [
      [/[^\\']+/, "string"],
      [/\\./, "string.escape"],
      [/'/, "string", "@pop"],
    ],
  },
};

export const hongikDarkTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
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
    { token: "keyword", foreground: "8839EF", fontStyle: "bold" },
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
