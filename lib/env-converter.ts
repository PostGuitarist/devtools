import { dump, load } from "js-yaml";

export type EnvFormat = "env" | "json" | "yaml";

export const ENV_FORMATS: { id: EnvFormat; name: string; extension: string }[] = [
  { id: "env", name: ".env", extension: "env" },
  { id: "json", name: "JSON", extension: "json" },
  { id: "yaml", name: "YAML", extension: "yaml" },
];

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_.]*$/;

function unescapeDoubleQuoted(value: string): string {
  return value.replace(/\\([nrtbf\\"'$])/g, (_match, char: string) => {
    switch (char) {
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "b":
        return "\b";
      case "f":
        return "\f";
      default:
        return char;
    }
  });
}

/**
 * Parses dotenv syntax: `export` prefixes, `#` comments, single/double/backtick
 * quoting (including values spanning multiple lines), and inline comments after
 * unquoted values.
 */
export function parseEnv(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const match = /^(?:export\s+)?([^=\s]+)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) {
      throw new Error(`Line ${i + 1}: expected KEY=value, got "${trimmed}".`);
    }

    const [, key, rawValue] = match;
    if (!KEY_PATTERN.test(key)) {
      throw new Error(`Line ${i + 1}: "${key}" is not a valid variable name.`);
    }

    const quote = rawValue[0];
    if (quote === '"' || quote === "'" || quote === "`") {
      let body = rawValue.slice(1);
      let closed = false;

      // A quoted value may run across several physical lines.
      for (;;) {
        const end = findClosingQuote(body, quote);
        if (end !== -1) {
          body = body.slice(0, end);
          closed = true;
          break;
        }
        i += 1;
        if (i >= lines.length) break;
        body += `\n${lines[i]}`;
      }

      if (!closed) {
        throw new Error(`Line ${i + 1}: unterminated ${quote} quoted value for "${key}".`);
      }
      result[key] = quote === '"' ? unescapeDoubleQuoted(body) : body;
      continue;
    }

    const withoutComment = rawValue.replace(/\s+#.*$/, "");
    result[key] = withoutComment.trim();
  }

  return result;
}

function findClosingQuote(body: string, quote: string): number {
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] === "\\" && quote === '"') {
      i += 1;
      continue;
    }
    if (body[i] === quote) return i;
  }
  return -1;
}

function needsQuoting(value: string): boolean {
  return value === "" || /[\s#"'`$\\]/.test(value);
}

export function stringifyEnv(record: Record<string, string>): string {
  const lines = Object.entries(record).map(([key, value]) => {
    if (!needsQuoting(value)) return `${key}=${value}`;
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
    return `${key}="${escaped}"`;
  });
  return lines.join("\n");
}

/** Flattens parsed JSON/YAML into the flat string map that .env can represent. */
function toStringRecord(value: unknown, format: EnvFormat): Record<string, string> {
  if (value === null || value === undefined) return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${format === "json" ? "JSON" : "YAML"} input must be an object of key/value pairs.`);
  }

  const record: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (raw === null || raw === undefined) {
      record[key] = "";
    } else if (typeof raw === "object") {
      record[key] = JSON.stringify(raw);
    } else {
      record[key] = String(raw);
    }
  }
  return record;
}

export function parseEnvSource(text: string, format: EnvFormat): Record<string, string> {
  if (format === "env") return parseEnv(text);

  if (text.trim() === "") return {};

  if (format === "json") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Invalid JSON");
    }
    return toStringRecord(parsed, "json");
  }

  let parsed: unknown;
  try {
    parsed = load(text);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Invalid YAML");
  }
  return toStringRecord(parsed, "yaml");
}

export function formatEnvTarget(record: Record<string, string>, format: EnvFormat): string {
  if (format === "env") return stringifyEnv(record);
  if (format === "json") return JSON.stringify(record, null, 2);
  if (Object.keys(record).length === 0) return "";
  return dump(record, { indent: 2, lineWidth: -1 });
}

export function convertEnv(text: string, from: EnvFormat, to: EnvFormat): string {
  return formatEnvTarget(parseEnvSource(text, from), to);
}
