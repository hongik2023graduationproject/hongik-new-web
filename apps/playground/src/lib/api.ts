import { z } from "zod";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 코드 실행(/api/execute)은 백엔드에서 제거됨 — 사용자 코드는 브라우저에서 WASM으로 실행한다.
// 백엔드는 스니펫/공유/auth 등 데이터 도메인에만 책임을 진다.

const ErrorResponseSchema = z.object({
  error: z.string().optional(),
});

const ShareResponseSchema = z.object({
  token: z.string().min(1),
});

const SharedCodeSchema = z.object({
  code: z.string(),
});

class ApiError extends Error {
  public readonly status?: number;
  constructor(message: string, status?: number, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJson<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await res.json();
  } catch (cause) {
    throw new ApiError("응답 본문을 JSON으로 파싱할 수 없습니다", res.status, cause);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    // Surface schema mismatch loudly so a backend contract change is caught
    // in development instead of corrupting downstream UI state silently.
    console.error("API response failed schema validation", {
      url: res.url,
      issues: parsed.error.issues,
    });
    throw new ApiError("서버 응답 형식이 올바르지 않습니다", res.status, parsed.error);
  }
  return parsed.data;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    const parsed = ErrorResponseSchema.safeParse(body);
    if (parsed.success && parsed.data.error) return parsed.data.error;
  } catch {
    // Body wasn't JSON — fall through to fallback.
  }
  return fallback;
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
    const message = await readErrorMessage(res, "공유 링크 생성에 실패했습니다.");
    throw new ApiError(message, res.status);
  }

  const data = await parseJson(res, ShareResponseSchema);
  return data.token;
}

/**
 * Fetch shared code by token.
 */
export async function fetchSharedCode(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/share/${token}`);

  if (!res.ok) {
    const message = await readErrorMessage(res, "공유된 코드를 불러올 수 없습니다.");
    throw new ApiError(message, res.status);
  }

  const data = await parseJson(res, SharedCodeSchema);
  return data.code;
}

export { ApiError };
