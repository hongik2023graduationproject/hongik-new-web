import { defineConfig, devices } from '@playwright/test';

// 로컬: `pnpm build` 후 `pnpm e2e` (astro preview를 띄워 dist/를 검사한다).
// 이미 떠 있는 서버를 쓰려면 PLAYWRIGHT_BASE_URL=http://localhost:4321 pnpm e2e.
const port = 4322;

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    expect: { timeout: 5_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined
        : {
              command: `astro preview --port ${port}`,
              port,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
