<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

// 이전 버전은 백엔드 `/api/execute`에 POST 했지만, 현재는 브라우저에서 WASM 인터프리터를 직접 실행한다.
// 백엔드를 거치지 않으므로 (1) 서버 부담 제로, (2) 사용자 코드가 서버에 도달하지 않아 샌드박싱 격차 해소.
// /hongik-wasm.js + /hongik-wasm.wasm은 사이트 public/에 배치된다(hong-ik release 산출물, 커밋하지 않음).

const wrapper = ref<HTMLElement>()
const originalCode = ref('')
const editableCode = ref('')
const output = ref('')
const isRunning = ref(false)
const isEditing = ref(false)
const hasError = ref(false)
const textareaEl = ref<HTMLTextAreaElement>()

// 페이지 내 모든 InlinePlayground가 단일 인터프리터 인스턴스를 공유 (메모리 절약).
// JS는 단일 스레드라 동시 실행 충돌은 발생하지 않고, 각 실행 전 reset()으로 상태 초기화.
let interpreterPromise: Promise<HongIkInterpreterInstance> | null = null
const WASM_TIMEOUT_MS = 5000

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

interface HongIkInterpreterInstance {
  execute(code: string): string
  executeWithTimeout(code: string, timeoutMs: number): string
  reset(): void
  delete(): void
}

interface HongIkEmscriptenModule {
  HongIkInterpreter: new () => HongIkInterpreterInstance
}

declare global {
  interface Window {
    HongIkModule?: (opts?: Record<string, unknown>) => Promise<HongIkEmscriptenModule>
  }
}

function loadInterpreter(): Promise<HongIkInterpreterInstance> {
  if (interpreterPromise) return interpreterPromise

  interpreterPromise = (async () => {
    if (typeof window === 'undefined') {
      // SSR 단계 — runCode가 호출되지 않으므로 도달하지 않아야 하지만 방어적으로.
      throw new Error('WASM은 브라우저에서만 사용 가능합니다')
    }

    if (!window.HongIkModule) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = '/hongik-wasm.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('WASM 글루코드를 불러올 수 없습니다'))
        document.head.appendChild(script)
      })
    }

    if (!window.HongIkModule) {
      throw new Error('HongIkModule이 전역에 등록되지 않았습니다')
    }

    const moduleInstance = await window.HongIkModule({
      // emcc의 MODULARIZE 출력은 .wasm 위치를 locateFile로 찾는다.
      // 사이트 base path가 / 가 아니면 그에 맞춰야 한다 (현재 기본 /).
      locateFile: (path: string) => '/' + path,
    })
    return new moduleInstance.HongIkInterpreter()
  })()

  return interpreterPromise
}

onMounted(() => {
  if (!wrapper.value) return
  const code = extractCode(wrapper.value)
  if (code == null) return
  originalCode.value = code.trim()
  editableCode.value = originalCode.value
})

function startEdit() {
  isEditing.value = true
  nextTick(() => {
    if (textareaEl.value) {
      autoResize(textareaEl.value)
      textareaEl.value.focus()
    }
  })
}

function resetCode() {
  editableCode.value = originalCode.value
  isEditing.value = false
  output.value = ''
  hasError.value = false
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  editableCode.value = target.value
  autoResize(target)
}

interface ExecuteResultJson {
  success: boolean
  output?: string
  error?: { message?: string } | string | null
}

async function runCode() {
  isRunning.value = true
  output.value = ''
  hasError.value = false

  try {
    const interp = await loadInterpreter()
    // 이전 실행의 전역 상태(변수, 함수 정의 등)를 비운다. 매 실행을 격리.
    interp.reset()

    const rawResult = interp.executeWithTimeout(editableCode.value, WASM_TIMEOUT_MS)
    let parsed: ExecuteResultJson
    try {
      parsed = JSON.parse(rawResult) as ExecuteResultJson
    } catch {
      output.value = '인터프리터 응답을 파싱할 수 없습니다'
      hasError.value = true
      return
    }

    if (parsed.success) {
      output.value = parsed.output || '(실행 완료 - 출력 없음)'
      hasError.value = false
    } else {
      const errMsg = typeof parsed.error === 'string'
        ? parsed.error
        : parsed.error?.message || '실행 오류'
      output.value = errMsg
      hasError.value = true
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    output.value = `실행 실패: ${msg}`
    hasError.value = true
  } finally {
    isRunning.value = false
  }
}
</script>

<template>
  <div class="inline-playground not-content" ref="wrapper">
    <!-- not-content: Starlight 마크다운 본문 스타일(형제 간 margin, pre 테두리)이 버튼·출력에 붙지 않게 한다 -->
    <div v-show="!isEditing" class="code-display">
      <slot />
    </div>

    <div v-if="isEditing" class="code-editor">
      <textarea
        ref="textareaEl"
        :value="editableCode"
        @input="onInput($event)"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
      />
    </div>

    <div class="playground-actions">
      <div class="actions-left">
        <button
          v-if="!isEditing"
          class="action-btn edit-btn"
          @click="startEdit"
          title="코드 편집"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          편집
        </button>
        <button
          v-if="isEditing"
          class="action-btn reset-btn"
          @click="resetCode"
          title="원래 코드로 복원"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          복원
        </button>
      </div>
      <div class="actions-right">
        <button
          class="action-btn run-btn"
          :class="{ running: isRunning }"
          :disabled="isRunning"
          @click="runCode"
        >
          <svg v-if="!isRunning" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span v-if="isRunning" class="spinner" />
          {{ isRunning ? '실행 중...' : '실행' }}
        </button>
      </div>
    </div>

    <div v-if="output" class="playground-output" :class="{ error: hasError }">
      <div class="output-header">
        <span class="output-label">{{ hasError ? '오류' : '출력' }}</span>
        <button class="output-close" @click="output = ''" title="닫기">&times;</button>
      </div>
      <pre class="output-content">{{ output }}</pre>
    </div>
  </div>
</template>

<style scoped>
.inline-playground {
  position: relative;
  margin: 16px 0;
}

.inline-playground :deep(.expressive-code) {
  margin: 0;
}

.inline-playground :deep(.expressive-code .frame),
.inline-playground :deep(.expressive-code pre) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.code-editor {
  background-color: var(--hik-code-bg);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.code-editor textarea {
  display: block;
  width: 100%;
  min-height: 80px;
  padding: 20px 24px;
  margin: 0;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--sl-color-white);
  font-family: var(--sl-font-mono);
  font-size: 14px;
  line-height: 1.6;
  tab-size: 2;
  white-space: pre;
  overflow-x: auto;
  box-sizing: border-box;
}

.playground-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--hik-code-bg);
  border-top: 1px solid var(--sl-color-hairline);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.inline-playground:has(.playground-output) .playground-actions {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.actions-left,
.actions-right {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  font-family: inherit;
}

.edit-btn {
  color: var(--sl-color-gray-2);
  background-color: transparent;
}
.edit-btn:hover {
  color: var(--sl-color-white);
  background-color: var(--sl-color-gray-5);
}

.reset-btn {
  color: var(--sl-color-gray-2);
  background-color: transparent;
}
.reset-btn:hover {
  color: var(--sl-color-white);
  background-color: var(--sl-color-gray-5);
}

.run-btn {
  color: var(--sl-color-accent);
  background-color: var(--sl-color-accent-low);
}
.run-btn:hover:not(:disabled) {
  background-color: var(--sl-color-accent);
  color: white;
}
.run-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.playground-output {
  background-color: var(--hik-code-bg);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-top: 1px dashed var(--sl-color-hairline);
}

.output-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--sl-color-accent);
}

.playground-output.error .output-label {
  color: var(--sl-color-red, #e53e3e);
}

.output-close {
  background: none;
  border: none;
  color: var(--sl-color-gray-3);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;
}
.output-close:hover {
  color: var(--sl-color-white);
}

.output-content {
  margin: 0;
  padding: 12px 24px 16px;
  font-family: var(--sl-font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--sl-color-white);
  white-space: pre-wrap;
  word-break: break-all;
  background: transparent;
}

.playground-output.error .output-content {
  color: var(--sl-color-red, #e53e3e);
}

@media (max-width: 640px) {
  .code-editor textarea {
    padding: 16px;
    font-size: 13px;
  }

  .playground-actions {
    padding: 6px 8px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 12px;
  }

  .output-content {
    padding: 10px 16px 14px;
    font-size: 12px;
  }
}
</style>
