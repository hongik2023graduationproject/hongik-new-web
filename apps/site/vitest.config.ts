import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 단위 테스트는 플레이그라운드 src 아래 *.test.ts만 (Playwright e2e/는 제외).
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
