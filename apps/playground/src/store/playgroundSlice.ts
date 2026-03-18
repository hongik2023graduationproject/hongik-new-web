import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

const STORAGE_KEY = "hongik-playground-code";
const THEME_STORAGE_KEY = "hongik-playground-theme";

const DEFAULT_CODE = `// 홍익 플레이그라운드에 오신 것을 환영합니다!
// 예제를 선택하거나 직접 코드를 작성해보세요.

함수 인사(이름) {
  출력("안녕하세요, " + 이름 + "님!");
}

인사("세계");
`;

function loadSavedCode(): string {
  if (typeof window === "undefined") return DEFAULT_CODE;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE;
}

function loadSavedTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "light" ? "light" : "dark";
}

interface PlaygroundState {
  code: string;
  output: string;
  isRunning: boolean;
  theme: Theme;
  executionTimeMs: number | null;
  errorLine: number | null;
}

const initialState: PlaygroundState = {
  code: DEFAULT_CODE,
  output: "",
  isRunning: false,
  theme: "dark",
  executionTimeMs: null,
  errorLine: null,
};

const playgroundSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {
    initFromStorage(state) {
      state.code = loadSavedCode();
      state.theme = loadSavedTheme();
    },
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, action.payload);
      }
    },
    setOutput(state, action: PayloadAction<string>) {
      state.output = action.payload;
    },
    appendOutput(state, action: PayloadAction<string>) {
      state.output += action.payload + "\n";
    },
    clearOutput(state) {
      state.output = "";
      state.executionTimeMs = null;
      state.errorLine = null;
    },
    setIsRunning(state, action: PayloadAction<boolean>) {
      state.isRunning = action.payload;
    },
    setExecutionTime(state, action: PayloadAction<number | null>) {
      state.executionTimeMs = action.payload;
    },
    setErrorLine(state, action: PayloadAction<number | null>) {
      state.errorLine = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, state.theme);
      }
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, action.payload);
      }
    },
  },
});

export const {
  initFromStorage,
  setCode,
  setOutput,
  appendOutput,
  clearOutput,
  setIsRunning,
  setExecutionTime,
  setErrorLine,
  toggleTheme,
  setTheme,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;
