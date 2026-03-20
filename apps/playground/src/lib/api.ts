const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ExecuteRequest {
  code: string;
  timeout?: number;
}

interface ExecuteResponse {
  status: string;
  output?: string;
  error?: string;
  execution_time_ms: number;
}

/**
 * Execute hong-ik code via the backend API.
 * Used as fallback when WASM runtime is not available.
 */
export async function executeViaAPI(
  code: string,
  timeout?: number,
  signal?: AbortSignal
): Promise<{ stdout: string; stderr: string; executionTime: number }> {
  const body: ExecuteRequest = { code };
  if (timeout) body.timeout = timeout;

  const res = await fetch(`${API_BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "서버 연결 실패" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data: ExecuteResponse = await res.json();

  return {
    stdout: data.output || "",
    stderr: data.error || "",
    executionTime: data.execution_time_ms,
  };
}

/**
 * Share code via the backend API.
 * Returns a share token that can be used to retrieve the code.
 */
export async function shareCode(code: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    throw new Error("공유 링크 생성에 실패했습니다.");
  }

  const data = await res.json();
  return data.token;
}

/**
 * Fetch shared code by token.
 */
export async function fetchSharedCode(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/share/${token}`);

  if (!res.ok) {
    throw new Error("공유된 코드를 불러올 수 없습니다.");
  }

  const data = await res.json();
  return data.code;
}
