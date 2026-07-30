export const DIGIT_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

export const MIN_BASE = 2;
export const MAX_BASE = 36;

export const COMMON_BASES = [
  { base: 2, label: "Binary" },
  { base: 8, label: "Octal" },
  { base: 10, label: "Decimal" },
  { base: 16, label: "Hexadecimal" },
] as const;

function stripBasePrefix(value: string): string {
  if (/^0x/i.test(value)) return value.slice(2);
  if (/^0b/i.test(value)) return value.slice(2);
  if (/^0o/i.test(value)) return value.slice(2);
  return value;
}

export function isValidForBase(digits: string, base: number): boolean {
  if (digits === "") return false;
  const validChars = DIGIT_CHARS.slice(0, base);
  return Array.from(digits.toLowerCase()).every((char) => validChars.includes(char));
}

/** Parses a (possibly negative, possibly prefixed) integer literal in the given base. */
export function parseBigIntInBase(value: string, base: number): bigint {
  if (base < MIN_BASE || base > MAX_BASE) {
    throw new Error(`Base must be between ${MIN_BASE} and ${MAX_BASE}.`);
  }

  const trimmed = value.trim();
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const digits = stripBasePrefix(unsigned).toLowerCase();

  if (!isValidForBase(digits, base)) {
    throw new Error(`"${value}" is not a valid base-${base} number.`);
  }

  const baseBig = BigInt(base);
  let result = BigInt(0);
  for (const char of digits) {
    result = result * baseBig + BigInt(DIGIT_CHARS.indexOf(char));
  }
  return negative ? -result : result;
}

export function formatBigIntInBase(value: bigint, base: number): string {
  if (base < MIN_BASE || base > MAX_BASE) {
    throw new Error(`Base must be between ${MIN_BASE} and ${MAX_BASE}.`);
  }
  if (value === BigInt(0)) return "0";

  const negative = value < BigInt(0);
  let remaining = negative ? -value : value;
  const baseBig = BigInt(base);
  let out = "";
  while (remaining > BigInt(0)) {
    out = DIGIT_CHARS[Number(remaining % baseBig)] + out;
    remaining /= baseBig;
  }
  return negative ? `-${out}` : out;
}

export function convertBase(value: string, fromBase: number, toBase: number): string {
  return formatBigIntInBase(parseBigIntInBase(value, fromBase), toBase);
}
