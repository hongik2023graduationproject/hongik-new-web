// /playground/ 페이지의 React 섬 진입점 (client:only). Tailwind(preflight 포함)는 여기서만 가져와
// Starlight 문서·소개 페이지에는 섞이지 않는다.
import "./globals.css";
import { ReduxProvider } from "./store/Provider";
import { ErrorBoundary } from "./ErrorBoundary";
import { Playground } from "./Playground";

export default function PlaygroundApp() {
  return (
    <ReduxProvider>
      <ErrorBoundary>
        <Playground />
      </ErrorBoundary>
    </ReduxProvider>
  );
}
