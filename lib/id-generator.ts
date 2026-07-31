import { customAlphabet, nanoid, urlAlphabet } from "nanoid";
import { decodeTime, isValid, monotonicFactory, ulid, ulidToUUID } from "ulid";

export type IdKind = "nanoid" | "ulid";

export const NANOID_ALPHABETS: { id: string; name: string; value: string }[] = [
  { id: "url", name: "URL-safe (default)", value: urlAlphabet },
  {
    id: "alphanumeric",
    name: "Alphanumeric",
    value: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  },
  { id: "lowercase", name: "Lowercase + digits", value: "0123456789abcdefghijklmnopqrstuvwxyz" },
  { id: "hex", name: "Hexadecimal", value: "0123456789abcdef" },
  { id: "numbers", name: "Digits only", value: "0123456789" },
];

export const NANOID_MIN_SIZE = 2;
export const NANOID_MAX_SIZE = 64;
export const MAX_QUANTITY = 500;

export interface GenerateIdsOptions {
  kind: IdKind;
  quantity: number;
  /** nanoid only — number of characters. */
  size?: number;
  /** nanoid only — characters to draw from. */
  alphabet?: string;
  /** ULID only — guarantee lexicographic ordering within the same millisecond. */
  monotonic?: boolean;
  /** ULID only — render in lowercase. */
  lowercase?: boolean;
}

export function generateIds(options: GenerateIdsOptions): string[] {
  const quantity = Math.min(Math.max(Math.trunc(options.quantity), 0), MAX_QUANTITY);
  if (quantity === 0) return [];

  if (options.kind === "ulid") {
    // The monotonic factory keeps ids ordered even when several land in the
    // same millisecond, so the batch stays sortable without pinning a seed time.
    const next = options.monotonic ? monotonicFactory() : ulid;
    return Array.from({ length: quantity }, () => {
      const id = next();
      return options.lowercase ? id.toLowerCase() : id;
    });
  }

  const size = Math.min(Math.max(Math.trunc(options.size ?? 21), NANOID_MIN_SIZE), NANOID_MAX_SIZE);
  const alphabet = options.alphabet?.trim();

  if (!alphabet || alphabet === urlAlphabet) {
    return Array.from({ length: quantity }, () => nanoid(size));
  }

  const generate = customAlphabet(Array.from(new Set(alphabet)).join(""), size);
  return Array.from({ length: quantity }, () => generate());
}

export interface UlidDetails {
  timestamp: Date;
  timestampPart: string;
  randomPart: string;
  uuid: string;
}

/** Splits a ULID into its 48-bit timestamp and 80-bit randomness halves. */
export function inspectUlid(id: string): UlidDetails | null {
  const normalized = id.trim().toUpperCase();
  if (!isValid(normalized)) return null;

  try {
    return {
      timestamp: new Date(decodeTime(normalized)),
      timestampPart: normalized.slice(0, 10),
      randomPart: normalized.slice(10),
      uuid: ulidToUUID(normalized).toLowerCase(),
    };
  } catch {
    return null;
  }
}

/**
 * Bits of entropy per identifier — the practical way to compare a short nanoid
 * against a ULID's 80 random bits.
 */
export function entropyBits(options: Pick<GenerateIdsOptions, "kind" | "size" | "alphabet">): number {
  if (options.kind === "ulid") return 80;
  const alphabetSize = new Set(options.alphabet?.trim() || urlAlphabet).size;
  const size = options.size ?? 21;
  if (alphabetSize < 2) return 0;
  return Math.round(size * Math.log2(alphabetSize));
}
