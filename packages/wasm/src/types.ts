/**
 * Worker ↔ 호스트 간 postMessage 프로토콜 타입
 */

export type WorkerRequest =
    | { id: number; type: 'init'; wasmUrl?: string }
    | { id: number; type: 'execute'; code: string; timeoutMs?: number }
    | { id: number; type: 'getTokens'; code: string }
    | { id: number; type: 'reset' }
    | { id: number; type: 'writeFile'; path: string; content: string }
    | { id: number; type: 'readFile'; path: string }
    | { id: number; type: 'fileExists'; path: string }
    | { id: number; type: 'deleteFile'; path: string };

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
