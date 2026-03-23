"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCode,
  setIsRunning,
  appendOutput,
  clearOutput,
  setExecutionTime,
  setErrorLine,
  setExecutionMode,
  toggleTheme,
  STORAGE_KEY,
} from "@/store/playgroundSlice";
import { examples, categories } from "@/data/examples";
import { executeViaAPI, shareCode } from "@/lib/api";
import {
  loadInterpreter,
  isWasmRuntimeAvailable,
  type HongIkInterpreter,
} from "@hongik/wasm";
// Inlined formatter to avoid shared-chunk caching issues with @hongik/core
const DEDENT_KEYWORDS = ['아니면', '실패', '마침내'];
function formatCode(code: string): string {
  const lines = code.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { formatted.push(''); continue; }
    if (DEDENT_KEYWORDS.some((kw) => trimmed === kw || trimmed.startsWith(kw + ' ') || trimmed.startsWith(kw + ':'))) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    formatted.push('    '.repeat(indentLevel) + trimmed);
    if (trimmed.endsWith(':')) { indentLevel++; }
  }
  return formatted.join('\n');
}
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Play,
  Sun,
  Moon,
  Square,
  Share2,
  Code2,
  HelpCircle,
  GraduationCap,
} from "lucide-react";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { useCallback, useEffect, useRef, useState } from "react";

function parseErrorLine(stderr: string): number | null {
  const match =
    stderr.match(/(?:줄|line|Line)\s*(\d+)/i) || stderr.match(/\[(\d+):\d+\]/);
  return match ? parseInt(match[1], 10) : null;
}

export function Header() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.playground.theme);
  const isRunning = useAppSelector((state) => state.playground.isRunning);
  const code = useAppSelector((state) => state.playground.code);
  const executionTimeMs = useAppSelector(
    (state) => state.playground.executionTimeMs
  );
  const executionMode = useAppSelector(
    (state) => state.playground.executionMode
  );

  const interpreterRef = useRef<HongIkInterpreter | null>(null);
  const wasmFailCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const [shareToast, setShareToast] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [onboardingRequested, setOnboardingRequested] = useState(false);

  // WASM 사전 로딩: 컴포넌트 마운트 시 백그라운드에서 인터프리터 미리 로드
  useEffect(() => {
    if (!isWasmRuntimeAvailable()) return;
    let cancelled = false;
    loadInterpreter()
      .then((interp) => {
        if (!cancelled) interpreterRef.current = interp;
      })
      .catch(() => {
        // 사전 로딩 실패는 무시 — 실행 시 재시도
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExampleSelect = (exampleId: string) => {
    const example = examples.find((e) => e.id === exampleId);
    if (example) {
      dispatch(setCode(example.code));
      dispatch(clearOutput());
    }
  };

  const handleStop = useCallback(() => {
    // Abort API fetch if in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Terminate WASM interpreter and recreate later
    if (interpreterRef.current) {
      interpreterRef.current.dispose();
      interpreterRef.current = null;
    }
    dispatch(setIsRunning(false));
    dispatch(appendOutput("[실행이 중단되었습니다]"));
  }, [dispatch]);

  const handleRun = useCallback(async () => {
    if (isRunningRef.current) return;

    dispatch(setIsRunning(true));
    dispatch(clearOutput());

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Try WASM first (allow retry up to 3 failures)
      const wasmAvailable = wasmFailCountRef.current < 3 && isWasmRuntimeAvailable();
      if (wasmAvailable) {
        try {
          if (!interpreterRef.current) {
            interpreterRef.current = await loadInterpreter();
          }
          const result = await interpreterRef.current.execute(code);
          if (controller.signal.aborted) return;
          wasmFailCountRef.current = 0; // 성공 시 실패 카운트 리셋
          if (result.stdout) dispatch(appendOutput(result.stdout));
          if (result.stderr) {
            dispatch(appendOutput(`[에러] ${result.stderr}`));
            dispatch(setErrorLine(parseErrorLine(result.stderr)));
          }
          dispatch(setExecutionTime(result.executionTime));
          dispatch(setExecutionMode("wasm"));
          return;
        } catch {
          if (controller.signal.aborted) return;
          wasmFailCountRef.current++;
          interpreterRef.current = null;
          // Fall through to API
        }
      }

      // Fallback to backend API
      const result = await executeViaAPI(code, undefined, controller.signal);
      if (result.stdout) dispatch(appendOutput(result.stdout));
      if (result.stderr) {
        dispatch(appendOutput(`[에러] ${result.stderr}`));
        dispatch(setErrorLine(parseErrorLine(result.stderr)));
      }
      dispatch(setExecutionTime(result.executionTime));
      dispatch(setExecutionMode("api"));
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : String(error);
      dispatch(appendOutput(`[시스템 에러] ${message}`));
      dispatch(appendOutput("[도움말] 백엔드 서버가 실행 중인지 확인하세요."));
    } finally {
      abortControllerRef.current = null;
      dispatch(setIsRunning(false));
    }
  }, [code, dispatch]);

  const handleShare = useCallback(async () => {
    try {
      const token = await shareCode(code);
      const url = `${window.location.origin}${window.location.pathname}?share=${token}`;
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      // Fallback: copy code URL-encoded
      const url = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(code)}`;
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  }, [code]);

  const handleFormat = useCallback(() => {
    const formatted = formatCode(code);
    dispatch(setCode(formatted));
  }, [code, dispatch]);

  const tabs = useAppSelector((state) => state.playground.tabs);
  const activeTabId = useAppSelector((state) => state.playground.activeTabId);

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, code);
    localStorage.setItem("hongik-playground-tabs", JSON.stringify(tabs));
    localStorage.setItem("hongik-playground-active-tab", activeTabId);
  }, [code, tabs, activeTabId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Enter: run
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
      // Ctrl+S: save to localStorage
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Shift+F: format
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        handleFormat();
      }
      // ?: show help (only when not typing in an input)
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        // Don't capture ? inside the editor (monaco handles its own events)
        const target = e.target as HTMLElement;
        if (target.closest(".monaco-editor")) return;
        e.preventDefault();
        setHelpOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun, handleFormat, handleSave]);

  // Cleanup interpreter on unmount
  useEffect(() => {
    return () => {
      interpreterRef.current?.dispose();
    };
  }, []);

  return (
    <header className="flex items-center justify-between border-b px-2 sm:px-4 py-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary">홍익</span>
          <span className="text-muted-foreground ml-1 text-sm font-normal hidden sm:inline">
            Playground
          </span>
        </h1>

        <Select onValueChange={handleExampleSelect}>
          <SelectTrigger className="w-[140px] sm:w-[180px] h-9" data-onboarding="example-selector">
            <SelectValue placeholder="예제 선택..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => {
              const categoryExamples = examples.filter(
                (e) => e.category === category
              );
              if (categoryExamples.length === 0) return null;
              return (
                <SelectGroup key={category}>
                  <SelectLabel>{category}</SelectLabel>
                  {categoryExamples.map((example) => (
                    <SelectItem key={example.id} value={example.id} title={example.name}>
                      {example.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {executionTimeMs !== null && (
          <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
            {executionMode && (
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                  executionMode === "wasm"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {executionMode}
              </span>
            )}
            {executionTimeMs < 1
              ? `${executionTimeMs.toFixed(2)}ms`
              : `${Math.round(executionTimeMs)}ms`}
          </span>
        )}

        {isRunning ? (
          <Button
            onClick={handleStop}
            variant="destructive"
            size="sm"
            className="gap-1.5"
            title="중지"
          >
            <Square className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">중지</span>
          </Button>
        ) : (
          <Button
            onClick={handleRun}
            size="sm"
            className="gap-1.5"
            title="실행 (Ctrl+Enter)"
            data-onboarding="run-button"
          >
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">실행</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 sm:hidden"
          onClick={handleFormat}
          title="코드 정리 (Ctrl+Shift+F)"
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 hidden sm:inline-flex"
          onClick={handleFormat}
          title="코드 정리 (Ctrl+Shift+F)"
        >
          <Code2 className="h-3.5 w-3.5" />
          정리
        </Button>

        <div className="relative" data-onboarding="share-button">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:hidden"
            onClick={handleShare}
            title="공유 링크 복사"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 hidden sm:inline-flex"
            onClick={handleShare}
            title="공유 링크 복사"
          >
            <Share2 className="h-3.5 w-3.5" />
            공유
          </Button>
          {shareToast && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background shadow z-50">
              복사됨!
            </span>
          )}
        </div>

        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              title="단축키 도움말"
              data-onboarding="help-button"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>키보드 단축키</DialogTitle>
              <DialogDescription>
                홍익 플레이그라운드에서 사용할 수 있는 단축키 목록입니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {[
                { keys: "Ctrl + Enter", desc: "코드 실행" },
                { keys: "Ctrl + S", desc: "코드 로컬 저장" },
                { keys: "Ctrl + /", desc: "주석 토글" },
                { keys: "Ctrl + Shift + F", desc: "코드 정리 (포맷)" },
                { keys: "?", desc: "단축키 도움말 열기/닫기" },
              ].map(({ keys, desc }) => (
                <div key={keys} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{desc}</span>
                  <kbd className="rounded border bg-muted px-2 py-1 text-xs font-mono">
                    {keys}
                  </kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setHelpOpen(false);
                setOnboardingRequested(true);
              }}
              className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <GraduationCap className="h-4 w-4" />
              튜토리얼 다시 보기
            </button>
          </DialogContent>
        </Dialog>

        {onboardingRequested && (
          <OnboardingTutorial
            forceShow
            onClose={() => setOnboardingRequested(false)}
          />
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => dispatch(toggleTheme())}
          title={theme === "dark" ? "라이트 모드" : "다크 모드"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
