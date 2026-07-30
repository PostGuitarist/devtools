export type JsonDiffChangeType = "added" | "removed" | "changed";

export interface JsonDiffEntry {
  path: string;
  type: JsonDiffChangeType;
  oldValue?: unknown;
  newValue?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => key in b && deepEqual(a[key], b[key]));
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => deepEqual(value, b[index]));
  }
  return false;
}

function diffValue(path: string, oldValue: unknown, newValue: unknown, out: JsonDiffEntry[]): void {
  if (deepEqual(oldValue, newValue)) return;

  if (isPlainObject(oldValue) && isPlainObject(newValue)) {
    const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in oldValue)) {
        out.push({ path: childPath, type: "added", newValue: newValue[key] });
      } else if (!(key in newValue)) {
        out.push({ path: childPath, type: "removed", oldValue: oldValue[key] });
      } else {
        diffValue(childPath, oldValue[key], newValue[key], out);
      }
    }
    return;
  }

  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const maxLength = Math.max(oldValue.length, newValue.length);
    for (let index = 0; index < maxLength; index++) {
      const childPath = `${path}[${index}]`;
      if (index >= oldValue.length) {
        out.push({ path: childPath, type: "added", newValue: newValue[index] });
      } else if (index >= newValue.length) {
        out.push({ path: childPath, type: "removed", oldValue: oldValue[index] });
      } else {
        diffValue(childPath, oldValue[index], newValue[index], out);
      }
    }
    return;
  }

  out.push({ path: path || "(root)", type: "changed", oldValue, newValue });
}

/**
 * Structural diff between two JSON documents: reports added/removed/changed
 * key-paths rather than a line-by-line text diff (see lib/text-diff.ts for that).
 */
export function computeJsonDiff(oldJsonText: string, newJsonText: string): JsonDiffEntry[] {
  let oldData: unknown;
  let newData: unknown;

  try {
    oldData = JSON.parse(oldJsonText);
  } catch (err) {
    throw new Error(`Invalid JSON (original): ${err instanceof Error ? err.message : "parse error"}`);
  }
  try {
    newData = JSON.parse(newJsonText);
  } catch (err) {
    throw new Error(`Invalid JSON (changed): ${err instanceof Error ? err.message : "parse error"}`);
  }

  const entries: JsonDiffEntry[] = [];
  diffValue("", oldData, newData, entries);
  return entries;
}

export function formatJsonDiffValue(value: unknown): string {
  return value === undefined ? "undefined" : JSON.stringify(value);
}

export function formatJsonDiffAsText(entries: JsonDiffEntry[]): string {
  return entries
    .map((entry) => {
      switch (entry.type) {
        case "added":
          return `+ ${entry.path}: ${formatJsonDiffValue(entry.newValue)}`;
        case "removed":
          return `- ${entry.path}: ${formatJsonDiffValue(entry.oldValue)}`;
        case "changed":
          return `~ ${entry.path}: ${formatJsonDiffValue(entry.oldValue)} -> ${formatJsonDiffValue(entry.newValue)}`;
      }
    })
    .join("\n");
}
