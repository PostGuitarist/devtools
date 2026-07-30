import { describe, expect, it } from "vitest";
import { beautifyCss, computeCssSizeStats, minifyCss } from "./css-formatter";

describe("minifyCss", () => {
  it("collapses whitespace and removes comments", () => {
    const css = `
      /* header */
      .foo {
        color: red;
        margin: 0 auto;
      }
    `;
    expect(minifyCss(css)).toBe(".foo{color:red;margin:0 auto}");
  });

  it("removes the trailing semicolon before a closing brace", () => {
    expect(minifyCss(".a { color: red; }")).toBe(".a{color:red}");
  });

  it("collapses whitespace around combinators", () => {
    expect(minifyCss("div > p + span ~ a { color: red; }")).toBe("div>p+span~a{color:red}");
  });

  it("preserves string literals containing punctuation and whitespace", () => {
    const css = `.a { content: "hello; world: {}" ; font-family: 'Comic Sans MS' ; }`;
    expect(minifyCss(css)).toBe('.a{content:"hello; world: {}";font-family:\'Comic Sans MS\'}');
  });

  it("does not treat quotes inside strings as comment delimiters", () => {
    const css = `.a { content: "/* not a comment */"; }`;
    expect(minifyCss(css)).toBe('.a{content:"/* not a comment */"}');
  });
});

describe("beautifyCss", () => {
  it("reformats minified CSS with indentation", () => {
    const result = beautifyCss(".a{color:red;margin:0 auto}");
    expect(result).toBe(".a {\n  color: red;\n  margin: 0 auto;\n}\n");
  });

  it("handles nested rules (e.g. media queries)", () => {
    const result = beautifyCss("@media (min-width:600px){.a{color:red}}");
    expect(result).toBe("@media (min-width:600px) {\n  .a {\n    color: red;\n  }\n}\n");
  });

  it("keeps comments on their own line", () => {
    const result = beautifyCss("/* note */.a{color:red}");
    expect(result).toBe("/* note */\n.a {\n  color: red;\n}\n");
  });
});

describe("computeCssSizeStats", () => {
  it("computes byte counts and savings", () => {
    const stats = computeCssSizeStats(".a { color: red; }", ".a{color:red}");
    expect(stats.originalBytes).toBe(18);
    expect(stats.resultBytes).toBe(13);
    expect(stats.savedBytes).toBe(5);
    expect(stats.savedPercent).toBeCloseTo((5 / 18) * 100, 5);
  });

  it("does not report negative savings when the result is larger", () => {
    const stats = computeCssSizeStats("a{}", "a { }");
    expect(stats.savedBytes).toBe(0);
  });
});
