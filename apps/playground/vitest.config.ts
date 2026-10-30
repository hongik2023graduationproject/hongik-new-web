import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // e2e/는 Playwright 전용 — 단위 테스트는 src/ 아래 *.test.ts만.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
