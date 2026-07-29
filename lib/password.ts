export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = /[0O1lI|]/g;

export function buildCharset(options: PasswordOptions): string {
  let charset = "";
  if (options.uppercase) charset += UPPERCASE;
  if (options.lowercase) charset += LOWERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;
  if (options.excludeAmbiguous) charset = charset.replace(AMBIGUOUS, "");
  return charset;
}

/** Returns a uniformly random index in [0, max) using rejection sampling to avoid modulo bias. */
function randomIndex(max: number): number {
  const range = 256 - (256 % max);
  const bytes = new Uint8Array(1);
  let value: number;
  do {
    crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= range);
  return value % max;
}

export function generatePassword(options: PasswordOptions): string {
  const charset = buildCharset(options);
  if (charset.length === 0) return "";
  return Array.from({ length: options.length }, () => charset[randomIndex(charset.length)]).join("");
}

export type PasswordStrength = "weak" | "fair" | "strong" | "very-strong";

export function estimateStrength(
  length: number,
  charsetSize: number
): PasswordStrength {
  if (charsetSize === 0 || length === 0) return "weak";
  const entropyBits = length * Math.log2(charsetSize);
  if (entropyBits < 28) return "weak";
  if (entropyBits < 45) return "fair";
  if (entropyBits < 65) return "strong";
  return "very-strong";
}
