import { describe, expect, it } from 'vitest';
import {
    isWasmRuntimeAvailable,
    isWasmSupported,
    isWorkerSupported,
    loadInterpreter,
} from './index';

describe('@hongik/wasm exports', () => {
    it('environment-detection helpers are callable and return booleans', () => {
        // We don't assert the value (depends on the test environment) — only
        // that they don't throw and return the right type. Catches refactors
        // that accidentally remove or rename the helpers.
        expect(typeof isWasmSupported()).toBe('boolean');
        expect(typeof isWorkerSupported()).toBe('boolean');
        expect(typeof isWasmRuntimeAvailable()).toBe('boolean');
    });

    it('isWasmRuntimeAvailable === isWasmSupported && isWorkerSupported', () => {
        expect(isWasmRuntimeAvailable()).toBe(isWasmSupported() && isWorkerSupported());
    });

    it('loadInterpreter rejects when WASM runtime is unavailable in this env', async () => {
        // In Node (no DOM Worker), loadInterpreter should fast-fail with a
        // descriptive Korean error rather than hang or crash.
        if (isWasmRuntimeAvailable()) return; // skip when actually available
        await expect(loadInterpreter()).rejects.toThrow(/WASM 런타임을 사용할 수 없습니다/);
    });
});
