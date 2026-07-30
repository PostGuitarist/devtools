import { describe, expect, it } from "vitest";
import { computeLineDiff, formatDiffAsText } from "./text-diff";

describe("computeLineDiff", () => {
  it("marks identical text as unchanged", () => {
    const lines = computeLineDiff("a\nb", "a\nb");
    expect(lines.every((line) => line.type === "unchanged")).toBe(true);
  });

  it("detects added and removed lines", () => {
    const lines = computeLineDiff("a\nb\nc", "a\nx\nc");
    expect(lines.map((line) => line.type)).toContain("added");
    expect(lines.map((line) => line.type)).toContain("removed");
  });

  it("does not emit a trailing empty line for trailing newlines", () => {
    const lines = computeLineDiff("a\n", "a\n");
    expect(lines.some((line) => line.text === "" )).toBe(false);
  });
});

describe("formatDiffAsText", () => {
  it("prefixes added/removed/unchanged lines correctly", () => {
    const text = formatDiffAsText([
      { type: "added", text: "new" },
      { type: "removed", text: "old" },
      { type: "unchanged", text: "same" },
    ]);
    expect(text).toBe("+ new\n- old\n  same");
  });
});
