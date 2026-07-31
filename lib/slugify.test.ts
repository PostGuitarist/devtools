import { describe, expect, it } from "vitest";
import { slugify, slugifyLines } from "./slugify";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(slugify("Hello World Example")).toBe("hello-world-example");
  });

  it("strips diacritics", () => {
    expect(slugify("Crème Brûlée à Paris")).toBe("creme-brulee-a-paris");
  });

  it("expands common symbols", () => {
    expect(slugify("Rock & Roll")).toBe("rock-and-roll");
    expect(slugify("100% cotton")).toBe("100-percent-cotton");
  });

  it("transliterates letters that NFD cannot decompose", () => {
    expect(slugify("Straße Ø æther")).toBe("strasse-o-aether");
  });

  it("collapses repeated separators and trims the ends", () => {
    expect(slugify("  --Hello---World--  ")).toBe("hello-world");
  });

  it("honours a custom separator", () => {
    expect(slugify("Hello World", { separator: "_" })).toBe("hello_world");
  });

  it("removes separators entirely when given an empty one", () => {
    expect(slugify("Hello World", { separator: "" })).toBe("helloworld");
  });

  it("preserves case when lowercase is off", () => {
    expect(slugify("Hello World", { lowercase: false })).toBe("Hello-World");
  });

  it("keeps non-Latin characters when ascii is off", () => {
    expect(slugify("Привет мир", { ascii: false })).toBe("привет-мир");
    expect(slugify("日本語 の テスト", { ascii: false })).toBe("日本語-の-テスト");
  });

  it("drops non-Latin characters when ascii is on", () => {
    expect(slugify("Привет мир")).toBe("");
  });

  it("truncates at a word boundary", () => {
    expect(slugify("the quick brown fox jumps", { maxLength: 16 })).toBe("the-quick-brown");
  });

  it("does not truncate below the limit", () => {
    expect(slugify("short title", { maxLength: 50 })).toBe("short-title");
  });

  it("returns an empty string for input with no slug characters", () => {
    expect(slugify("!!! ???")).toBe("");
  });
});

describe("slugifyLines", () => {
  it("slugifies each line independently", () => {
    expect(slugifyLines("First Post\nSecond Post")).toBe("first-post\nsecond-post");
  });

  it("preserves blank lines", () => {
    expect(slugifyLines("A\n\nB")).toBe("a\n\nb");
  });
});
