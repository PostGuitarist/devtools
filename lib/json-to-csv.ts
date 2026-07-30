export interface JsonToCsvOptions {
  delimiter?: string;
}

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      Object.assign(result, flatten(value, path));
    } else {
      result[path] = stringifyCell(value);
    }
  }
  return result;
}

function escapeCsvField(value: string, delimiter: string): string {
  const needsQuoting =
    value.includes(delimiter) || value.includes('"') || value.includes("\n") || value.includes("\r");
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function jsonToCsv(jsonText: string, options: JsonToCsvOptions = {}): string {
  const delimiter = options.delimiter ?? ",";

  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Invalid JSON");
  }

  if (!Array.isArray(data)) {
    throw new Error("Input must be a JSON array.");
  }
  if (data.length === 0) return "";

  const isObjectArray = data.every(isPlainObject);

  if (!isObjectArray) {
    const rows = data.map((item) => escapeCsvField(stringifyCell(item), delimiter));
    return [escapeCsvField("value", delimiter), ...rows].join("\n");
  }

  const flatRows = data.map((row) => flatten(row));
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of flatRows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const headerLine = columns.map((col) => escapeCsvField(col, delimiter)).join(delimiter);
  const bodyLines = flatRows.map((row) =>
    columns.map((col) => escapeCsvField(row[col] ?? "", delimiter)).join(delimiter)
  );
  return [headerLine, ...bodyLines].join("\n");
}
