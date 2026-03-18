/**
 * Hong-ik WASM Runtime Interface
 *
 * Web Worker 기반 WASM 인터프리터 래퍼.
 * 메인 스레드에서 Worker를 통해 비동기로 코드를 실행합니다.
 */

import type { WasmExecutionResult } from '@hongik/core';
import type { WorkerRequest, WorkerResponse } from './types';

// ---- 타입 ----

export interface HongIkInterpreter {
    execute(code: string, options?: ExecuteOptions): Promise<WasmExecutionResult>;
    getTokens(code: string): Promise<TokenInfo[]>;
    reset(): Promise<void>;
    writeFile(path: string, content: string): Promise<void>;
    readFile(path: string): Promise<string>;
    fileExists(path: string): Promise<boolean>;
    deleteFile(path: string): Promise<void>;
    dispose(): void;
}

export interface ExecuteOptions {
    timeoutMs?: number;
    maxMemoryBytes?: number;
}

export interface TokenInfo {
    type: string;
    value: string;
    line: number;
    semanticType: string;
}

interface ExecuteResultJson {
    success: boolean;
    output: string;
    result: string | null;
    error?: {
        type: string;
        typeCode: number;
        message: string;
        location: {
            line: number;
            column: number;
            endLine: number;
            endColumn: number;
        };
        code?: string;
        suggestion?: string;
    };
}

interface TokensResultJson {
    tokens?: TokenInfo[];
    success?: boolean;
    error?: string;
    errorLine?: number;
}

// ---- WASM 지원 감지 ----

/**
 * 현재 브라우저가 WebAssembly를 지원하는지 확인
 */
export function isWasmSupported(): boolean {
    try {
        if (typeof WebAssembly !== 'object') return false;
        // 최소 WASM 모듈 컴파일 테스트 (magic number + version + empty section)
        const bytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
        const module = new WebAssembly.Module(bytes);
        return module instanceof WebAssembly.Module;
    } catch {
        return false;
    }
}

/**
 * Web Worker 지원 여부 확인
 */
export function isWorkerSupported(): boolean {
    return typeof Worker !== 'undefined';
}

/**
 * WASM 런타임 사용 가능 여부 (WASM + Worker 모두 필요)
 */
export function isWasmRuntimeAvailable(): boolean {
    return isWasmSupported() && isWorkerSupported();
}

// ---- Worker 통신 ----

let requestId = 0;

function createPendingRequest<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
} {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

// ---- 메인 API ----

/**
 * WASM 인터프리터를 Web Worker에서 초기화하고 래퍼 객체를 반환합니다.
 *
 * @param workerUrl - Web Worker 스크립트 경로 (기본: '/hongik-worker.js')
 * @param wasmUrl   - WASM JS 글루코드 경로 (기본: '/hongik-wasm.js')
 *
 * @example
 * ```ts
 * const interp = await loadInterpreter();
 * const result = await interp.execute('정수 x = 42\n출력(x)');
 * console.log(result.stdout); // "42"
 * interp.dispose();
 * ```
 */
export async function loadInterpreter(
    workerUrl: string = '/hongik-worker.js',
    wasmUrl?: string,
): Promise<HongIkInterpreter> {
    if (!isWasmRuntimeAvailable()) {
        throw new Error(
            'WASM 런타임을 사용할 수 없습니다. ' +
            (!isWasmSupported() ? 'WebAssembly를 지원하지 않는 브라우저입니다.' : 'Web Worker를 지원하지 않는 환경입니다.'),
        );
    }

    const worker = new Worker(workerUrl);
    const pending = new Map<number, { resolve: (v: unknown) => void; reject: (r: unknown) => void }>();

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { id } = e.data;
        const handler = pending.get(id);
        if (!handler) return;
        pending.delete(id);

        if (e.data.type === 'error') {
            handler.reject(new Error(e.data.message));
        } else {
            handler.resolve(e.data);
        }
    };

    worker.onerror = (e) => {
        // 모든 대기 중인 요청 거부
        for (const [, handler] of pending) {
            handler.reject(new Error(`Worker 오류: ${e.message}`));
        }
        pending.clear();
    };

    function send<T extends WorkerResponse>(req: Omit<WorkerRequest, 'id'>): Promise<T> {
        const id = ++requestId;
        const { promise, resolve, reject } = createPendingRequest<T>();
        pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
        worker.postMessage({ ...req, id } as WorkerRequest);
        return promise;
    }

    // Worker 초기화
    await send<WorkerResponse & { type: 'init' }>({ type: 'init', wasmUrl } as Omit<WorkerRequest, 'id'>);

    return {
        async execute(code: string, options?: ExecuteOptions): Promise<WasmExecutionResult> {
            const startTime = performance.now();

            const resp = await send<WorkerResponse & { type: 'execute'; result: string }>({
                type: 'execute',
                code,
                timeoutMs: options?.timeoutMs,
                maxMemoryBytes: options?.maxMemoryBytes,
            } as Omit<WorkerRequest, 'id'>);

            const executionTime = performance.now() - startTime;
            const parsed: ExecuteResultJson = JSON.parse(resp.result);

            return {
                stdout: parsed.output ?? '',
                stderr: parsed.error ? parsed.error.message : '',
                exitCode: parsed.success ? 0 : 1,
                executionTime,
            };
        },

        async getTokens(code: string): Promise<TokenInfo[]> {
            const resp = await send<WorkerResponse & { type: 'getTokens'; result: string }>({
                type: 'getTokens',
                code,
            } as Omit<WorkerRequest, 'id'>);

            const parsed: TokensResultJson = JSON.parse(resp.result);
            return parsed.tokens ?? [];
        },

        async reset(): Promise<void> {
            await send({ type: 'reset' } as Omit<WorkerRequest, 'id'>);
        },

        async writeFile(path: string, content: string): Promise<void> {
            await send({ type: 'writeFile', path, content } as Omit<WorkerRequest, 'id'>);
        },

        async readFile(path: string): Promise<string> {
            const resp = await send<WorkerResponse & { type: 'readFile'; result: string }>({
                type: 'readFile',
                path,
            } as Omit<WorkerRequest, 'id'>);
            return resp.result;
        },

        async fileExists(path: string): Promise<boolean> {
            const resp = await send<WorkerResponse & { type: 'fileExists'; result: boolean }>({
                type: 'fileExists',
                path,
            } as Omit<WorkerRequest, 'id'>);
            return resp.result;
        },

        async deleteFile(path: string): Promise<void> {
            await send({ type: 'deleteFile', path } as Omit<WorkerRequest, 'id'>);
        },

        dispose(): void {
            worker.terminate();
            for (const [, handler] of pending) {
                handler.reject(new Error('인터프리터가 종료되었습니다.'));
            }
            pending.clear();
        },
    };
}

// Re-export types
export type { WasmExecutionResult } from '@hongik/core';
export type { WorkerRequest, WorkerResponse } from './types';
