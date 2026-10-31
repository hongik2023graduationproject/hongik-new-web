import { useAppSelector, useAppDispatch } from "./store/hooks";
import {
  appendOutput,
  initFromStorage,
  loadPersistedState,
  setCode,
} from "./store/playgroundSlice";
import { readSharedCode } from "./lib/share";
import { Header } from "./Header";
import { EditorPanel } from "./EditorPanel";
import { ConsolePanel } from "./ConsolePanel";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useEffect, useRef, useState, useCallback } from "react";

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
    dispatch(initFromStorage(loadPersistedState()));

    // 공유 링크(#code= 또는 구형 ?code=)의 코드가 localStorage보다 우선한다.
    const loadFromLocation = () => {
      const shared = readSharedCode(window.location.search, window.location.hash);
      switch (shared.kind) {
        case "code":
          dispatch(setCode(shared.code));
          break;
        case "invalid":
          dispatch(appendOutput("[알림] 공유 링크가 손상되어 코드를 불러오지 못했습니다. 링크 전체가 복사됐는지 확인해주세요."));
          break;
        case "legacy-share":
          dispatch(appendOutput("[알림] 서버 공유 링크(?share=)는 더 이상 지원되지 않습니다. 코드를 받은 곳에 새 공유 링크를 요청해주세요."));
          break;
      }
    };
    loadFromLocation();

    // 이미 열린 탭에 #code= 링크를 붙여 넣으면 새로고침 없이 hashchange만 일어난다.
    const onHashChange = () => {
      if (readSharedCode("", window.location.hash).kind !== "none") loadFromLocation();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [dispatch]);

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
        {/* WAI-ARIA pattern for a draggable splitter: focusable separator with orientation. */}
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="에디터와 콘솔 영역 크기 조절"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleDoubleClick();
            }
          }}
          className="group relative flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-primary/30"
        >
          {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
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
