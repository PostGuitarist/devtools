import { describe, expect, it } from "vitest";
import { computeWordCounterStats, wordFrequency } from "./word-counter";

describe("computeWordCounterStats", () => {
  it("returns all zeros for empty text", () => {
    const stats = computeWordCounterStats("");
    expect(stats.words).toBe(0);
    expect(stats.characters).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.paragraphs).toBe(0);
    expect(stats.lines).toBe(0);
  });

  it("counts words, characters, and sentences", () => {
    const stats = computeWordCounterStats("Hello world. How are you?");
    expect(stats.words).toBe(5);
    expect(stats.characters).toBe(25);
    expect(stats.sentences).toBe(2);
  });

  it("counts paragraphs separated by blank lines", () => {
    const stats = computeWordCounterStats("First paragraph.\n\nSecond paragraph.");
    expect(stats.paragraphs).toBe(2);
  });

  it("counts lines", () => {
    const stats = computeWordCounterStats("line one\nline two\nline three");
    expect(stats.lines).toBe(3);
  });

  it("computes reading and speaking time from word count", () => {
    const stats = computeWordCounterStats(Array(200).fill("word").join(" "));
    expect(stats.readingTimeMinutes).toBeCloseTo(1, 5);
    expect(stats.speakingTimeMinutes).toBeCloseTo(200 / 130, 5);
  });

  it("counts characters excluding whitespace", () => {
    const stats = computeWordCounterStats("a b  c");
    expect(stats.charactersNoSpaces).toBe(3);
  });
});

describe("wordFrequency", () => {
  it("counts word occurrences case-insensitively", () => {
    const result = wordFrequency("The cat sat on the mat. The cat ran.");
    expect(result[0]).toEqual({ word: "the", count: 3 });
    expect(result.find((r) => r.word === "cat")?.count).toBe(2);
  });

  it("respects the limit parameter", () => {
    const result = wordFrequency("one two three four five", 2);
    expect(result).toHaveLength(2);
  });

  it("returns an empty array for empty text", () => {
    expect(wordFrequency("")).toEqual([]);
  });
});
