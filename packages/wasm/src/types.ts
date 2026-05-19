/**
 * Worker ↔ 호스트 간 postMessage 프로토콜 타입
 */

// id를 제외한 요청 페이로드. 호출 측은 이걸 만들고 send()가 id를 부여한다.
// 유니온을 분리해 두면 Omit<WorkerRequest,'id'>가 공통 멤버만 남기는 문제를 피하면서
// 각 variant 별 필드(예: 'init' → wasmUrl, 'execute' → code/timeoutMs)가 그대로 유지된다.
export type WorkerRequestPayload =
    | { type: 'init'; wasmUrl?: string }
    | { type: 'execute'; code: string; timeoutMs?: number }
    | { type: 'getTokens'; code: string }
    | { type: 'reset' }
    | { type: 'writeFile'; path: string; content: string }
    | { type: 'readFile'; path: string }
    | { type: 'fileExists'; path: string }
    | { type: 'deleteFile'; path: string };

export type WorkerRequest = WorkerRequestPayload & { id: number };

export type WorkerResponse =
    | { id: number; type: 'init'; success: true }
    | { id: number; type: 'execute'; result: string }
    | { id: number; type: 'getTokens'; result: string }
    | { id: number; type: 'reset'; success: true }
    | { id: number; type: 'writeFile'; success: true }
    | { id: number; type: 'readFile'; result: string }
    | { id: number; type: 'fileExists'; result: boolean }
    | { id: number; type: 'deleteFile'; success: true }
    | { id: number; type: 'error'; message: string };
