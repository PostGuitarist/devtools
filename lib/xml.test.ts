import { describe, expect, it } from "vitest";
import { formatXml, minifyXml, validateXml } from "./xml";

describe("validateXml", () => {
  it("does not throw for well-formed XML", () => {
    expect(() => validateXml("<root><child/></root>")).not.toThrow();
  });

  it("throws for malformed XML", () => {
    expect(() => validateXml("<root><child></root>")).toThrow();
  });
});

describe("minifyXml", () => {
  it("removes whitespace between tags", () => {
    expect(minifyXml("<root>\n  <child>text</child>\n</root>")).toBe(
      "<root><child>text</child></root>"
    );
  });
});

describe("formatXml", () => {
  it("indents nested elements", () => {
    const formatted = formatXml("<root><child>text</child></root>");
    expect(formatted).toBe("<root>\n  <child>text</child>\n</root>");
  });

  it("respects a custom indent size", () => {
    const formatted = formatXml("<root><child>text</child></root>", 4);
    expect(formatted).toBe("<root>\n    <child>text</child>\n</root>");
  });
});
