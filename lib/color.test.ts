import { describe, expect, it } from "vitest";
import { formatHsl, formatRgb, hslToRgb, parseColor, rgbToHex, rgbToHsl } from "./color";

describe("parseColor", () => {
  it("parses a 6-digit hex color", () => {
    expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses a 3-digit hex color", () => {
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses an rgb() string", () => {
    expect(parseColor("rgb(0, 128, 255)")).toEqual({ r: 0, g: 128, b: 255 });
  });

  it("parses an hsl() string", () => {
    expect(parseColor("hsl(0, 100%, 50%)")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid input", () => {
    expect(parseColor("not-a-color")).toBeNull();
    expect(parseColor("")).toBeNull();
    expect(parseColor("rgb(999, 0, 0)")).toBeNull();
  });
});

describe("rgbToHex", () => {
  it("formats channels as lowercase hex", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
  });
});

describe("formatRgb", () => {
  it("formats as rgb(...)", () => {
    expect(formatRgb({ r: 1, g: 2, b: 3 })).toBe("rgb(1, 2, 3)");
  });
});

describe("rgbToHsl / hslToRgb round trip", () => {
  it("round-trips pure red", () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(hsl).toEqual({ h: 0, s: 100, l: 50 });
    expect(hslToRgb(hsl)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("round-trips gray (zero saturation)", () => {
    const hsl = rgbToHsl({ r: 128, g: 128, b: 128 });
    expect(hsl.s).toBe(0);
    expect(hslToRgb(hsl)).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe("formatHsl", () => {
  it("formats as hsl(...)", () => {
    expect(formatHsl({ h: 10, s: 20, l: 30 })).toBe("hsl(10, 20%, 30%)");
  });
});
