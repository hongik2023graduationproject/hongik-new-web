import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { afterAll, describe, expect, it } from 'vitest';

// The playground serves /hongik-worker.js. It must be the worker built from
// src/hongik-worker.ts, not a hand-kept copy: a copy committed to public/ stopped
// being updated in March and still called executeWithLimits, which the WASM
// bindings removed in May.
const here = fileURLToPath(new URL('.', import.meta.url));
const repo = resolve(here, '../../..');
const builtWorker = join(repo, 'packages/wasm/dist/hongik-worker.js');
const servedWorker = join(repo, 'apps/playground/public/hongik-worker.js');
const copyScript = join(repo, 'apps/playground/scripts/copy-worker.mjs');

describe('worker served by the playground', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'hongik-worker-'));
    afterAll(() => rmSync(tmp, { recursive: true, force: true }));

    it('copy script writes a byte-identical copy of the built worker', () => {
        const dest = join(tmp, 'hongik-worker.js');
        execFileSync(process.execPath, [copyScript, dest]);
        expect(readFileSync(dest)).toEqual(readFileSync(builtWorker));
    });

    it('built worker is a classic script', () => {
        // index.ts starts it with `new Worker(url)` (classic) and it calls importScripts,
        // which module workers forbid. A trailing `export {}` from tsc is a syntax error
        // there: the worker dies silently and init never answers.
        expect(() => new Script(readFileSync(builtWorker, 'utf8'))).not.toThrow();
    });

    it('a worker present in public/ is the built one', () => {
        // Missing is fine on a fresh checkout: prebuild/predev create it.
        if (!existsSync(servedWorker)) return;
        expect(readFileSync(servedWorker)).toEqual(readFileSync(builtWorker));
    });

    it('playground build and dev run the copy script first', () => {
        // Called explicitly rather than as prebuild/predev: pre/post hooks depend on the
        // package manager and its settings.
        const pkg = JSON.parse(readFileSync(join(repo, 'apps/playground/package.json'), 'utf8'));
        expect(pkg.scripts.build).toMatch(/^node scripts\/copy-worker\.mjs && /);
        expect(pkg.scripts.dev).toMatch(/^node scripts\/copy-worker\.mjs && /);
    });
});
