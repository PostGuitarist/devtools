export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  headerB64Url: string;
  payloadB64Url: string;
  signatureB64Url: string;
}

export function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error(
      "A JWT must have three dot-separated parts (header.payload.signature)."
    );
  }
  const [headerB64Url, payloadB64Url, signatureB64Url] = parts;

  let header: unknown;
  try {
    header = JSON.parse(base64UrlDecode(headerB64Url));
  } catch {
    throw new Error("Could not decode the JWT header.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64Url));
  } catch {
    throw new Error("Could not decode the JWT payload.");
  }

  return { header, payload, headerB64Url, payloadB64Url, signatureB64Url };
}

interface EpochClaim {
  value: number;
  date: Date;
}

export interface ClaimStatus {
  iat: EpochClaim | null;
  exp: (EpochClaim & { expired: boolean }) | null;
  nbf: (EpochClaim & { notYetValid: boolean }) | null;
}

export function getClaimStatus(payload: unknown, now = Date.now()): ClaimStatus {
  const obj =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

  function claim(key: string): EpochClaim | null {
    const raw = obj[key];
    return typeof raw === "number" ? { value: raw, date: new Date(raw * 1000) } : null;
  }

  const iat = claim("iat");
  const exp = claim("exp");
  const nbf = claim("nbf");

  return {
    iat,
    exp: exp ? { ...exp, expired: exp.value * 1000 < now } : null,
    nbf: nbf ? { ...nbf, notYetValid: nbf.value * 1000 > now } : null,
  };
}

const HMAC_ALGORITHMS: Record<string, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

export const HMAC_ALGORITHM_NAMES = ["HS256", "HS384", "HS512"] as const;

export type HmacAlgorithm = (typeof HMAC_ALGORITHM_NAMES)[number];

function parseJsonObject(text: string, label: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(`The ${label} is not valid JSON.`);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`The ${label} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

function base64UrlEncodeText(text: string): string {
  return base64UrlEncode(new TextEncoder().encode(text));
}

/**
 * Signs a token with an HMAC secret. The header and payload are re-serialized
 * compactly, so whitespace in the editors never changes the resulting token.
 */
export async function signJwt(
  headerText: string,
  payloadText: string,
  secret: string
): Promise<string> {
  const header = parseJsonObject(headerText, "header");
  const payload = parseJsonObject(payloadText, "payload");

  const alg = typeof header.alg === "string" ? header.alg : "";
  const hash = HMAC_ALGORITHMS[alg];
  if (!hash) {
    throw new Error(
      `Unsupported "alg": ${alg || "(missing)"}. This tool signs HS256, HS384, and HS512 tokens.`
    );
  }
  if (secret === "") {
    throw new Error("A signing secret is required.");
  }

  const signingInput = `${base64UrlEncodeText(JSON.stringify(header))}.${base64UrlEncodeText(
    JSON.stringify(payload)
  )}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Sets (or removes, when value is undefined) a claim in a JSON payload string. */
export function setPayloadClaim(
  payloadText: string,
  key: string,
  value: unknown
): string {
  const payload = parseJsonObject(payloadText, "payload");
  if (value === undefined) {
    delete payload[key];
  } else {
    payload[key] = value;
  }
  return JSON.stringify(payload, null, 2);
}

/** Rewrites a header's "alg" while leaving any other header claims intact. */
export function setHeaderAlgorithm(headerText: string, algorithm: HmacAlgorithm): string {
  const header = parseJsonObject(headerText, "header");
  return JSON.stringify({ ...header, alg: algorithm }, null, 2);
}

export function readHeaderAlgorithm(headerText: string): HmacAlgorithm | null {
  try {
    const header = parseJsonObject(headerText, "header");
    const alg = header.alg;
    return HMAC_ALGORITHM_NAMES.includes(alg as HmacAlgorithm) ? (alg as HmacAlgorithm) : null;
  } catch {
    return null;
  }
}

export type HmacVerifyResult = "valid" | "invalid" | "unsupported-algorithm" | "malformed";

/**
 * Verifies HMAC-signed tokens (HS256/384/512) only. RS/ES/PS algorithms need
 * asymmetric public-key import, which is out of scope for a decode-first tool.
 */
export async function verifyHmacSignature(
  token: string,
  secret: string
): Promise<HmacVerifyResult> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return "malformed";
  const [headerB64Url, payloadB64Url, signatureB64Url] = parts;

  let header: { alg?: string };
  try {
    header = JSON.parse(base64UrlDecode(headerB64Url));
  } catch {
    return "malformed";
  }

  const hash = header.alg ? HMAC_ALGORITHMS[header.alg] : undefined;
  if (!hash) return "unsupported-algorithm";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"]
  );

  const signingInput = new TextEncoder().encode(`${headerB64Url}.${payloadB64Url}`);
  const signature = await crypto.subtle.sign("HMAC", key, signingInput);
  const expectedB64Url = base64UrlEncode(new Uint8Array(signature));

  return expectedB64Url === signatureB64Url ? "valid" : "invalid";
}
