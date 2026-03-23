"use client";

import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCode } from "@/store/playgroundSlice";
import { TabBar } from "./TabBar";
import {
  HONGIK_LANGUAGE_ID,
  hongikLanguageConfig,
  hongikTokensProvider,
  hongikDarkTheme,
  hongikLightTheme,
} from "@/editor/hongik-language";
import { registerHongikCompletions } from "@/editor/hongik-completions";
import type { OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState, useCallback } from "react";
import type { editor } from "monaco-editor";

const MonacoEditor = dynamic(
  () =>
    Promise.all([
      import("@monaco-editor/react"),
      import("monaco-editor"),
    ]).then(([reactMod, monacoMod]) => {
      // CDN 대신 로컬 monaco-editor 패키지에서 직접 로드
      // (COEP 헤더가 CDN <script> 태그를 차단하는 문제 해결)
      reactMod.loader.config({ monaco: monacoMod });
      return reactMod;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/50">
        <p className="text-muted-foreground">에디터 로딩 중...</p>
      </div>
    ),
  },
);

let completionsRegistered = false;

interface CursorInfo {
  line: number;
  column: number;
}

export function EditorPanel() {
  const dispatch = useAppDispatch();
  const code = useAppSelector((state) => state.playground.code);
  const theme = useAppSelector((state) => state.playground.theme);
  const errorLine = useAppSelector((state) => state.playground.errorLine);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const [cursor, setCursor] = useState<CursorInfo>({ line: 1, column: 1 });

  const totalLines = code.split("\n").length;
  const charCount = code.length;

  const handleCursorChange = useCallback((e: editor.ICursorPositionChangedEvent) => {
    setCursor({ line: e.position.lineNumber, column: e.position.column });
  }, []);

  const handleEditorMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;

    if (!monaco.languages.getLanguages().some((l) => l.id === HONGIK_LANGUAGE_ID)) {
      monaco.languages.register({ id: HONGIK_LANGUAGE_ID });
      monaco.languages.setLanguageConfiguration(
        HONGIK_LANGUAGE_ID,
        hongikLanguageConfig
      );
      monaco.languages.setMonarchTokensProvider(
        HONGIK_LANGUAGE_ID,
        hongikTokensProvider
      );
    }

    // Register completions only once
    if (!completionsRegistered) {
      registerHongikCompletions(monaco, HONGIK_LANGUAGE_ID);
      completionsRegistered = true;
    }

    monaco.editor.defineTheme("hongik-dark", hongikDarkTheme);
    monaco.editor.defineTheme("hongik-light", hongikLightTheme);
    monaco.editor.setTheme(theme === "dark" ? "hongik-dark" : "hongik-light");

    // Listen for cursor position changes
    editorInstance.onDidChangeCursorPosition(handleCursorChange);

    // Set initial cursor info
    const pos = editorInstance.getPosition();
    if (pos) {
      setCursor({ line: pos.lineNumber, column: pos.column });
    }
  };

  // Error line highlighting
  useEffect(() => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    if (decorationsRef.current) {
      decorationsRef.current.clear();
      decorationsRef.current = null;
    }

    if (errorLine !== null && errorLine > 0) {
      decorationsRef.current = editorInstance.createDecorationsCollection([
        {
          range: {
            startLineNumber: errorLine,
            startColumn: 1,
            endLineNumber: errorLine,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: "error-line-highlight",
            glyphMarginClassName: "error-line-glyph",
          },
        },
      ]);
    }
  }, [errorLine]);

  return (
    <div className="flex h-full flex-col" data-onboarding="editor">
      <style jsx global>{`
        .error-line-highlight {
          background-color: rgba(239, 68, 68, 0.15) !important;
          border-left: 3px solid #ef4444 !important;
        }
        .error-line-glyph {
          background-color: #ef4444;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: 4px;
          margin-top: 6px;
        }
      `}</style>
      <TabBar />
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={HONGIK_LANGUAGE_ID}
          theme={theme === "dark" ? "hongik-dark" : "hongik-light"}
          value={code}
          onChange={(value) => dispatch(setCode(value ?? ""))}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'D2Coding', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            glyphMargin: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
        />
      </div>
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>줄 {cursor.line}, 열 {cursor.column}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{totalLines}줄</span>
          <span>{charCount}자</span>
        </div>
      </div>
    </div>
  );
}
