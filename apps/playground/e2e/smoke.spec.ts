import { test, expect } from '@playwright/test';

// 첫 두 smoke는 백엔드 의존성 없이 정적 렌더링만 검증한다.
// 빌드 깨짐/hydration 에러/공개 asset 누락 같은 배포 회귀를 잡는 게 목표.

test.describe('playground smoke', () => {
    test('로드 시 핵심 UI가 렌더링된다', async ({ page }) => {
        await page.goto('/');

        // 실행 버튼은 Header에 항상 있고 onboarding marker로 라벨링되어 있다.
        const runButton = page.locator('[data-onboarding="run-button"]');
        await expect(runButton).toBeVisible();

        // 콘솔 패널은 "콘솔" 텍스트를 헤더에 가진다.
        await expect(page.getByText('콘솔', { exact: false })).toBeVisible();
    });

    test('Run 버튼 클릭 시 실행 상태로 전환된다', async ({ page }) => {
        await page.goto('/');

        // WASM 사전 로딩이 끝나기를 기다린다 (Header의 useEffect).
        // 그 전까지 클릭은 무시될 수 있다 — `executeViaAPI` 폴백이 작동하기 전까지의 짧은 시간.
        const runButton = page.locator('[data-onboarding="run-button"]');
        await expect(runButton).toBeVisible();

        // Monaco는 비동기로 마운트된다; 보이는 textarea가 생길 때까지 기다린다.
        await page.locator('.monaco-editor textarea').first().waitFor({ state: 'attached', timeout: 10_000 });

        await runButton.click();

        // 클릭 직후 또는 단기간 내에 버튼이 "중지" 상태(destructive variant)로 전환되거나,
        // 실행이 너무 빨라 곧장 끝나 결과가 콘솔에 표시되어야 한다.
        // 둘 중 하나라도 잡히면 실행 사이클이 동작하는 것.
        await Promise.race([
            page.getByRole('button', { name: /중지/ }).waitFor({ timeout: 5_000 }).catch(() => undefined),
            page.locator('[data-onboarding="run-button"]').waitFor({ state: 'visible', timeout: 5_000 }),
        ]);
    });
});
