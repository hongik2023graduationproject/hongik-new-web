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
import { executeViaAPI } from "@/lib/api";
import {
  loadInterpreter,
  isWasmRuntimeAvailable,
  type HongIkInterpreter,
} from "@hongik/wasm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Sun, Moon, Square } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

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

  const handleExampleSelect = (exampleId: string) => {
    const example = examples.find((e) => e.id === exampleId);
    if (example) {
      dispatch(setCode(example.code));
      dispatch(clearOutput());
    }
  };

  const handleRun = useCallback(async () => {
    if (isRunning) return;

    dispatch(setIsRunning(true));
    dispatch(clearOutput());

    try {
      // Try WASM first (if not already known to be unavailable)
      if (!wasmFailedRef.current && isWasmRuntimeAvailable()) {
        try {
          if (!interpreterRef.current) {
            interpreterRef.current = await loadInterpreter();
          }
          const result = await interpreterRef.current.execute(code);
          if (result.stdout) dispatch(appendOutput(result.stdout));
          if (result.stderr) {
            dispatch(appendOutput(`[에러] ${result.stderr}`));
            dispatch(setErrorLine(parseErrorLine(result.stderr)));
          }
          dispatch(setExecutionTime(result.executionTime));
          return;
        } catch {
          // WASM failed (e.g. worker file not found) - fall through to API
          wasmFailedRef.current = true;
          interpreterRef.current = null;
        }
      }

      // Fallback to backend API
      const result = await executeViaAPI(code);
      if (result.stdout) dispatch(appendOutput(result.stdout));
      if (result.stderr) {
        dispatch(appendOutput(`[에러] ${result.stderr}`));
        dispatch(setErrorLine(parseErrorLine(result.stderr)));
      }
      dispatch(setExecutionTime(result.executionTime));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dispatch(appendOutput(`[시스템 에러] ${message}`));
      dispatch(appendOutput("[도움말] 백엔드 서버가 실행 중인지 확인하세요."));
    } finally {
      dispatch(setIsRunning(false));
    }
  }, [code, isRunning, dispatch]);

  // Ctrl+Enter keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun]);

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

        <Button
          onClick={handleRun}
          disabled={isRunning}
          size="sm"
          className="gap-1.5"
          title="실행 (Ctrl+Enter)"
        >
          {isRunning ? (
            <>
              <Square className="h-3.5 w-3.5" />
              실행 중...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              실행
            </>
          )}
        </Button>

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
