import { Suspense } from "react";
import { Playground } from "@/components/Playground";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Playground />
    </Suspense>
  );
}
