import { describe, expect, it } from "vitest";
import { buildHighlightSegments, getMatches } from "./regex-tester";

describe("getMatches", () => {
  it("returns an empty result for an empty pattern", () => {
    expect(getMatches("", "", "some text")).toEqual({ matches: [], error: null });
  });

  it("finds all matches even when the g flag isn't set", () => {
    const result = getMatches("a", "", "banana");
    expect(result.matches).toHaveLength(3);
    expect(result.matches.map((m) => m.index)).toEqual([1, 3, 5]);
  });

  it("is case-insensitive with the i flag", () => {
    const result = getMatches("a", "i", "Banana");
    expect(result.matches).toHaveLength(3);
  });

  it("captures numbered groups", () => {
    const result = getMatches("(\\d+)-(\\d+)", "", "10-20");
    expect(result.matches[0].groups.numbered).toEqual(["10", "20"]);
  });

  it("captures named groups", () => {
    const result = getMatches("(?<year>\\d{4})-(?<month>\\d{2})", "", "2023-11");
    expect(result.matches[0].groups.named).toEqual({ year: "2023", month: "11" });
  });

  it("returns an error for an invalid pattern instead of throwing", () => {
    const result = getMatches("(unterminated", "", "text");
    expect(result.matches).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("handles zero-length matches without looping forever", () => {
    const result = getMatches("x*", "", "abc");
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches.every((m) => m.match === "")).toBe(true);
  });

  it("returns no matches when the pattern isn't found", () => {
    expect(getMatches("zzz", "", "abc").matches).toEqual([]);
  });
});

describe("buildHighlightSegments", () => {
  it("returns the whole text as unmatched when there are no matches", () => {
    expect(buildHighlightSegments("hello", [])).toEqual([{ text: "hello", matched: false }]);
  });

  it("splits text into matched and unmatched segments", () => {
    const { matches } = getMatches("a", "", "banana");
    const segments = buildHighlightSegments("banana", matches);
    expect(segments).toEqual([
      { text: "b", matched: false },
      { text: "a", matched: true },
      { text: "n", matched: false },
      { text: "a", matched: true },
      { text: "n", matched: false },
      { text: "a", matched: true },
    ]);
  });

  it("reconstructs the original text when segments are joined", () => {
    const text = "the quick brown fox jumps over the lazy dog";
    const { matches } = getMatches("o", "", text);
    const segments = buildHighlightSegments(text, matches);
    expect(segments.map((s) => s.text).join("")).toBe(text);
  });
});
