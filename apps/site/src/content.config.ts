import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Starlight UI 문자열 보강 — Pagefind 검색 UI는 한국어 번역이 없어 src/content/i18n/ko.json에서 채운다.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
