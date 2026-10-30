// packages/wasm/src/hongik-worker.ts의 빌드 산출물을 public/에 복사해 /hongik-worker.js로 서빙한다.
// (손으로 고친 사본을 두지 않는다 — 원본은 TypeScript 하나뿐.)
// 사용: node scripts/copy-worker.mjs [dest]   (기본: public/hongik-worker.js)
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../../packages/wasm/dist/hongik-worker.js');
const dest = process.argv[2] ? resolve(process.argv[2]) : resolve(here, '../public/hongik-worker.js');

if (!existsSync(src)) {
    console.error(`[copy-worker] ${src} not found. Build @hongik/wasm first (pnpm turbo run build --filter=@hongik/wasm).`);
    process.exit(1);
}
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`[copy-worker] ${src} -> ${dest}`);
