// @ts-check
// Expressive Code(Starlight 코드 블록) 설정 — ```hik 블록 하이라이팅.
// 문법 파일은 hong-ik 저장소 vscode-extension/syntaxes/hongik.tmLanguage.json(a8f61ce)의 사본이다.
// name을 'hik'로 바꾸고 aliases를 더했다. 원본이 바뀌면 함께 갱신한다.
import { defineEcConfig } from '@astrojs/starlight/expressive-code';
import fs from 'node:fs';

const hik = JSON.parse(fs.readFileSync(new URL('./src/components/docs/hik.tmLanguage.json', import.meta.url), 'utf-8'));

export default defineEcConfig({
  shiki: { langs: [hik] },
});
