import { describe, expect, it } from "vitest";
import { buildCharset, estimateStrength, generatePassword, type PasswordOptions } from "./password";

const baseOptions: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

describe("buildCharset", () => {
  it("combines only the enabled character sets", () => {
    const charset = buildCharset({ ...baseOptions, uppercase: false, symbols: false });
    expect(charset).not.toMatch(/[A-Z]/);
    expect(charset).toMatch(/[a-z]/);
    expect(charset).toMatch(/[0-9]/);
  });

  it("excludes ambiguous characters when requested", () => {
    const charset = buildCharset({ ...baseOptions, excludeAmbiguous: true });
    expect(charset).not.toMatch(/[0O1lI|]/);
  });

  it("returns an empty string when nothing is enabled", () => {
    expect(
      buildCharset({
        length: 10,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      })
    ).toBe("");
  });
});

describe("generatePassword", () => {
  it("generates a password of the requested length", () => {
    expect(generatePassword(baseOptions)).toHaveLength(16);
  });

  it("only uses characters from the built charset", () => {
    const options = { ...baseOptions, symbols: false };
    const charset = buildCharset(options);
    const password = generatePassword(options);
    expect([...password].every((char) => charset.includes(char))).toBe(true);
  });

  it("returns an empty string when charset is empty", () => {
    expect(
      generatePassword({
        length: 10,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      })
    ).toBe("");
  });
});

describe("estimateStrength", () => {
  it("rates a short, small-charset password as weak", () => {
    expect(estimateStrength(4, 10)).toBe("weak");
  });

  it("rates a long, large-charset password as very-strong", () => {
    expect(estimateStrength(32, 94)).toBe("very-strong");
  });

  it("treats zero length or charset as weak", () => {
    expect(estimateStrength(0, 94)).toBe("weak");
    expect(estimateStrength(16, 0)).toBe("weak");
  });
});
