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
    // 문서(/docs/) — 옛 hongik-docs(VitePress)의 사이드바·메타를 옮긴 것.
    starlight({
      title: 'hong-ik',
      description: '한국어로 작성하는 직관적인 프로그래밍 언어. 한글 문법, 이중 실행 엔진, OOP를 지원합니다.',
      logo: { src: './src/assets/logo.svg' },
      favicon: '/logo.svg',
      locales: { root: { label: '한국어', lang: 'ko' } },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/hongik2023graduationproject/hong-ik' }],
      // Pretendard는 npm 패키지에서 자체 호스팅한다(가변 폰트, 글자 묶음별로 필요할 때만 받음).
      customCss: ['pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css', './src/styles/docs.css'],
      components: { Footer: './src/components/docs/Footer.astro' },
      head: [
        { tag: 'meta', attrs: { name: 'theme-color', content: '#2563eb' } },
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://hongik.tolelom.xyz/og-image.svg' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://hongik.tolelom.xyz/og-image.svg' } },
      ],
      // 옛 VitePress 사이드바(섹션별 4개)를 하나로 합쳤다. 그룹·라벨·순서는 그대로.
      sidebar: [
        { label: '플레이그라운드', link: '/playground/' },
        {
          label: '시작하기',
          items: [
            { label: '소개', slug: 'docs/getting-started/introduction' },
            { label: '설치 & 빌드', slug: 'docs/getting-started/installation' },
            { label: '첫 프로그램', slug: 'docs/getting-started/first-program' },
            { label: 'REPL 모드', slug: 'docs/getting-started/repl' },
            { label: '자주 발생하는 오류', slug: 'docs/getting-started/troubleshooting' },
          ],
        },
        {
          label: '언어 레퍼런스',
          items: [
            {
              label: '기본 타입',
              items: [
                { label: '타입 시스템 개요', slug: 'docs/language-reference/types' },
                { label: '정수 (Integer)', slug: 'docs/language-reference/integer' },
                { label: '실수 (Float)', slug: 'docs/language-reference/float' },
                { label: '문자 (String)', slug: 'docs/language-reference/string' },
                { label: '논리 (Boolean)', slug: 'docs/language-reference/boolean' },
              ],
            },
            {
              label: '제어 흐름',
              items: [
                { label: '조건문 (if/else)', slug: 'docs/language-reference/if-else' },
                { label: 'while 반복문', slug: 'docs/language-reference/while' },
                { label: 'for-range 반복문', slug: 'docs/language-reference/for-range' },
                { label: 'foreach 반복문', slug: 'docs/language-reference/foreach' },
                { label: '비교문 (match)', slug: 'docs/language-reference/match' },
              ],
            },
            {
              label: '함수',
              items: [
                { label: '함수 선언 & 호출', slug: 'docs/language-reference/functions' },
                { label: '매개변수 & 반환값', slug: 'docs/language-reference/parameters' },
                { label: '고차 함수', slug: 'docs/language-reference/higher-order-functions' },
              ],
            },
            {
              label: '객체 지향',
              items: [
                { label: '클래스 정의', slug: 'docs/language-reference/classes' },
                { label: '상속 (Inheritance)', slug: 'docs/language-reference/inheritance' },
                { label: '생성자', slug: 'docs/language-reference/constructor' },
              ],
            },
            {
              label: '컬렉션',
              items: [
                { label: '배열 (Array)', slug: 'docs/language-reference/array' },
                { label: '사전 (Dictionary)', slug: 'docs/language-reference/dictionary' },
                { label: '튜플 (Tuple)', slug: 'docs/language-reference/tuple' },
              ],
            },
            {
              label: '고급',
              items: [
                { label: '예외 처리', slug: 'docs/language-reference/exception-handling' },
                { label: '모듈 & 가져오기', slug: 'docs/language-reference/modules' },
                { label: '바이트코드 VM', slug: 'docs/language-reference/vm' },
              ],
            },
            {
              label: '참조',
              items: [
                { label: '연산자 우선순위', slug: 'docs/language-reference/operators' },
                { label: '스코프와 변수 가시성', slug: 'docs/language-reference/scope' },
              ],
            },
          ],
        },
        {
          label: '내장 함수',
          items: [
            { label: 'I/O 함수', slug: 'docs/builtin-functions/io' },
            { label: '타입 변환', slug: 'docs/builtin-functions/type-conversion' },
            { label: '배열 함수', slug: 'docs/builtin-functions/array' },
            { label: '문자열 함수', slug: 'docs/builtin-functions/string' },
            { label: '수학 함수', slug: 'docs/builtin-functions/math' },
            { label: '고차 함수', slug: 'docs/builtin-functions/higher-order' },
            { label: 'JSON 함수', slug: 'docs/builtin-functions/json' },
            { label: '파일 I/O', slug: 'docs/builtin-functions/file-io' },
          ],
        },
        {
          label: '튜토리얼',
          items: [
            {
              label: '기초',
              items: [
                { label: '변수와 타입', slug: 'docs/tutorials/basics-variables' },
                { label: '연산자', slug: 'docs/tutorials/basics-operators' },
                { label: '조건문', slug: 'docs/tutorials/basics-conditionals' },
              ],
            },
            {
              label: '중급',
              items: [
                { label: '함수 작성하기', slug: 'docs/tutorials/intermediate-functions' },
                { label: '배열과 반복문', slug: 'docs/tutorials/intermediate-arrays' },
                { label: '고차 함수', slug: 'docs/tutorials/intermediate-higher-order' },
              ],
            },
            {
              label: '고급',
              items: [
                { label: '클래스와 상속', slug: 'docs/tutorials/advanced-oop' },
                { label: '예외 처리', slug: 'docs/tutorials/advanced-exceptions' },
                { label: '프로젝트 예제', slug: 'docs/tutorials/advanced-projects' },
              ],
            },
          ],
        },
      ],
    }),
    react(),
    vue(),
  ],
});
