"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCode,
  setIsRunning,
  appendOutput,
  clearOutput,
  setExecutionTime,
  setErrorLine,
  toggleTheme,
} from "@/store/playgroundSlice";
import { examples } from "@/data/examples";
import { executeViaAPI, shareCode } from "@/lib/api";
import {
  loadInterpreter,
  isWasmRuntimeAvailable,
  type HongIkInterpreter,
} from "@hongik/wasm";
import { formatCode } from "@hongik/core";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
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
} from "lucide-react";
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

  const interpreterRef = useRef<HongIkInterpreter | null>(null);
  const wasmFailedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [shareToast, setShareToast] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
    if (isRunning) return;

    dispatch(setIsRunning(true));
    dispatch(clearOutput());

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Try WASM first (if not already known to be unavailable)
      if (!wasmFailedRef.current && isWasmRuntimeAvailable()) {
        try {
          if (!interpreterRef.current) {
            interpreterRef.current = await loadInterpreter();
          }
          const result = await interpreterRef.current.execute(code);
          if (controller.signal.aborted) return;
          if (result.stdout) dispatch(appendOutput(result.stdout));
          if (result.stderr) {
            dispatch(appendOutput(`[에러] ${result.stderr}`));
            dispatch(setErrorLine(parseErrorLine(result.stderr)));
          }
          dispatch(setExecutionTime(result.executionTime));
          return;
        } catch {
          if (controller.signal.aborted) return;
          // WASM failed (e.g. worker file not found) - fall through to API
          wasmFailedRef.current = true;
          interpreterRef.current = null;
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
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : String(error);
      dispatch(appendOutput(`[시스템 에러] ${message}`));
      dispatch(appendOutput("[도움말] 백엔드 서버가 실행 중인지 확인하세요."));
    } finally {
      abortControllerRef.current = null;
      dispatch(setIsRunning(false));
    }
  }, [code, isRunning, dispatch]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Enter: run
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
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
  }, [handleRun, handleFormat]);

  // Cleanup interpreter on unmount
  useEffect(() => {
    return () => {
      interpreterRef.current?.dispose();
    };
  }, []);

  return (
    <header className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary">홍익</span>
          <span className="text-muted-foreground ml-1 text-sm font-normal">
            Playground
          </span>
        </h1>

        <Select onValueChange={handleExampleSelect}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="예제 선택..." />
          </SelectTrigger>
          <SelectContent>
            {examples.map((example) => (
              <SelectItem key={example.id} value={example.id}>
                {example.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {executionTimeMs !== null && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
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
            중지
          </Button>
        ) : (
          <Button
            onClick={handleRun}
            size="sm"
            className="gap-1.5"
            title="실행 (Ctrl+Enter)"
          >
            <Play className="h-3.5 w-3.5" />
            실행
          </Button>
        )}

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

        <div className="relative">
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
          </DialogContent>
        </Dialog>

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
