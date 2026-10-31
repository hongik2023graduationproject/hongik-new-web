import { describe, expect, it } from "vitest";
import {
  MAX_SHARE_URL_LENGTH,
  buildShareUrl,
  playgroundUrl,
  decodeSharedCode,
  encodeSharedCode,
  readSharedCode,
} from "./share";

const BASE = "https://hongik.tolelom.xyz/playground/";

function hashOf(url: string): string {
  return url.slice(url.indexOf("#"));
}

describe("encodeSharedCode / decodeSharedCode", () => {
  const cases: Record<string, string> = {
    korean: '정수 x = 10\n만약 x > 5 라면:\n    출력("크다")\n아니면:\n    출력("작다")',
    emoji: '문자열 s = "안녕 👋🏽 🇰🇷 👨‍👩‍👧"\n출력(s)',
    empty: "",
    symbols: "a+b-c$d %20 #해시 &amp; ?q=1 \t\r\n\\",
    large: Array.from({ length: 2000 }, (_, i) => `정수 변수${i} = ${i} // 주석 ${i} 🎉`).join("\n"),
  };

  for (const [name, code] of Object.entries(cases)) {
    it(`round-trips ${name}`, () => {
      expect(decodeSharedCode(encodeSharedCode(code))).toBe(code);
    });
  }

  it("emits only URL-fragment-safe characters", () => {
    expect(encodeSharedCode(cases.korean!)).toMatch(/^[A-Za-z0-9+\-$]*$/);
  });

  it("compresses repetitive code well", () => {
    expect(encodeSharedCode(cases.large!).length).toBeLessThan(cases.large!.length);
  });
});

describe("buildShareUrl + readSharedCode", () => {
  it("builds links on /playground/", () => {
    const url = new URL(buildShareUrl("출력(1)", playgroundUrl("https://hongik.tolelom.xyz")));
    expect(url.origin + url.pathname).toBe("https://hongik.tolelom.xyz/playground/");
  });

  it("puts the code in the fragment, not the query", () => {
    const url = new URL(buildShareUrl("출력(1)", BASE));
    expect(url.search).toBe("");
    expect(url.hash.startsWith("#code=")).toBe(true);
  });

  it("round-trips through the fragment (Korean + emoji)", () => {
    const code = '출력("홍익 🚀")';
    expect(readSharedCode("", hashOf(buildShareUrl(code, BASE)))).toEqual({ kind: "code", code });
  });

  it("round-trips through a browser-normalised URL", () => {
    const code = "정수 a = 1 + 2\n출력(a)";
    const url = new URL(buildShareUrl(code, BASE));
    expect(readSharedCode(url.search, url.hash)).toEqual({ kind: "code", code });
  });

  it("tolerates a percent-encoded fragment", () => {
    const code = "출력(1)";
    const encoded = encodeURIComponent(encodeSharedCode(code));
    expect(readSharedCode("", `#code=${encoded}`)).toEqual({ kind: "code", code });
  });

  it("flags a large program's URL as over the length limit", () => {
    const random = Array.from({ length: 20000 }, (_, i) => String.fromCharCode(0xac00 + ((i * 7919) % 11172))).join("");
    expect(buildShareUrl(random, BASE).length).toBeGreaterThan(MAX_SHARE_URL_LENGTH);
    expect(readSharedCode("", hashOf(buildShareUrl(random, BASE)))).toEqual({ kind: "code", code: random });
  });

  it("reports a corrupted fragment as invalid", () => {
    expect(readSharedCode("", "#code=!!!")).toEqual({ kind: "invalid" });
  });

  it("ignores an empty fragment code", () => {
    expect(readSharedCode("", "#code=")).toEqual({ kind: "none" });
    expect(readSharedCode("", "")).toEqual({ kind: "none" });
  });
});

describe("legacy links", () => {
  it("loads ?code=<urlencoded>", () => {
    const code = '출력("안녕 + 세상 🌏")\n정수 x = 1';
    expect(readSharedCode(`?code=${encodeURIComponent(code)}`, "")).toEqual({ kind: "code", code });
  });

  it("prefers the fragment over ?code=", () => {
    const code = "출력(2)";
    const hash = hashOf(buildShareUrl(code, BASE));
    expect(readSharedCode("?code=old", hash)).toEqual({ kind: "code", code });
  });

  it("recognises ?share=TOKEN as an unsupported server link", () => {
    expect(readSharedCode("?share=abc123", "")).toEqual({ kind: "legacy-share" });
  });

  it("prefers ?code= over ?share=", () => {
    expect(readSharedCode("?share=abc&code=x", "")).toEqual({ kind: "code", code: "x" });
  });
});
