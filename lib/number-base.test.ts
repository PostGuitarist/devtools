import { describe, expect, it } from "vitest";
import {
  convertBase,
  formatBigIntInBase,
  isValidForBase,
  parseBigIntInBase,
} from "./number-base";

describe("isValidForBase", () => {
  it("accepts valid digits for a base", () => {
    expect(isValidForBase("1010", 2)).toBe(true);
    expect(isValidForBase("ff", 16)).toBe(true);
  });

  it("rejects digits outside the base's alphabet", () => {
    expect(isValidForBase("102", 2)).toBe(false);
    expect(isValidForBase("gg", 16)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidForBase("", 10)).toBe(false);
  });
});

describe("parseBigIntInBase", () => {
  it("parses binary, octal, decimal, and hex", () => {
    expect(parseBigIntInBase("1010", 2)).toBe(BigInt(10));
    expect(parseBigIntInBase("17", 8)).toBe(BigInt(15));
    expect(parseBigIntInBase("42", 10)).toBe(BigInt(42));
    expect(parseBigIntInBase("ff", 16)).toBe(BigInt(255));
  });

  it("strips common prefixes", () => {
    expect(parseBigIntInBase("0xFF", 16)).toBe(BigInt(255));
    expect(parseBigIntInBase("0b1010", 2)).toBe(BigInt(10));
    expect(parseBigIntInBase("0o17", 8)).toBe(BigInt(15));
  });

  it("parses negative numbers", () => {
    expect(parseBigIntInBase("-ff", 16)).toBe(BigInt(-255));
  });

  it("handles arbitrarily large numbers via BigInt", () => {
    expect(parseBigIntInBase("ffffffffffffffff", 16)).toBe(
      BigInt("18446744073709551615")
    );
  });

  it("throws on invalid input", () => {
    expect(() => parseBigIntInBase("102", 2)).toThrow();
    expect(() => parseBigIntInBase("", 10)).toThrow();
  });

  it("throws for an out-of-range base", () => {
    expect(() => parseBigIntInBase("1", 1)).toThrow();
    expect(() => parseBigIntInBase("1", 37)).toThrow();
  });
});

describe("formatBigIntInBase", () => {
  it("formats zero", () => {
    expect(formatBigIntInBase(BigInt(0), 16)).toBe("0");
  });

  it("formats positive and negative values", () => {
    expect(formatBigIntInBase(BigInt(255), 16)).toBe("ff");
    expect(formatBigIntInBase(BigInt(-255), 16)).toBe("-ff");
  });
});

describe("convertBase", () => {
  it("round-trips a value between bases", () => {
    expect(convertBase("ff", 16, 2)).toBe("11111111");
    expect(convertBase("255", 10, 16)).toBe("ff");
  });
});
