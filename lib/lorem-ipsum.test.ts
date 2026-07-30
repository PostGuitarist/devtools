import { describe, expect, it } from "vitest";
import { generateParagraphs, generateSentences, generateWords } from "./lorem-ipsum";

describe("generateWords", () => {
  it("generates the requested number of words", () => {
    expect(generateWords(5).split(" ")).toHaveLength(5);
  });

  it("returns an empty string for zero words", () => {
    expect(generateWords(0)).toBe("");
  });
});

describe("generateSentences", () => {
  it("generates the requested number of sentences", () => {
    const sentences = generateSentences(3);
    expect(sentences.split(". ").filter(Boolean)).toHaveLength(3);
  });
});

describe("generateParagraphs", () => {
  it("generates the requested number of paragraphs", () => {
    expect(generateParagraphs(4)).toHaveLength(4);
  });

  it("starts with the classic opening by default", () => {
    const [first] = generateParagraphs(1);
    expect(first.startsWith("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")).toBe(true);
  });

  it("skips the classic opening when disabled", () => {
    const [first] = generateParagraphs(1, false);
    expect(first.startsWith("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")).toBe(false);
  });
});
