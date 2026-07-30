export interface CurlHeader {
  key: string;
  value: string;
}

export interface CurlRequest {
  method: string;
  url: string;
  headers: CurlHeader[];
  body: string;
}

const DEFAULT_METHOD = "GET";

function escapeSingleQuoted(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function buildCurlCommand(request: CurlRequest): string {
  const parts = ["curl"];

  if (request.method && request.method.toUpperCase() !== DEFAULT_METHOD) {
    parts.push("-X", request.method.toUpperCase());
  }

  for (const header of request.headers) {
    if (header.key.trim() === "") continue;
    parts.push("-H", escapeSingleQuoted(`${header.key}: ${header.value}`));
  }

  if (request.body.trim() !== "") {
    parts.push("-d", escapeSingleQuoted(request.body));
  }

  parts.push(escapeSingleQuoted(request.url));

  return parts.join(" ");
}

function tokenize(command: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (quote) {
      if (char === quote) {
        quote = null;
      } else if (char === "\\" && quote === '"' && i + 1 < command.length) {
        current += command[++i];
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current !== "") {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    if (char === "\\" && i + 1 < command.length) {
      current += command[++i];
      continue;
    }

    current += char;
  }

  if (current !== "") tokens.push(current);
  return tokens;
}

const METHOD_FLAGS = new Set(["-X", "--request"]);
const HEADER_FLAGS = new Set(["-H", "--header"]);
const DATA_FLAGS = new Set(["-d", "--data", "--data-raw", "--data-binary", "--data-ascii"]);

/**
 * Parses a subset of curl's flags (method, headers, data, URL) well enough
 * for round-tripping commands built by buildCurlCommand. Unrecognized flags
 * are skipped without consuming a following value, since guessing whether a
 * given flag takes an argument would risk swallowing the URL.
 */
export function parseCurlCommand(command: string): CurlRequest {
  const tokens = tokenize(command.trim());
  if (tokens.length === 0) {
    throw new Error("Empty command.");
  }
  if (tokens[0] !== "curl") {
    throw new Error('Command must start with "curl".');
  }

  let method: string | null = null;
  let url: string | null = null;
  const headers: CurlHeader[] = [];
  let body = "";

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    if (METHOD_FLAGS.has(token)) {
      method = tokens[++i] ?? null;
      continue;
    }
    if (HEADER_FLAGS.has(token)) {
      const raw = tokens[++i] ?? "";
      const separatorIndex = raw.indexOf(":");
      headers.push(
        separatorIndex === -1
          ? { key: raw.trim(), value: "" }
          : { key: raw.slice(0, separatorIndex).trim(), value: raw.slice(separatorIndex + 1).trim() }
      );
      continue;
    }
    if (DATA_FLAGS.has(token)) {
      body = tokens[++i] ?? "";
      if (!method) method = "POST";
      continue;
    }
    if (token.startsWith("-")) {
      continue;
    }
    if (!url) {
      url = token;
    }
  }

  if (!url) {
    throw new Error("No URL found in command.");
  }

  return { method: method ?? DEFAULT_METHOD, url, headers, body };
}
