import { describe, expect, it } from "vitest";
import { hashAllAlgorithms, hashText } from "./hash";

describe("hashText", () => {
  it("computes the known MD5 hash of 'hello'", async () => {
    expect(await hashText("hello", "MD5")).toBe("5d41402abc4b2a76b9719d911017c592");
  });

  it("computes the known SHA-1 hash of 'hello'", async () => {
    expect(await hashText("hello", "SHA-1")).toBe(
      "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"
    );
  });

  it("computes the known SHA-256 hash of 'hello'", async () => {
    expect(await hashText("hello", "SHA-256")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  it("computes the known SHA-512 hash of an empty string", async () => {
    expect(await hashText("", "SHA-512")).toBe(
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
    );
  });

  it("produces lowercase hex digests", async () => {
    const digest = await hashText("Test", "SHA-256");
    expect(digest).toBe(digest.toLowerCase());
  });
});

describe("hashAllAlgorithms", () => {
  it("returns a digest for every supported algorithm", async () => {
    const digests = await hashAllAlgorithms("hello");
    expect(Object.keys(digests).sort()).toEqual(["MD5", "SHA-1", "SHA-256", "SHA-512"].sort());
    expect(digests.MD5).toBe("5d41402abc4b2a76b9719d911017c592");
  });
});
