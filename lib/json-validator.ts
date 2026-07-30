export interface JsonValidationError {
  message: string;
  line: number;
  column: number;
  position: number;
}

export interface JsonStructureStats {
  maxDepth: number;
  objectCount: number;
  arrayCount: number;
  keyCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
}

export type JsonValidationResult =
  | { valid: true; stats: JsonStructureStats }
  | { valid: false; error: JsonValidationError };

export function validateJson(text: string): JsonValidationResult {
  try {
    const value = JSON.parse(text);
    return { valid: true, stats: computeStructureStats(value) };
  } catch (err) {
    return { valid: false, error: toValidationError(err, text) };
  }
}

function toValidationError(err: unknown, text: string): JsonValidationError {
  const message = err instanceof Error ? err.message : "Invalid JSON";

  // Modern V8 already includes "at position N (line L column C)" in the
  // message; other engines only give a position, and some ("Unexpected end
  // of JSON input") give neither, in which case we point at the end of input.
  const lineColumnMatch = message.match(/line (\d+) column (\d+)/);
  const positionMatch = message.match(/position (\d+)/);
  const position = positionMatch ? Number(positionMatch[1]) : text.length;

  if (lineColumnMatch) {
    return {
      message,
      position,
      line: Number(lineColumnMatch[1]),
      column: Number(lineColumnMatch[2]),
    };
  }

  return { message, position, ...positionToLineColumn(text, position) };
}

function positionToLineColumn(text: string, position: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(position, text.length));
  const before = text.slice(0, clamped).split("\n");
  return { line: before.length, column: before[before.length - 1].length + 1 };
}

function computeStructureStats(value: unknown): JsonStructureStats {
  const stats: JsonStructureStats = {
    maxDepth: 0,
    objectCount: 0,
    arrayCount: 0,
    keyCount: 0,
    stringCount: 0,
    numberCount: 0,
    booleanCount: 0,
    nullCount: 0,
  };

  function walk(node: unknown, depth: number) {
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (node === null) {
      stats.nullCount += 1;
    } else if (Array.isArray(node)) {
      stats.arrayCount += 1;
      for (const item of node) walk(item, depth + 1);
    } else if (typeof node === "object") {
      stats.objectCount += 1;
      const keys = Object.keys(node);
      stats.keyCount += keys.length;
      for (const key of keys) walk((node as Record<string, unknown>)[key], depth + 1);
    } else if (typeof node === "string") {
      stats.stringCount += 1;
    } else if (typeof node === "number") {
      stats.numberCount += 1;
    } else if (typeof node === "boolean") {
      stats.booleanCount += 1;
    }
  }

  walk(value, 1);
  return stats;
}
