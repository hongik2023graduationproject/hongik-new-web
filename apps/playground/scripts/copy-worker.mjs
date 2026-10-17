// Copies the Web Worker built from packages/wasm/src/hongik-worker.ts into public/,
// so the playground serves /hongik-worker.js from the single TypeScript source.
// Usage: node scripts/copy-worker.mjs [dest]   (default: public/hongik-worker.js)
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../../packages/wasm/dist/hongik-worker.js');
const dest = process.argv[2] ? resolve(process.argv[2]) : resolve(here, '../public/hongik-worker.js');

if (!existsSync(src)) {
    console.error(`[copy-worker] ${src} not found. Build @hongik/wasm first (pnpm turbo run build --filter=@hongik/wasm).`);
    process.exit(1);
}
copyFileSync(src, dest);
console.log(`[copy-worker] ${src} -> ${dest}`);
