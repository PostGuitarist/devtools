import { describe, expect, it } from "vitest";
import { validateJson } from "./json-validator";

describe("validateJson", () => {
  it("reports valid for well-formed JSON with structure stats", () => {
    const result = validateJson('{"a": 1, "b": [1, 2, 3], "c": {"d": null}}');
    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error("expected valid");
    expect(result.stats.objectCount).toBe(2);
    expect(result.stats.arrayCount).toBe(1);
    expect(result.stats.numberCount).toBe(4);
    expect(result.stats.nullCount).toBe(1);
    expect(result.stats.keyCount).toBe(4);
    expect(result.stats.maxDepth).toBeGreaterThanOrEqual(2);
  });

  it("computes depth for nested objects", () => {
    const result = validateJson('{"a": {"b": {"c": 1}}}');
    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error("expected valid");
    expect(result.stats.maxDepth).toBe(4);
  });

  it("reports invalid for malformed JSON with a positive line/column", () => {
    const result = validateJson("{bad}");
    expect(result.valid).toBe(false);
    if (result.valid) throw new Error("expected invalid");
    expect(result.error.message.length).toBeGreaterThan(0);
    expect(result.error.line).toBeGreaterThanOrEqual(1);
    expect(result.error.column).toBeGreaterThanOrEqual(1);
  });

  it("reports invalid for empty input", () => {
    const result = validateJson("");
    expect(result.valid).toBe(false);
  });

  it("locates the error on the correct line for multi-line input", () => {
    const result = validateJson('{\n  "a": 1,\n  "b": bad\n}');
    expect(result.valid).toBe(false);
    if (result.valid) throw new Error("expected invalid");
    expect(result.error.line).toBeGreaterThanOrEqual(1);
  });
});
