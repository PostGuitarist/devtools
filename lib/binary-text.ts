export type ByteEncoding = "binary" | "octal" | "decimal" | "hexadecimal";

export const BYTE_ENCODINGS: { value: ByteEncoding; label: string; base: number }[] = [
  { value: "binary", label: "Binary", base: 2 },
  { value: "octal", label: "Octal", base: 8 },
  { value: "decimal", label: "Decimal", base: 10 },
  { value: "hexadecimal", label: "Hexadecimal", base: 16 },
];

function baseFor(encoding: ByteEncoding): number {
  const entry = BYTE_ENCODINGS.find((e) => e.value === encoding);
  if (!entry) throw new Error(`Unknown encoding: ${encoding}`);
  return entry.base;
}

const TOKEN_PATTERNS: Record<ByteEncoding, RegExp> = {
  binary: /^[01]+$/,
  octal: /^[0-7]+$/,
  decimal: /^[0-9]+$/,
  hexadecimal: /^[0-9a-fA-F]+$/,
};

function pad(digits: string, encoding: ByteEncoding): string {
  if (encoding === "binary") return digits.padStart(8, "0");
  if (encoding === "octal") return digits.padStart(3, "0");
  if (encoding === "hexadecimal") return digits.padStart(2, "0");
  return digits;
}

export function formatByte(byte: number, encoding: ByteEncoding): string {
  return pad(byte.toString(baseFor(encoding)), encoding);
}

export function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function textToEncoded(text: string, encoding: ByteEncoding): string {
  return Array.from(textToBytes(text))
    .map((byte) => formatByte(byte, encoding))
    .join(" ");
}

/** Parses whitespace-separated byte tokens back into text. Throws on invalid tokens or invalid UTF-8. */
export function encodedToText(input: string, encoding: ByteEncoding): string {
  const tokens = input.trim().split(/\s+/).filter((t) => t !== "");
  if (tokens.length === 0) return "";

  const base = baseFor(encoding);
  const pattern = TOKEN_PATTERNS[encoding];
  const bytes = tokens.map((token) => {
    if (!pattern.test(token)) {
      throw new Error(`"${token}" is not a valid ${encoding} byte.`);
    }
    const value = parseInt(token, base);
    if (value > 255) {
      throw new Error(`"${token}" is out of byte range (0-255).`);
    }
    return value;
  });

  return bytesToText(Uint8Array.from(bytes));
}
