import { describe, expect, it } from "vitest";
import { markdownToHtml } from "./markdown";

describe("markdownToHtml", () => {
  it("renders headings and paragraphs", () => {
    const html = markdownToHtml("# Hello\n\nWorld");
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain("<p>World</p>");
  });

  it("renders GFM tables and strikethrough", () => {
    const html = markdownToHtml("| a | b |\n| - | - |\n| 1 | 2 |\n\n~~gone~~");
    expect(html).toContain("<table>");
    expect(html).toContain("<del>gone</del>");
  });

  it("renders fenced code blocks", () => {
    const html = markdownToHtml("```js\nconst x = 1;\n```");
    expect(html).toContain("<pre><code");
    expect(html).toContain("const x = 1;");
  });

  it("strips script tags and inline event handlers", () => {
    const html = markdownToHtml('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("onerror");
  });

  it("returns an empty string for empty input", () => {
    expect(markdownToHtml("")).toBe("");
  });
});
