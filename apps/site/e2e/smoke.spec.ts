import { test, expect } from '@playwright/test';

// 빌드된 정적 사이트(astro preview)에서 플레이그라운드가 뜨고 WASM으로 실행되는지 본다.
// 실행 전 WASM 산출물이 public/에 있어야 한다(WASM_DEST=apps/site/public ./scripts/sync-wasm.sh).

test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => localStorage.setItem('onboarding-completed', 'true'));
});

test.describe('playground smoke', () => {
    test('로드 시 핵심 UI가 렌더링된다', async ({ page }) => {
        await page.goto('/playground/');
        await expect(page.locator('[data-onboarding="run-button"]')).toBeVisible();
        await expect(page.getByText('콘솔', { exact: false }).first()).toBeVisible();
        await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15_000 });
    });

    test('코드를 WASM으로 실행해 콘솔에 출력한다', async ({ page }) => {
        const code = '출력("안녕")';
        await page.goto(`/playground/?code=${encodeURIComponent(code)}`);
        await page.locator('.monaco-editor .view-lines').first().waitFor({ timeout: 15_000 });
        await page.locator('[data-onboarding="run-button"]').click();
        const finished = page.getByText('실행 시간:', { exact: false });
        await expect(finished).toBeVisible({ timeout: 15_000 });
        // 콘솔 출력은 <pre> 안에 찍힌다 (에디터의 '안녕'과 구분).
        await expect(page.locator('pre').filter({ hasText: '안녕' }).first()).toBeVisible();
    });

    test('외부 호스트(CDN)로 요청하지 않는다', async ({ page, baseURL }) => {
        const origin = new URL(baseURL!).origin;
        const external: string[] = [];
        page.on('request', (r) => {
            const url = r.url();
            if (/^https?:/.test(url) && !url.startsWith(origin)) external.push(url);
        });
        await page.goto('/playground/');
        await page.locator('.monaco-editor .view-lines').first().waitFor({ timeout: 15_000 });
        await page.waitForLoadState('networkidle');
        expect(external).toEqual([]);
    });
});
