import { describe, expect, it } from "vitest";
import { legacyPlaygroundTarget } from "./legacy-redirect";
import { readSharedCode } from "./lib/share";

describe("legacyPlaygroundTarget", () => {
  it("forwards #code= with the fragment intact", () => {
    expect(legacyPlaygroundTarget("", "#code=abc")).toBe("/playground/#code=abc");
  });

  it("forwards legacy ?code= and ?share= with the query intact", () => {
    expect(legacyPlaygroundTarget("?code=%EC%B6%9C%EB%A0%A5", "")).toBe("/playground/?code=%EC%B6%9C%EB%A0%A5");
    expect(legacyPlaygroundTarget("?share=tok", "")).toBe("/playground/?share=tok");
  });

  it("keeps the forwarded link readable by readSharedCode", () => {
    const target = new URL(legacyPlaygroundTarget("", "#x=1&code=BYUw")!, "https://hongik.tolelom.xyz");
    expect(readSharedCode(target.search, target.hash).kind).not.toBe("none");
  });

  it("leaves the plain intro page alone", () => {
    expect(legacyPlaygroundTarget("", "")).toBeNull();
    expect(legacyPlaygroundTarget("?utm_source=x", "#features")).toBeNull();
    expect(legacyPlaygroundTarget("", "#encode=1")).toBeNull();
  });
});
