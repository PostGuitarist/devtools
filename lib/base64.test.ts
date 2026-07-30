import { describe, expect, it } from "vitest";
import { decodeBase64, encodeBase64 } from "./base64";

describe("encodeBase64", () => {
  it("encodes plain ASCII text", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
  });

  it("encodes unicode text as UTF-8", () => {
    expect(encodeBase64("héllo")).toBe(btoa(unescape(encodeURIComponent("héllo"))));
  });

  it("encodes an empty string", () => {
    expect(encodeBase64("")).toBe("");
  });
});

describe("decodeBase64", () => {
  it("decodes back to the original text", () => {
    expect(decodeBase64("aGVsbG8=")).toBe("hello");
  });

  it("round-trips unicode text", () => {
    const original = "héllo wörld 🎉";
    expect(decodeBase64(encodeBase64(original))).toBe(original);
  });

  it("throws on invalid base64 input", () => {
    expect(() => decodeBase64("not-valid-base64!!")).toThrow();
  });
});
