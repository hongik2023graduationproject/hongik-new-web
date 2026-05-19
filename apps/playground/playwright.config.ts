import { defineConfig, devices } from '@playwright/test';

// 로컬: `pnpm --filter @hongik/playground exec playwright install --with-deps chromium` 한 번 실행 후 `pnpm e2e`.
// CI: e2e 워크플로(별도 추가 예정)가 동일한 명령 시퀀스로 실행.
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
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined
        : {
              command: 'pnpm dev',
              port: 3000,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
