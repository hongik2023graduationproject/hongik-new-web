// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import vue from '@astrojs/vue';

// 정적 사이트 하나: / 소개, /playground/ 플레이그라운드(React 섬), /docs/ 문서(Starlight).
// 결과물 dist/는 hongik-web 이미지(nginx)에 그대로 담긴다.
export default defineConfig({
  site: 'https://hongik.tolelom.xyz',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'hong-ik',
      description: '한글 프로그래밍 언어 — 한국어로 코딩하세요',
      locales: { root: { label: '한국어', lang: 'ko' } },
      sidebar: [{ label: '문서', items: [{ autogenerate: { directory: 'docs' } }] }],
    }),
    react(),
    vue(),
  ],
});
