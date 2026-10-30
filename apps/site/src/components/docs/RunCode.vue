<script setup lang="ts">
import { ref, onMounted } from 'vue'

const wrapper = ref<HTMLElement>()
const playgroundUrl = ref('')

// 플레이그라운드는 같은 사이트의 /playground/에 있다.
const playgroundBase = '/playground'

// Starlight(Expressive Code)는 코드 줄을 <div class="ec-line">로 감싸 <code>의 textContent에 줄바꿈이 없다.
// 복사 버튼의 data-code(줄 구분자 U+007F)를 우선 쓰고, 없으면 줄 div를 이어 붙인다.
function extractCode(root: HTMLElement): string | null {
  const copyBtn = root.querySelector<HTMLElement>('[data-code]')
  if (copyBtn?.dataset.code != null) return copyBtn.dataset.code.replace(/\u007f/g, '\n')
  const codeEl = root.querySelector('pre code')
  if (!codeEl) return null
  const lines = codeEl.querySelectorAll('.ec-line')
  if (lines.length) return Array.from(lines, (l) => l.textContent || '').join('\n')
  return codeEl.textContent || ''
}

onMounted(() => {
  if (!wrapper.value) return
  const code = extractCode(wrapper.value)
  if (code == null) return
  const encoded = encodeURIComponent(code.trim())
  playgroundUrl.value = `${playgroundBase}/?code=${encoded}`
})
</script>

<template>
  <div class="run-code-wrapper not-content" ref="wrapper">
    <slot />
    <div class="run-code-actions" v-if="playgroundUrl">
      <a :href="playgroundUrl" target="_blank" rel="noopener" class="run-code-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        실행해보기
      </a>
    </div>
  </div>
</template>

<style scoped>
.run-code-wrapper {
  position: relative;
  margin: 16px 0;
}

.run-code-wrapper :deep(.expressive-code) {
  margin: 0;
}

.run-code-wrapper :deep(.expressive-code .frame),
.run-code-wrapper :deep(.expressive-code pre) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.run-code-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background-color: var(--hik-code-bg);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top: 1px solid var(--sl-color-hairline);
}

.run-code-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sl-color-accent);
  background-color: var(--sl-color-accent-low);
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.run-code-button:hover {
  background-color: var(--sl-color-accent);
  color: white;
}
</style>
