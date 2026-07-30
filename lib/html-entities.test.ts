import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, encodeHtmlEntities } from "./html-entities";

describe("encodeHtmlEntities", () => {
  it("escapes reserved HTML characters", () => {
    expect(encodeHtmlEntities(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
    );
  });
});

describe("decodeHtmlEntities", () => {
  it("unescapes HTML entities back to raw characters", () => {
    expect(decodeHtmlEntities("&lt;b&gt;&amp;&lt;/b&gt;")).toBe("<b>&</b>");
  });

  it("round-trips through encode/decode", () => {
    const original = `<div class="test">Tom & Jerry's</div>`;
    expect(decodeHtmlEntities(encodeHtmlEntities(original))).toBe(original);
  });
});
