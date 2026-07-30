import SparkMD5 from "spark-md5";

export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

export const HASH_ALGORITHMS: HashAlgorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * SubtleCrypto doesn't support MD5, so it's computed with spark-md5 instead;
 * the other algorithms use the native Web Crypto implementation.
 */
export async function hashArrayBuffer(
  buffer: ArrayBuffer,
  algorithm: HashAlgorithm
): Promise<string> {
  if (algorithm === "MD5") {
    return SparkMD5.ArrayBuffer.hash(buffer);
  }
  const digest = await crypto.subtle.digest(algorithm, buffer);
  return bufferToHex(digest);
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  return hashArrayBuffer(bytes.buffer as ArrayBuffer, algorithm);
}

export async function hashAllAlgorithms(
  input: ArrayBuffer | string
): Promise<Record<HashAlgorithm, string>> {
  const buffer = typeof input === "string" ? new TextEncoder().encode(input).buffer : input;
  const entries = await Promise.all(
    HASH_ALGORITHMS.map(
      async (algorithm) => [algorithm, await hashArrayBuffer(buffer as ArrayBuffer, algorithm)] as const
    )
  );
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>;
}
