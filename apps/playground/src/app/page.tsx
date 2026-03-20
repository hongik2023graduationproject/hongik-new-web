import { Suspense } from "react";
import { Playground } from "@/components/Playground";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Playground />
      </Suspense>
    </ErrorBoundary>
  );
}
