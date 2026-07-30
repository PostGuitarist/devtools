import { describe, expect, it } from "vitest";
import { parseSvgDimensions, svgToDataUri } from "./svg-to-png";

describe("parseSvgDimensions", () => {
  it("reads width/height attributes", () => {
    expect(parseSvgDimensions('<svg width="200" height="100"></svg>')).toEqual({
      width: 200,
      height: 100,
    });
  });

  it("strips a px suffix from width/height", () => {
    expect(parseSvgDimensions('<svg width="200px" height="100px"></svg>')).toEqual({
      width: 200,
      height: 100,
    });
  });

  it("falls back to viewBox when width/height are absent", () => {
    expect(parseSvgDimensions('<svg viewBox="0 0 64 32"></svg>')).toEqual({
      width: 64,
      height: 32,
    });
  });

  it("falls back to the SVG spec default when nothing is present", () => {
    expect(parseSvgDimensions("<svg></svg>")).toEqual({ width: 300, height: 150 });
  });

  it("falls back to the default for non-SVG input", () => {
    expect(parseSvgDimensions("not svg")).toEqual({ width: 300, height: 150 });
  });
});

describe("svgToDataUri", () => {
  it("produces a data URI usable as an <img> src", () => {
    const uri = svgToDataUri('<svg><rect width="10" height="10"/></svg>');
    expect(uri).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
  });
});
