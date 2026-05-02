import type { Middleware } from "@reduxjs/toolkit";
import {
  STORAGE_KEY,
  THEME_STORAGE_KEY,
  TABS_STORAGE_KEY,
  ACTIVE_TAB_STORAGE_KEY,
  type PlaygroundState,
} from "./playgroundSlice";

const DEBOUNCE_MS = 300;

interface PersistedSlice {
  playground: PlaygroundState;
}

export const persistMiddleware: Middleware = (storeApi) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastTabs: PlaygroundState["tabs"] | null = null;
  let lastActiveTabId: string | null = null;
  let lastTheme: PlaygroundState["theme"] | null = null;

  return (next) => (action) => {
    const result = next(action);
    if (typeof window === "undefined") return result;

    const { tabs, activeTabId, theme } = (
      storeApi.getState() as PersistedSlice
    ).playground;

    const tabsChanged = tabs !== lastTabs;
    const activeChanged = activeTabId !== lastActiveTabId;
    const themeChanged = theme !== lastTheme;

    if (!tabsChanged && !activeChanged && !themeChanged) return result;

    lastTabs = tabs;
    lastActiveTabId = activeTabId;
    lastTheme = theme;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        if (tabsChanged || activeChanged) {
          localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
          localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
          // Legacy single-code key kept in sync for older builds / external readers.
          const active = tabs.find((t: PlaygroundState["tabs"][number]) => t.id === activeTabId);
          if (active) localStorage.setItem(STORAGE_KEY, active.code);
        }
        if (themeChanged) {
          localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
      } catch {
        // Quota exceeded or storage disabled — drop silently.
      }
    }, DEBOUNCE_MS);

    return result;
  };
};
