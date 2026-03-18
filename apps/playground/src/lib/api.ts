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
  timeout?: number
): Promise<{ stdout: string; stderr: string; executionTime: number }> {
  const body: ExecuteRequest = { code };
  if (timeout) body.timeout = timeout;

  const res = await fetch(`${API_BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
