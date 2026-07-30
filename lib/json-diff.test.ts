import { describe, expect, it } from "vitest";
import { computeJsonDiff, formatJsonDiffAsText, formatJsonDiffValue } from "./json-diff";

describe("computeJsonDiff", () => {
  it("returns no entries for identical documents", () => {
    expect(computeJsonDiff('{"a":1}', '{"a":1}')).toEqual([]);
  });

  it("detects an added key", () => {
    const entries = computeJsonDiff("{}", '{"a":1}');
    expect(entries).toEqual([{ path: "a", type: "added", newValue: 1 }]);
  });

  it("detects a removed key", () => {
    const entries = computeJsonDiff('{"a":1}', "{}");
    expect(entries).toEqual([{ path: "a", type: "removed", oldValue: 1 }]);
  });

  it("detects a changed primitive value", () => {
    const entries = computeJsonDiff('{"a":1}', '{"a":2}');
    expect(entries).toEqual([{ path: "a", type: "changed", oldValue: 1, newValue: 2 }]);
  });

  it("recurses into nested objects with dotted paths", () => {
    const entries = computeJsonDiff('{"a":{"b":1}}', '{"a":{"b":2}}');
    expect(entries).toEqual([{ path: "a.b", type: "changed", oldValue: 1, newValue: 2 }]);
  });

  it("diffs arrays by index and reports length changes as added/removed", () => {
    const entries = computeJsonDiff("[1,2]", "[1,3,4]");
    expect(entries).toEqual([
      { path: "[1]", type: "changed", oldValue: 2, newValue: 3 },
      { path: "[2]", type: "added", newValue: 4 },
    ]);
  });

  it("treats a type change (object to array) as a single changed root", () => {
    const entries = computeJsonDiff("{}", "[]");
    expect(entries).toEqual([{ path: "(root)", type: "changed", oldValue: {}, newValue: [] }]);
  });

  it("throws with a descriptive message for invalid original JSON", () => {
    expect(() => computeJsonDiff("{", "{}")).toThrow(/original/);
  });

  it("throws with a descriptive message for invalid changed JSON", () => {
    expect(() => computeJsonDiff("{}", "{")).toThrow(/changed/);
  });
});

describe("formatJsonDiffValue", () => {
  it("stringifies undefined explicitly", () => {
    expect(formatJsonDiffValue(undefined)).toBe("undefined");
  });

  it("JSON-stringifies other values", () => {
    expect(formatJsonDiffValue({ a: 1 })).toBe('{"a":1}');
  });
});

describe("formatJsonDiffAsText", () => {
  it("formats added/removed/changed entries with prefixes", () => {
    const text = formatJsonDiffAsText([
      { path: "a", type: "added", newValue: 1 },
      { path: "b", type: "removed", oldValue: 2 },
      { path: "c", type: "changed", oldValue: 3, newValue: 4 },
    ]);
    expect(text).toBe("+ a: 1\n- b: 2\n~ c: 3 -> 4");
  });
});
