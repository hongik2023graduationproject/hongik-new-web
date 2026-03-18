"use client";

import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCode } from "@/store/playgroundSlice";
import {
  HONGIK_LANGUAGE_ID,
  hongikLanguageConfig,
  hongikTokensProvider,
  hongikDarkTheme,
  hongikLightTheme,
} from "@/editor/hongik-language";
import { registerHongikCompletions } from "@/editor/hongik-completions";
import type { OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import type { editor } from "monaco-editor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/50">
      <p className="text-muted-foreground">에디터 로딩 중...</p>
    </div>
  ),
});

let completionsRegistered = false;

export function EditorPanel() {
  const dispatch = useAppDispatch();
  const code = useAppSelector((state) => state.playground.code);
  const theme = useAppSelector((state) => state.playground.theme);
  const errorLine = useAppSelector((state) => state.playground.errorLine);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

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
    <div className="h-full">
      <style jsx global>{`
        .error-line-highlight {
          background-color: rgba(255, 0, 0, 0.1) !important;
        }
        .error-line-glyph {
          background-color: #e74c3c;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: 4px;
          margin-top: 6px;
        }
      `}</style>
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
          tabSize: 2,
          wordWrap: "on",
          glyphMargin: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        }}
      />
    </div>
  );
}
