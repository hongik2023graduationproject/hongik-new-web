import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";
export type ExecutionMode = "wasm" | "api" | null;

export const STORAGE_KEY = "hongik-playground-code";
const THEME_STORAGE_KEY = "hongik-playground-theme";
const TABS_STORAGE_KEY = "hongik-playground-tabs";
const ACTIVE_TAB_STORAGE_KEY = "hongik-playground-active-tab";

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

function loadSavedTabs(): Tab[] {
  if (typeof window === "undefined") return [createDefaultTab()];
  try {
    const stored = localStorage.getItem(TABS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Tab[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  // Migrate from old single-code storage
  const oldCode = localStorage.getItem(STORAGE_KEY);
  const tab = createDefaultTab();
  if (oldCode) tab.code = oldCode;
  return [tab];
}

function loadSavedActiveTabId(tabs: Tab[]): string {
  // Caller invariant: `tabs` always has length >= 1 (loadSavedTabs falls back to a default tab).
  const fallback = tabs[0]!.id;
  if (typeof window === "undefined") return fallback;
  const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  if (saved && tabs.some((t) => t.id === saved)) return saved;
  return fallback;
}

function loadSavedTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "light" ? "light" : "dark";
}

function saveTabs(tabs: Tab[], activeTabId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
  localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
  // Keep legacy key in sync for backwards compat
  const active = tabs.find((t) => t.id === activeTabId);
  if (active) localStorage.setItem(STORAGE_KEY, active.code);
}

interface PlaygroundState {
  tabs: Tab[];
  activeTabId: string;
  /** Current active tab's code — kept in sync as a convenience alias */
  code: string;
  output: string;
  isRunning: boolean;
  theme: Theme;
  executionTimeMs: number | null;
  errorLine: number | null;
  executionMode: ExecutionMode;
}

const defaultTab = createDefaultTab();

const initialState: PlaygroundState = {
  tabs: [defaultTab],
  activeTabId: defaultTab.id,
  code: DEFAULT_CODE,
  output: "",
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
    initFromStorage(state) {
      state.tabs = loadSavedTabs();
      state.activeTabId = loadSavedActiveTabId(state.tabs);
      state.theme = loadSavedTheme();
      syncCode(state);
    },
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
      const tab = state.tabs.find((t) => t.id === state.activeTabId);
      if (tab) tab.code = action.payload;
    },
    setOutput(state, action: PayloadAction<string>) {
      state.output = action.payload;
    },
    appendOutput(state, action: PayloadAction<string>) {
      const MAX_OUTPUT_LENGTH = 100_000;
      if (state.output.length >= MAX_OUTPUT_LENGTH) return;
      const next = state.output + action.payload + "\n";
      if (next.length > MAX_OUTPUT_LENGTH) {
        state.output =
          next.slice(0, MAX_OUTPUT_LENGTH) +
          "\n[출력이 100,000자를 초과하여 잘렸습니다]";
      } else {
        state.output = next;
      }
    },
    clearOutput(state) {
      state.output = "";
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
      saveTabs(state.tabs, state.activeTabId);
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
      saveTabs(state.tabs, state.activeTabId);
    },
    switchTab(state, action: PayloadAction<string>) {
      if (state.tabs.some((t) => t.id === action.payload)) {
        state.activeTabId = action.payload;
        syncCode(state);
        saveTabs(state.tabs, state.activeTabId);
      }
    },
    renameTab(state, action: PayloadAction<{ id: string; name: string }>) {
      const tab = state.tabs.find((t) => t.id === action.payload.id);
      if (tab) {
        tab.name = action.payload.name || tab.name;
        saveTabs(state.tabs, state.activeTabId);
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
  setOutput,
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
