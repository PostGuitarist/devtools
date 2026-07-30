import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "./html-to-markdown";

describe("htmlToMarkdown", () => {
  it("converts headings and paragraphs", () => {
    const result = htmlToMarkdown("<h1>Hello</h1><p>World</p>");
    expect(result).toContain("# Hello");
    expect(result).toContain("World");
  });

  it("converts bold and italic text", () => {
    const result = htmlToMarkdown("<p><strong>bold</strong> and <em>italic</em></p>");
    expect(result).toContain("**bold**");
    expect(result).toContain("_italic_");
  });

  it("converts unordered lists with a dash marker", () => {
    const result = htmlToMarkdown("<ul><li>a</li><li>b</li></ul>");
    expect(result).toMatch(/^-\s+a/m);
    expect(result).toMatch(/^-\s+b/m);
  });

  it("converts links", () => {
    const result = htmlToMarkdown('<a href="https://example.com">link</a>');
    expect(result).toBe("[link](https://example.com)");
  });

  it("converts fenced code blocks", () => {
    const result = htmlToMarkdown("<pre><code>const x = 1;</code></pre>");
    expect(result).toContain("```");
    expect(result).toContain("const x = 1;");
  });

  it("converts GFM tables via the gfm plugin", () => {
    const result = htmlToMarkdown(
      "<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>"
    );
    expect(result).toContain("| A | B |");
    expect(result).toContain("| 1 | 2 |");
  });

  it("converts strikethrough via the gfm plugin", () => {
    const result = htmlToMarkdown("<del>gone</del>");
    expect(result).toContain("gone");
    expect(result).toMatch(/~+gone~+/);
  });

  it("returns an empty string for empty input", () => {
    expect(htmlToMarkdown("")).toBe("");
  });
});
