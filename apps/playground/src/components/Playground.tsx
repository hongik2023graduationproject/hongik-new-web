"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initFromStorage, setCode, STORAGE_KEY } from "@/store/playgroundSlice";
import { fetchSharedCode } from "@/lib/api";
import { Header } from "./Header";
import { EditorPanel } from "./EditorPanel";
import { ConsolePanel } from "./ConsolePanel";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const PANEL_RATIO_KEY = "playground-panel-ratio";
const DEFAULT_RATIO = 50;
const MIN_RATIO = 20;
const MAX_RATIO = 80;

function loadRatio(): number {
  if (typeof window === "undefined") return DEFAULT_RATIO;
  const stored = localStorage.getItem(PANEL_RATIO_KEY);
  if (stored) {
    const val = parseFloat(stored);
    if (!isNaN(val) && val >= MIN_RATIO && val <= MAX_RATIO) return val;
  }
  return DEFAULT_RATIO;
}

export function Playground() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.playground.theme);
  const tabs = useAppSelector((state) => state.playground.tabs);
  const activeTabId = useAppSelector((state) => state.playground.activeTabId);
  const searchParams = useSearchParams();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced localStorage save for tabs (500ms)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem("hongik-playground-tabs", JSON.stringify(tabs));
      localStorage.setItem("hongik-playground-active-tab", activeTabId);
      const active = tabs.find((t) => t.id === activeTabId);
      if (active) localStorage.setItem(STORAGE_KEY, active.code);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [tabs, activeTabId]);

  // Panel resize state
  const [leftRatio, setLeftRatio] = useState(DEFAULT_RATIO);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const rafId = useRef<number>(0);

  // Load saved ratio on mount
  useEffect(() => {
    setLeftRatio(loadRatio());
  }, []);

  const cleanupDragRef = useRef<(() => void) | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rect = containerRef.current!.getBoundingClientRect();
        const ratio = ((ev.clientX - rect.left) / rect.width) * 100;
        const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
        setLeftRatio(clamped);
      });
    };

    const cleanup = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      cancelAnimationFrame(rafId.current);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", cleanup);
      window.removeEventListener("blur", cleanup);
      cleanupDragRef.current = null;
      // Save ratio to localStorage
      setLeftRatio((current) => {
        localStorage.setItem(PANEL_RATIO_KEY, String(current));
        return current;
      });
    };

    cleanupDragRef.current = cleanup;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", cleanup);
    window.addEventListener("blur", cleanup);
  }, []);

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      cleanupDragRef.current?.();
    };
  }, []);

  const handleDoubleClick = useCallback(() => {
    setLeftRatio(DEFAULT_RATIO);
    localStorage.setItem(PANEL_RATIO_KEY, String(DEFAULT_RATIO));
  }, []);

  useEffect(() => {
    dispatch(initFromStorage());

    // URL ?share=TOKEN: fetch shared code from API
    const shareToken = searchParams.get("share");
    if (shareToken) {
      fetchSharedCode(shareToken)
        .then((sharedCode) => dispatch(setCode(sharedCode)))
        .catch(() => {
          // ignore – fall through to default code
        });
      return;
    }

    // URL ?code= parameter takes priority over localStorage
    const codeParam = searchParams.get("code");
    if (codeParam) {
      dispatch(setCode(codeParam));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <OnboardingTutorial />

      {/* Desktop layout */}
      <div ref={containerRef} className="hidden flex-1 overflow-hidden md:flex">
        <div className="overflow-hidden" style={{ width: `${leftRatio}%` }}>
          <EditorPanel />
        </div>
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          className="group relative flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-primary/30"
        >
          <div className="absolute z-10 h-8 w-1 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-primary" />
        </div>
        <div className="flex-1 overflow-hidden">
          <ConsolePanel />
        </div>
      </div>

      {/* Mobile layout with tabs */}
      <div className="flex flex-1 flex-col overflow-hidden md:hidden">
        <Tabs defaultValue="editor" className="flex flex-1 flex-col">
          <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
            <TabsTrigger value="editor">에디터</TabsTrigger>
            <TabsTrigger value="console">콘솔</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 overflow-hidden">
            <EditorPanel />
          </TabsContent>
          <TabsContent value="console" className="flex-1 overflow-hidden">
            <ConsolePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
