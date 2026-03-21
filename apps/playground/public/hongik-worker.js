/**
 * Hong-ik WASM Web Worker
 * WASM 인터프리터를 Web Worker 내에서 실행하여 메인 스레드 블로킹을 방지합니다.
 */

let interpreter = null;

async function loadWasm(wasmUrl) {
    const url = wasmUrl || './hongik-wasm.js';
    importScripts(url);

    const HongIkModule = self['HongIkModule'];
    if (!HongIkModule) {
        throw new Error('HongIkModule을 로드할 수 없습니다.');
    }

    return await HongIkModule();
}

async function handleMessage(msg) {
    const { id } = msg;

    try {
        switch (msg.type) {
            case 'init': {
                const module = await loadWasm(msg.wasmUrl);
                interpreter = new module.HongIkInterpreter();
                return { id, type: 'init', success: true };
            }

            case 'execute': {
                if (!interpreter) {
                    return { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다.' };
                }
                let result;
                if (msg.timeoutMs !== undefined || msg.maxMemoryBytes !== undefined) {
                    result = interpreter.executeWithLimits(
                        msg.code,
                        msg.timeoutMs ?? 5000,
                        msg.maxMemoryBytes ?? 33554432,
                    );
                } else {
                    result = interpreter.execute(msg.code);
                }
                return { id, type: 'execute', result };
            }

            case 'getTokens': {
                if (!interpreter) {
                    return { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다.' };
                }
                const result = interpreter.getTokens(msg.code);
                return { id, type: 'getTokens', result };
            }

            case 'reset': {
                if (!interpreter) {
                    return { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다.' };
                }
                interpreter.reset();
                return { id, type: 'reset', success: true };
            }

            case 'writeFile': {
                if (!interpreter) {
                    return { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다.' };
                }
                interpreter.writeFile(msg.path, msg.content);
                return { id, type: 'writeFile', success: true };
            }

            case 'readFile': {
                if (!interpreter) {
                    return { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다.' };
                }
                const result = interpreter.readFile(msg.path);
                return { id, type: 'readFile', result };
            }

            case 'fileExists': {
                if (!interpreter) {
                    return { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다.' };
                }
                const result = interpreter.fileExists(msg.path);
                return { id, type: 'fileExists', result };
            }

            case 'deleteFile': {
                if (!interpreter) {
                    return { id, type: 'error', message: '인터프리터가 초기화되지 않았습니다.' };
                }
                interpreter.deleteFile(msg.path);
                return { id, type: 'deleteFile', success: true };
            }

            default:
                return { id, type: 'error', message: '알 수 없는 메시지 타입: ' + msg.type };
        }
    } catch (err) {
        return { id, type: 'error', message: err instanceof Error ? err.message : String(err) };
    }
}

self.onmessage = async function(e) {
    const response = await handleMessage(e.data);
    self.postMessage(response);
};
