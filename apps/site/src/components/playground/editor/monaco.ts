// Monaco를 CDN 없이 번들에서 직접 쓴다 (Next 시절 monaco-editor-webpack-plugin 설정의 Vite 판).
// - 편집기 코어 API + 필요한 기능만 가져온다: 내장 언어(languages)는 하나도 넣지 않고, 홍익 언어는
//   hongik-language.ts의 Monarch 토크나이저로 등록한다.
// - 워커는 편집기 워커 하나뿐이다. Vite의 `?worker`가 같은 출처의 해시 붙은 파일로 내보낸다.
// - @monaco-editor/react의 loader가 jsDelivr에서 받아오지 않도록 loader.config({ monaco })로 이 인스턴스를 넘긴다.
import * as monaco from "monaco-editor/editor/editor.api.js";
import "monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/editor/contrib/clipboard/browser/clipboard.js";
import "monaco-editor/editor/contrib/find/browser/findController.js";
import "monaco-editor/editor/contrib/folding/browser/folding.js";
import "monaco-editor/editor/contrib/hover/browser/hoverContribution.js";
import "monaco-editor/editor/contrib/indentation/browser/indentation.js";
import "monaco-editor/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/editor/contrib/suggest/browser/suggestInlineCompletions.js";
import "monaco-editor/editor/contrib/wordHighlighter/browser/wordHighlighter.js";
import "monaco-editor/editor/contrib/wordOperations/browser/wordOperations.js";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import { loader } from "@monaco-editor/react";

self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });

export { monaco };
