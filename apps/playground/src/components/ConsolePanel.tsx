"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearOutput } from "@/store/playgroundSlice";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Copy,
  Check,
  Download,
  Clock,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

type FilterMode = "all" | "output" | "error";

const isErrorLine = (line: string) =>
  line.startsWith("[에러]") || line.startsWith("[시스템 에러]");
const isOutputLine = (line: string) => !isErrorLine(line);

const TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const formatTime = (ts: number) => TIME_FORMATTER.format(ts);

export function ConsolePanel() {
  const outputLines = useAppSelector((state) => state.playground.outputLines);
  const isRunning = useAppSelector((state) => state.playground.isRunning);
  const executionTimeMs = useAppSelector(
    (state) => state.playground.executionTimeMs
  );
  const dispatch = useAppDispatch();

  const hasOutput = outputLines.length > 0;
  const joinedOutput = useMemo(
    () => outputLines.map((l) => l.text).join("\n"),
    [outputLines]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Auto-scroll to bottom when new output appears
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [outputLines]);

  // Focus search input when search is toggled on
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleCopy = useCallback(async () => {
    if (!hasOutput) return;
    try {
      await navigator.clipboard.writeText(joinedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: ignore
    }
  }, [hasOutput, joinedOutput]);

  const handleDownload = useCallback(() => {
    if (!hasOutput) return;
    const blob = new Blob([joinedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hongik-output-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [hasOutput, joinedOutput]);

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (prev) setSearchQuery("");
      return !prev;
    });
  }, []);

  const allLines = useMemo(
    () =>
      outputLines.map((line, originalIndex) => ({
        text: line.text,
        ts: line.ts,
        originalIndex,
      })),
    [outputLines]
  );

  const filteredLines = useMemo(() => {
    let lines = allLines;

    // Apply filter
    if (filterMode === "error") {
      lines = lines.filter((l) => isErrorLine(l.text));
    } else if (filterMode === "output") {
      lines = lines.filter((l) => isOutputLine(l.text));
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      lines = lines.filter((l) => l.text.toLowerCase().includes(query));
    }

    return lines;
  }, [allLines, filterMode, searchQuery]);

  const filterButtons: { mode: FilterMode; label: string }[] = [
    { mode: "all", label: "전체" },
    { mode: "output", label: "출력" },
    { mode: "error", label: "에러" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
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
          {hasOutput && (
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
          {hasOutput && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDownload}
              title="출력 다운로드"
            >
              <Download className="h-3.5 w-3.5" />
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

      {/* Toolbar */}
      {hasOutput && (
        <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-1.5">
          {/* Filter buttons */}
          <div className="flex items-center rounded-md border text-xs">
            {filterButtons.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2 py-0.5 transition-colors first:rounded-l-md last:rounded-r-md ${
                  filterMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Timestamp toggle */}
          <Button
            variant={showTimestamp ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={() => setShowTimestamp((p) => !p)}
            title="타임스탬프 표시"
          >
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">시간</span>
          </Button>

          {/* Search toggle */}
          <Button
            variant={showSearch ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={toggleSearch}
            title="출력 검색"
          >
            <Search className="h-3 w-3" />
            <span className="hidden sm:inline">검색</span>
          </Button>

          {/* Search input */}
          {showSearch && (
            <div className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="h-6 w-32 rounded-md border bg-background px-2 pr-6 text-xs outline-none focus:ring-1 focus:ring-ring sm:w-40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Filter info */}
          {(filterMode !== "all" || searchQuery) && (
            <span className="text-xs text-muted-foreground">
              {filteredLines.length}/{allLines.length}줄
            </span>
          )}
        </div>
      )}

      {/* Output area */}
      <div ref={scrollRef} className="flex-1 overflow-auto bg-muted/30 p-4">
        <pre className="font-mono text-sm whitespace-pre-wrap">
          {filteredLines.length > 0 ? (
            filteredLines.map(({ text, ts, originalIndex }) => (
              <span
                key={originalIndex}
                className={
                  isErrorLine(text)
                    ? "text-red-400"
                    : text.startsWith("[도움말]")
                      ? "text-yellow-400"
                      : ""
                }
              >
                <span className="inline-block w-8 text-right mr-3 text-muted-foreground/70 select-none text-xs leading-5">
                  {originalIndex + 1}
                </span>
                {showTimestamp && (
                  <span className="mr-2 text-muted-foreground/50 select-none text-xs">
                    {formatTime(ts)}
                  </span>
                )}
                {searchQuery ? highlightMatch(text, searchQuery) : text}
                {"\n"}
              </span>
            ))
          ) : allLines.length > 0 ? (
            <span className="text-muted-foreground">
              필터 조건에 맞는 출력이 없습니다.
            </span>
          ) : (
            <span className="text-muted-foreground">
              실행 버튼을 눌러 결과를 확인하세요. (Ctrl+Enter)
            </span>
          )}
        </pre>
        {executionTimeMs !== null && hasOutput && (
          <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
            실행 시간:{" "}
            {executionTimeMs < 1
              ? `${executionTimeMs.toFixed(2)}ms`
              : `${Math.round(executionTimeMs)}ms`}
          </div>
        )}
      </div>
    </div>
  );
}

/** Highlight search matches within a line */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let pos = idx;

  while (pos !== -1) {
    if (pos > cursor) {
      parts.push(text.slice(cursor, pos));
    }
    parts.push(
      <mark
        key={pos}
        className="rounded-sm bg-yellow-300/40 text-inherit"
      >
        {text.slice(pos, pos + query.length)}
      </mark>
    );
    cursor = pos + query.length;
    pos = lower.indexOf(qLower, cursor);
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}
