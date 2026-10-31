import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      // Vitest 4+ dropped `coverage.all`; list sources explicitly so untested files still count.
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
