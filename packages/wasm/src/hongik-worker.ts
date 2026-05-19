/**
 * Hong-ik WASM Web Worker
 *
 * WASM 인터프리터를 Web Worker 내에서 실행하여 메인 스레드 블로킹을 방지합니다.
 * postMessage 프로토콜로 호스트와 통신합니다.
 */

import type { WorkerRequest, WorkerResponse } from './types';

// Worker 글로벌 스코프 타입 선언
declare function importScripts(...urls: string[]): void;
declare const self: DedicatedWorkerGlobalScope;

// Emscripten MODULARIZE 출력 타입
interface HongIkEmscriptenModule {
    HongIkInterpreter: new () => HongIkInterpreterInstance;
}

interface HongIkInterpreterInstance {
    execute(code: string): string;
    executeWithTimeout(code: string, timeoutMs: number): string;
    getTokens(code: string): string;
    reset(): void;
    writeFile(path: string, content: string): void;
    readFile(path: string): string;
    fileExists(path: string): boolean;
    deleteFile(path: string): void;
    delete(): void;
}

// Worker 내부 상태
let interpreter: HongIkInterpreterInstance | null = null;

async function loadWasm(wasmUrl?: string): Promise<HongIkEmscriptenModule> {
    const url = wasmUrl || './hongik-wasm.js';

    importScripts(url);

    const HongIkModule = (self as unknown as Record<string, unknown>)['HongIkModule'] as
        ((opts?: Record<string, unknown>) => Promise<HongIkEmscriptenModule>) | undefined;

    if (!HongIkModule) {
        throw new Error('HongIkModule을 로드할 수 없습니다. WASM 파일 경로를 확인하세요.');
    }

    return await HongIkModule();
}

type RequireInterpreterResult =
    | { ok: true; interp: HongIkInterpreterInstance }
    | { ok: false; response: WorkerResponse };

function requireInterpreter(id: number): RequireInterpreterResult {
    if (!interpreter) {
        return {
            ok: false,
            response: { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다. init을 먼저 호출하세요.' },
        };
    }
    return { ok: true, interp: interpreter };
}

async function handleMessage(msg: WorkerRequest): Promise<WorkerResponse> {
    const { id } = msg;

    try {
        switch (msg.type) {
            case 'init': {
                const module = await loadWasm(msg.wasmUrl);
                interpreter = new module.HongIkInterpreter();
                return { id, type: 'init', success: true };
            }

            case 'execute': {
                const r = requireInterpreter(id);
                if (!r.ok) return r.response;
                const result = msg.timeoutMs !== undefined
                    ? r.interp.executeWithTimeout(msg.code, msg.timeoutMs)
                    : r.interp.execute(msg.code);
                return { id, type: 'execute', result };
            }

            case 'getTokens': {
                const r = requireInterpreter(id);
                if (!r.ok) return r.response;
                return { id, type: 'getTokens', result: r.interp.getTokens(msg.code) };
            }

            case 'reset': {
                const r = requireInterpreter(id);
                if (!r.ok) return r.response;
                r.interp.reset();
                return { id, type: 'reset', success: true };
            }

            case 'writeFile': {
                const r = requireInterpreter(id);
                if (!r.ok) return r.response;
                r.interp.writeFile(msg.path, msg.content);
                return { id, type: 'writeFile', success: true };
            }

            case 'readFile': {
                const r = requireInterpreter(id);
                if (!r.ok) return r.response;
                return { id, type: 'readFile', result: r.interp.readFile(msg.path) };
            }

            case 'fileExists': {
                const r = requireInterpreter(id);
                if (!r.ok) return r.response;
                return { id, type: 'fileExists', result: r.interp.fileExists(msg.path) };
            }

            case 'deleteFile': {
                const r = requireInterpreter(id);
                if (!r.ok) return r.response;
                r.interp.deleteFile(msg.path);
                return { id, type: 'deleteFile', success: true };
            }

            default:
                return { id, type: 'error', message: `알 수 없는 메시지 타입: ${(msg as WorkerRequest).type}` };
        }
    } catch (err) {
        return { id, type: 'error', message: err instanceof Error ? err.message : String(err) };
    }
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
    const response = await handleMessage(e.data);
    self.postMessage(response);
};
