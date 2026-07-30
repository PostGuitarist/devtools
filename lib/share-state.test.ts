import { describe, expect, it } from "vitest";
import { decodeStateFromParam, encodeStateToParam } from "./share-state";

describe("encodeStateToParam / decodeStateFromParam", () => {
  it("round-trips a plain object", () => {
    const state = { pattern: "a.*b", flags: "gi", text: "sample" };
    expect(decodeStateFromParam(encodeStateToParam(state))).toEqual(state);
  });

  it("round-trips unicode content", () => {
    const state = { text: "héllo wörld 🎉" };
    expect(decodeStateFromParam(encodeStateToParam(state))).toEqual(state);
  });

  it("produces a URL-safe string with no +, /, or = characters", () => {
    const encoded = encodeStateToParam({ text: "a".repeat(200) + "??>>" });
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("round-trips arrays and nested structures", () => {
    const state = { rows: [1, 2, 3], nested: { a: [{ b: "c" }] } };
    expect(decodeStateFromParam(encodeStateToParam(state))).toEqual(state);
  });
});
