import { describe, expect, it } from "vitest";
import { encodedToText, formatByte, textToEncoded } from "./binary-text";

describe("formatByte", () => {
  it("pads binary to 8 digits", () => {
    expect(formatByte(65, "binary")).toBe("01000001");
  });

  it("pads octal to 3 digits", () => {
    expect(formatByte(65, "octal")).toBe("101");
  });

  it("pads hexadecimal to 2 digits", () => {
    expect(formatByte(10, "hexadecimal")).toBe("0a");
  });

  it("does not pad decimal", () => {
    expect(formatByte(65, "decimal")).toBe("65");
  });
});

describe("textToEncoded / encodedToText", () => {
  it("round-trips ASCII text through binary", () => {
    const encoded = textToEncoded("Hi", "binary");
    expect(encoded).toBe("01001000 01101001");
    expect(encodedToText(encoded, "binary")).toBe("Hi");
  });

  it("round-trips through hexadecimal", () => {
    const encoded = textToEncoded("AB", "hexadecimal");
    expect(encoded).toBe("41 42");
    expect(encodedToText(encoded, "hexadecimal")).toBe("AB");
  });

  it("round-trips through octal and decimal", () => {
    expect(encodedToText(textToEncoded("!", "octal"), "octal")).toBe("!");
    expect(encodedToText(textToEncoded("!", "decimal"), "decimal")).toBe("!");
  });

  it("handles multi-byte UTF-8 characters", () => {
    const encoded = textToEncoded("café", "hexadecimal");
    expect(encodedToText(encoded, "hexadecimal")).toBe("café");
  });

  it("returns an empty string for empty input", () => {
    expect(textToEncoded("", "binary")).toBe("");
    expect(encodedToText("", "binary")).toBe("");
  });

  it("throws on a token with digits invalid for the base", () => {
    expect(() => encodedToText("18", "octal")).toThrow();
  });

  it("throws on a token outside byte range", () => {
    expect(() => encodedToText("999", "decimal")).toThrow();
  });
});
