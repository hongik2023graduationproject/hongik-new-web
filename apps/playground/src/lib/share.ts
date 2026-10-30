import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

// 공유 링크는 서버 없이 코드를 URL 프래그먼트에 압축해 담는다: `/#code=<lz-string>`.
// 프래그먼트(#...)는 HTTP 요청에 실리지 않으므로 코드가 서버 로그에 남지 않는다.

export const SHARE_HASH_KEY = "code";

/** 이보다 긴 링크는 일부 브라우저·메신저에서 잘릴 수 있어 경고한다. */
export const MAX_SHARE_URL_LENGTH = 8000;

export function encodeSharedCode(code: string): string {
  return compressToEncodedURIComponent(code);
}

/** 손상된 입력이면 null. 빈 문자열은 빈 코드로 복원한다. */
const EMPTY_ENCODED = compressToEncodedURIComponent("");

export function decodeSharedCode(encoded: string): string | null {
  if (encoded === "" || encoded === EMPTY_ENCODED) return "";
  try {
    // lz-string은 손상된 입력에 null 또는 ""를 돌려준다.
    const decoded = decompressFromEncodedURIComponent(encoded);
    return decoded ? decoded : null;
  } catch {
    return null;
  }
}

/** `base`는 쿼리·프래그먼트가 없는 페이지 URL (origin + pathname). */
export function buildShareUrl(code: string, base: string): string {
  return `${base}#${SHARE_HASH_KEY}=${encodeSharedCode(code)}`;
}

export type SharedCodeResult =
  /** 링크에 코드가 들어 있다. */
  | { kind: "code"; code: string }
  /** 서버 공유 링크(`?share=TOKEN`) — 백엔드 종료로 더 이상 불러올 수 없다. */
  | { kind: "legacy-share" }
  /** `#code=` 값이 손상됐다 (복사 중 잘림 등). */
  | { kind: "invalid" }
  | { kind: "none" };

function readHashCode(hash: string): string | undefined {
  const body = hash.startsWith("#") ? hash.slice(1) : hash;
  // URLSearchParams는 '+'를 공백으로 바꾸므로 쓰지 않는다 — lz-string URI 알파벳에 '+'가 있다.
  for (const part of body.split("&")) {
    if (part.startsWith(`${SHARE_HASH_KEY}=`)) {
      const raw = part.slice(SHARE_HASH_KEY.length + 1);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return undefined;
}

/**
 * 현재 위치에서 공유된 코드를 읽는다. 우선순위:
 * `#code=<lz-string>` → 구형 `?code=<urlencoded>` → 구형 `?share=TOKEN`(안내만).
 * 빈 코드는 무시한다 (`?code=`의 기존 동작과 동일).
 */
export function readSharedCode(search: string, hash: string): SharedCodeResult {
  const hashCode = readHashCode(hash);
  if (hashCode !== undefined && hashCode !== "") {
    const code = decodeSharedCode(hashCode);
    if (code === null) return { kind: "invalid" };
    return code === "" ? { kind: "none" } : { kind: "code", code };
  }

  const params = new URLSearchParams(search);
  const legacyCode = params.get("code");
  if (legacyCode) return { kind: "code", code: legacyCode };
  if (params.get("share")) return { kind: "legacy-share" };
  return { kind: "none" };
}
