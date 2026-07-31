import { describe, expect, it } from "vitest";
import { entropyBits, generateIds, inspectUlid, MAX_QUANTITY } from "./id-generator";

describe("generateIds — nanoid", () => {
  it("generates the requested count", () => {
    expect(generateIds({ kind: "nanoid", quantity: 5 })).toHaveLength(5);
  });

  it("defaults to 21 characters", () => {
    const [id] = generateIds({ kind: "nanoid", quantity: 1 });
    expect(id).toHaveLength(21);
  });

  it("honours a custom size", () => {
    const [id] = generateIds({ kind: "nanoid", quantity: 1, size: 10 });
    expect(id).toHaveLength(10);
  });

  it("clamps the size to the supported range", () => {
    expect(generateIds({ kind: "nanoid", quantity: 1, size: 999 })[0]).toHaveLength(64);
    expect(generateIds({ kind: "nanoid", quantity: 1, size: 0 })[0]).toHaveLength(2);
  });

  it("only uses characters from a custom alphabet", () => {
    const ids = generateIds({ kind: "nanoid", quantity: 20, size: 12, alphabet: "abc" });
    expect(ids.every((id) => /^[abc]{12}$/.test(id))).toBe(true);
  });

  it("de-duplicates a custom alphabet", () => {
    const ids = generateIds({ kind: "nanoid", quantity: 5, size: 8, alphabet: "aaab" });
    expect(ids.every((id) => /^[ab]{8}$/.test(id))).toBe(true);
  });

  it("produces unique ids", () => {
    const ids = generateIds({ kind: "nanoid", quantity: 100 });
    expect(new Set(ids).size).toBe(100);
  });
});

describe("generateIds — ULID", () => {
  it("generates 26-character Crockford base32 ids", () => {
    const ids = generateIds({ kind: "ulid", quantity: 3 });
    expect(ids.every((id) => /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id))).toBe(true);
  });

  it("sorts lexicographically when monotonic", () => {
    const ids = generateIds({ kind: "ulid", quantity: 25, monotonic: true });
    expect([...ids].sort()).toEqual(ids);
  });

  it("can render lowercase", () => {
    const [id] = generateIds({ kind: "ulid", quantity: 1, lowercase: true });
    expect(id).toBe(id.toLowerCase());
  });
});

describe("generateIds — quantity handling", () => {
  it("returns nothing for zero or negative counts", () => {
    expect(generateIds({ kind: "nanoid", quantity: 0 })).toEqual([]);
    expect(generateIds({ kind: "ulid", quantity: -3 })).toEqual([]);
  });

  it("caps the count", () => {
    expect(generateIds({ kind: "nanoid", quantity: 10_000, size: 4 })).toHaveLength(MAX_QUANTITY);
  });
});

describe("inspectUlid", () => {
  it("splits a ULID into its timestamp and randomness", () => {
    const [id] = generateIds({ kind: "ulid", quantity: 1 });
    const details = inspectUlid(id);
    expect(details?.timestampPart).toHaveLength(10);
    expect(details?.randomPart).toHaveLength(16);
    expect(Math.abs((details?.timestamp.getTime() ?? 0) - Date.now())).toBeLessThan(60_000);
    expect(details?.uuid).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("accepts lowercase input", () => {
    const [id] = generateIds({ kind: "ulid", quantity: 1, lowercase: true });
    expect(inspectUlid(id)).not.toBeNull();
  });

  it("returns null for anything that isn't a ULID", () => {
    expect(inspectUlid("not-a-ulid")).toBeNull();
    expect(inspectUlid("")).toBeNull();
  });
});

describe("entropyBits", () => {
  it("reports 80 bits for ULIDs", () => {
    expect(entropyBits({ kind: "ulid" })).toBe(80);
  });

  it("scales with size and alphabet", () => {
    expect(entropyBits({ kind: "nanoid", size: 21 })).toBe(126);
    expect(entropyBits({ kind: "nanoid", size: 8, alphabet: "0123456789abcdef" })).toBe(32);
  });

  it("reports no entropy for a single-character alphabet", () => {
    expect(entropyBits({ kind: "nanoid", size: 10, alphabet: "a" })).toBe(0);
  });
});
