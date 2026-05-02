import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";
export type ExecutionMode = "wasm" | "api" | null;

export const STORAGE_KEY = "hongik-playground-code";
export const THEME_STORAGE_KEY = "hongik-playground-theme";
export const TABS_STORAGE_KEY = "hongik-playground-tabs";
export const ACTIVE_TAB_STORAGE_KEY = "hongik-playground-active-tab";

const DEFAULT_CODE = `// 홍익 플레이그라운드에 오신 것을 환영합니다!
// 예제를 선택하거나 직접 코드를 작성해보세요.

함수 인사(문자 이름) -> 문자:
    리턴 "안녕하세요, " + 이름 + "님!"

출력(인사("세계"))
`;

export interface Tab {
  id: string;
  name: string;
  code: string;
}

function createDefaultTab(): Tab {
  return { id: nanoid(), name: "메인", code: DEFAULT_CODE };
}

export interface RehydrateState {
  tabs: Tab[];
  activeTabId: string;
  theme: Theme;
}

/**
 * Read persisted state from localStorage. Side-effecting; call from a client
 * effect (e.g. in <Provider />) and dispatch the result via initFromStorage.
 */
export function loadPersistedState(): RehydrateState {
  if (typeof window === "undefined") {
    const fallbackTab = createDefaultTab();
    return { tabs: [fallbackTab], activeTabId: fallbackTab.id, theme: "dark" };
  }

  let tabs: Tab[] | null = null;
  try {
    const stored = localStorage.getItem(TABS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Tab[];
      if (Array.isArray(parsed) && parsed.length > 0) tabs = parsed;
    }
  } catch {
    // Corrupted JSON — fall through to default.
  }
  if (!tabs) {
    const oldCode = localStorage.getItem(STORAGE_KEY);
    const tab = createDefaultTab();
    if (oldCode) tab.code = oldCode;
    tabs = [tab];
  }

  const savedActive = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  const activeTabId =
    savedActive && tabs.some((t) => t.id === savedActive)
      ? savedActive
      : tabs[0]!.id;

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme: Theme = savedTheme === "light" ? "light" : "dark";

  return { tabs, activeTabId, theme };
}

export interface OutputLine {
  text: string;
  /** Wall-clock timestamp (ms epoch) captured when the line was appended. */
  ts: number;
}

export interface PlaygroundState {
  tabs: Tab[];
  activeTabId: string;
  /** Current active tab's code — kept in sync as a convenience alias */
  code: string;
  outputLines: OutputLine[];
  /** Total characters across `outputLines`, used to enforce the truncation cap cheaply. */
  outputCharCount: number;
  isRunning: boolean;
  theme: Theme;
  executionTimeMs: number | null;
  errorLine: number | null;
  executionMode: ExecutionMode;
}

const MAX_OUTPUT_LENGTH = 100_000;
const TRUNCATION_NOTICE = "[출력이 100,000자를 초과하여 잘렸습니다]";

const defaultTab = createDefaultTab();

const initialState: PlaygroundState = {
  tabs: [defaultTab],
  activeTabId: defaultTab.id,
  code: DEFAULT_CODE,
  outputLines: [],
  outputCharCount: 0,
  isRunning: false,
  theme: "dark",
  executionTimeMs: null,
  errorLine: null,
  executionMode: null,
};

function syncCode(state: PlaygroundState) {
  const active = state.tabs.find((t) => t.id === state.activeTabId);
  if (active) state.code = active.code;
}

const playgroundSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {
    initFromStorage(state, action: PayloadAction<RehydrateState>) {
      state.tabs = action.payload.tabs;
      state.activeTabId = action.payload.activeTabId;
      state.theme = action.payload.theme;
      syncCode(state);
    },
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
      const tab = state.tabs.find((t) => t.id === state.activeTabId);
      if (tab) tab.code = action.payload;
    },
    appendOutput(state, action: PayloadAction<string>) {
      if (state.outputCharCount >= MAX_OUTPUT_LENGTH) return;
      const ts = Date.now();
      const lines = action.payload.split("\n");
      // Drop a trailing empty produced by a payload ending in '\n'; preserve genuine blank lines mid-payload.
      if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

      for (const text of lines) {
        if (state.outputCharCount >= MAX_OUTPUT_LENGTH) {
          state.outputLines.push({ text: TRUNCATION_NOTICE, ts });
          state.outputCharCount += TRUNCATION_NOTICE.length;
          return;
        }
        state.outputLines.push({ text, ts });
        state.outputCharCount += text.length + 1; // +1 for the implicit newline
      }
    },
    clearOutput(state) {
      state.outputLines = [];
      state.outputCharCount = 0;
      state.executionTimeMs = null;
      state.errorLine = null;
      state.executionMode = null;
    },
    setExecutionMode(state, action: PayloadAction<ExecutionMode>) {
      state.executionMode = action.payload;
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
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    // --- Tab actions ---
    addTab(state) {
      const newTab: Tab = {
        id: nanoid(),
        name: `탭 ${state.tabs.length + 1}`,
        code: "",
      };
      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
      syncCode(state);
    },
    removeTab(state, action: PayloadAction<string>) {
      if (state.tabs.length <= 1) return; // keep at least 1
      const idx = state.tabs.findIndex((t) => t.id === action.payload);
      if (idx === -1) return;
      state.tabs.splice(idx, 1);
      if (state.activeTabId === action.payload) {
        // Guarded by the `length <= 1` early return above: at least one tab remains.
        const next = state.tabs[Math.min(idx, state.tabs.length - 1)]!;
        state.activeTabId = next.id;
      }
      syncCode(state);
    },
    switchTab(state, action: PayloadAction<string>) {
      if (state.tabs.some((t) => t.id === action.payload)) {
        state.activeTabId = action.payload;
        syncCode(state);
      }
    },
    renameTab(state, action: PayloadAction<{ id: string; name: string }>) {
      const tab = state.tabs.find((t) => t.id === action.payload.id);
      if (tab) {
        tab.name = action.payload.name || tab.name;
      }
    },
    updateTabCode(
      state,
      action: PayloadAction<{ id: string; code: string }>
    ) {
      const tab = state.tabs.find((t) => t.id === action.payload.id);
      if (tab) {
        tab.code = action.payload.code;
        if (tab.id === state.activeTabId) state.code = tab.code;
      }
    },
  },
});

export const {
  initFromStorage,
  setCode,
  appendOutput,
  clearOutput,
  setIsRunning,
  setExecutionTime,
  setErrorLine,
  toggleTheme,
  setTheme,
  setExecutionMode,
  addTab,
  removeTab,
  switchTab,
  renameTab,
  updateTabCode,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;
