"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearOutput } from "@/store/playgroundSlice";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Check } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

export function ConsolePanel() {
  const output = useAppSelector((state) => state.playground.output);
  const isRunning = useAppSelector((state) => state.playground.isRunning);
  const executionTimeMs = useAppSelector((state) => state.playground.executionTimeMs);
  const dispatch = useAppDispatch();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom when new output appears
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: ignore
    }
  }, [output]);

  const lines = output ? output.split("\n") : [];
  // Remove trailing empty line from split
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">콘솔</span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              실행 중...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {output && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              title="출력 복사"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => dispatch(clearOutput())}
            title="콘솔 지우기"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto bg-muted/30 p-4">
        <pre className="font-mono text-sm whitespace-pre-wrap">
          {lines.length > 0 ? (
            lines.map((line, i) => (
              <span
                key={i}
                className={
                  line.startsWith("[에러]") || line.startsWith("[시스템 에러]")
                    ? "text-red-400"
                    : line.startsWith("[도움말]")
                      ? "text-yellow-400"
                      : ""
                }
              >
                <span className="inline-block w-8 text-right mr-3 text-muted-foreground/50 select-none text-xs leading-5">
                  {i + 1}
                </span>
                {line}
                {"\n"}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">
              실행 버튼을 눌러 결과를 확인하세요. (Ctrl+Enter)
            </span>
          )}
        </pre>
        {executionTimeMs !== null && output && (
          <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
            실행 시간: {executionTimeMs < 1
              ? `${executionTimeMs.toFixed(2)}ms`
              : `${Math.round(executionTimeMs)}ms`}
          </div>
        )}
      </div>
    </div>
  );
}
