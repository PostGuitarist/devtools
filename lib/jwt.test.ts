import { describe, expect, it } from "vitest";
import {
  base64UrlEncode,
  decodeJwt,
  getClaimStatus,
  readHeaderAlgorithm,
  setHeaderAlgorithm,
  setPayloadClaim,
  signJwt,
  verifyHmacSignature,
} from "./jwt";

// A well-known public jwt.io example token, signed with the well-known
// example secret "your-256-bit-secret".
const EXAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const EXAMPLE_SECRET = "your-256-bit-secret";

describe("decodeJwt", () => {
  it("decodes header and payload of a well-formed token", () => {
    const decoded = decodeJwt(EXAMPLE_TOKEN);
    expect(decoded.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(decoded.payload).toEqual({
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    });
  });

  it("throws for a token without three parts", () => {
    expect(() => decodeJwt("not.a.jwt.token")).toThrow();
    expect(() => decodeJwt("onlyonepart")).toThrow();
  });

  it("throws for a token with malformed base64url segments", () => {
    expect(() => decodeJwt("not-json.not-json.sig")).toThrow();
  });
});

describe("getClaimStatus", () => {
  it("flags an expired exp claim", () => {
    const status = getClaimStatus({ exp: 1000 }, 2_000_000);
    expect(status.exp?.expired).toBe(true);
  });

  it("does not flag a future exp claim as expired", () => {
    const status = getClaimStatus({ exp: 9_999_999_999 }, 1000);
    expect(status.exp?.expired).toBe(false);
  });

  it("flags a not-yet-valid nbf claim", () => {
    const status = getClaimStatus({ nbf: 9_999_999_999 }, 1000);
    expect(status.nbf?.notYetValid).toBe(true);
  });

  it("returns null for absent claims", () => {
    const status = getClaimStatus({});
    expect(status.exp).toBeNull();
    expect(status.nbf).toBeNull();
    expect(status.iat).toBeNull();
  });

  it("handles a non-object payload gracefully", () => {
    expect(getClaimStatus(null)).toEqual({ iat: null, exp: null, nbf: null });
  });
});

describe("verifyHmacSignature", () => {
  it("validates a correctly signed HS256 token", async () => {
    expect(await verifyHmacSignature(EXAMPLE_TOKEN, EXAMPLE_SECRET)).toBe("valid");
  });

  it("rejects the wrong secret", async () => {
    expect(await verifyHmacSignature(EXAMPLE_TOKEN, "wrong-secret")).toBe("invalid");
  });

  it("round-trips a freshly signed token", async () => {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = { sub: "test" };
    const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
    const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
    const signingInput = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode("my-secret"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signingInput)
    );
    const token = `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;

    expect(await verifyHmacSignature(token, "my-secret")).toBe("valid");
    expect(await verifyHmacSignature(token, "not-my-secret")).toBe("invalid");
  });

  it("returns unsupported-algorithm for RS256", async () => {
    const header = { alg: "RS256", typ: "JWT" };
    const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
    const token = `${headerB64}.eyJhIjoxfQ.sig`;
    expect(await verifyHmacSignature(token, "secret")).toBe("unsupported-algorithm");
  });

  it("returns malformed for a token without three parts", async () => {
    expect(await verifyHmacSignature("not-a-jwt", "secret")).toBe("malformed");
  });
});

describe("signJwt", () => {
  it("reproduces the well-known example token", async () => {
    const token = await signJwt(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
      JSON.stringify({ sub: "1234567890", name: "John Doe", iat: 1516239022 }),
      EXAMPLE_SECRET
    );
    expect(token).toBe(EXAMPLE_TOKEN);
  });

  it("ignores whitespace in the header and payload JSON", async () => {
    const token = await signJwt(
      '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
      '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
      EXAMPLE_SECRET
    );
    expect(token).toBe(EXAMPLE_TOKEN);
  });

  it("produces tokens that verify with the same secret", async () => {
    for (const alg of ["HS256", "HS384", "HS512"]) {
      const token = await signJwt(JSON.stringify({ alg, typ: "JWT" }), '{"sub":"a"}', "secret");
      expect(await verifyHmacSignature(token, "secret"), alg).toBe("valid");
      expect(await verifyHmacSignature(token, "other"), alg).toBe("invalid");
    }
  });

  it("round-trips through decodeJwt", async () => {
    const payload = { sub: "ada", roles: ["admin"], iat: 1516239022 };
    const token = await signJwt('{"alg":"HS512","typ":"JWT"}', JSON.stringify(payload), "s3cret");
    expect(decodeJwt(token).payload).toEqual(payload);
  });

  it("rejects an unsupported algorithm", async () => {
    await expect(signJwt('{"alg":"RS256"}', "{}", "secret")).rejects.toThrow(/unsupported/i);
  });

  it("rejects an empty secret", async () => {
    await expect(signJwt('{"alg":"HS256"}', "{}", "")).rejects.toThrow(/secret/i);
  });

  it("rejects invalid or non-object JSON", async () => {
    await expect(signJwt("{oops}", "{}", "secret")).rejects.toThrow(/header is not valid JSON/i);
    await expect(signJwt('{"alg":"HS256"}', "[]", "secret")).rejects.toThrow(
      /payload must be a JSON object/i
    );
  });
});

describe("setPayloadClaim", () => {
  it("adds a claim", () => {
    expect(JSON.parse(setPayloadClaim('{"sub":"a"}', "iat", 1516239022))).toEqual({
      sub: "a",
      iat: 1516239022,
    });
  });

  it("overwrites an existing claim", () => {
    expect(JSON.parse(setPayloadClaim('{"exp":1}', "exp", 2))).toEqual({ exp: 2 });
  });

  it("removes a claim when the value is undefined", () => {
    expect(JSON.parse(setPayloadClaim('{"sub":"a","exp":1}', "exp", undefined))).toEqual({
      sub: "a",
    });
  });

  it("throws for an invalid payload", () => {
    expect(() => setPayloadClaim("nope", "exp", 1)).toThrow(/payload/i);
  });
});

describe("setHeaderAlgorithm / readHeaderAlgorithm", () => {
  it("swaps alg while keeping other header claims", () => {
    expect(JSON.parse(setHeaderAlgorithm('{"alg":"HS256","kid":"k1"}', "HS512"))).toEqual({
      alg: "HS512",
      kid: "k1",
    });
  });

  it("reads a supported algorithm back", () => {
    expect(readHeaderAlgorithm('{"alg":"HS384"}')).toBe("HS384");
  });

  it("returns null for unsupported or unreadable headers", () => {
    expect(readHeaderAlgorithm('{"alg":"RS256"}')).toBeNull();
    expect(readHeaderAlgorithm("{broken")).toBeNull();
  });
});
