import { parseCsvRows } from "@/lib/csv-to-json";

export type ColumnAlignment = "none" | "left" | "center" | "right";

export const COLUMN_ALIGNMENTS: ColumnAlignment[] = ["none", "left", "center", "right"];

export interface MarkdownTable {
  headers: string[];
  rows: string[][];
  alignments: ColumnAlignment[];
}

export interface BuildMarkdownTableOptions {
  /** Pad cells so the raw Markdown source lines up in a monospace editor. */
  pretty?: boolean;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>").trim();
}

function alignmentRule(alignment: ColumnAlignment, width: number): string {
  const dashes = Math.max(width, 3);
  switch (alignment) {
    case "left":
      return `:${"-".repeat(dashes - 1)}`;
    case "right":
      return `${"-".repeat(dashes - 1)}:`;
    case "center":
      return `:${"-".repeat(dashes - 2)}:`;
    default:
      return "-".repeat(dashes);
  }
}

function padCell(value: string, width: number, alignment: ColumnAlignment): string {
  const gap = Math.max(width - value.length, 0);
  if (alignment === "right") return " ".repeat(gap) + value;
  if (alignment === "center") {
    const left = Math.floor(gap / 2);
    return " ".repeat(left) + value + " ".repeat(gap - left);
  }
  return value + " ".repeat(gap);
}

export function buildMarkdownTable(
  table: MarkdownTable,
  options: BuildMarkdownTableOptions = {}
): string {
  const { pretty = true } = options;
  const columnCount = table.headers.length;
  if (columnCount === 0) return "";

  const headers = table.headers.map(escapeCell);
  const rows = table.rows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => escapeCell(row[index] ?? ""))
  );
  const alignments = Array.from(
    { length: columnCount },
    (_, index) => table.alignments[index] ?? "none"
  );

  const widths = headers.map((header, index) =>
    pretty
      ? Math.max(3, header.length, ...rows.map((row) => row[index].length))
      : 0
  );

  const line = (cells: string[]) => `| ${cells.join(" | ")} |`;

  const headerLine = line(
    headers.map((header, index) => padCell(header, widths[index], alignments[index]))
  );
  const ruleLine = line(
    alignments.map((alignment, index) => alignmentRule(alignment, widths[index]))
  );
  const bodyLines = rows.map((row) =>
    line(row.map((value, index) => padCell(value, widths[index], alignments[index])))
  );

  return [headerLine, ruleLine, ...bodyLines].join("\n");
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";
  for (let i = 0; i < trimmed.length; i += 1) {
    if (trimmed[i] === "\\" && trimmed[i + 1] === "|") {
      cell += "|";
      i += 1;
    } else if (trimmed[i] === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += trimmed[i];
    }
  }
  cells.push(cell.trim());
  return cells;
}

function parseAlignment(rule: string): ColumnAlignment {
  const value = rule.trim();
  const left = value.startsWith(":");
  const right = value.endsWith(":");
  if (left && right) return "center";
  if (left) return "left";
  if (right) return "right";
  return "none";
}

/** Reads a Markdown table back into editable data. Throws when it isn't one. */
export function parseMarkdownTable(text: string): MarkdownTable {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");

  if (lines.length < 2 || !/^\|?\s*:?-{1,}/.test(lines[1])) {
    throw new Error("Expected a Markdown table with a header row and a --- separator row.");
  }

  const headers = splitMarkdownRow(lines[0]);
  const alignments = splitMarkdownRow(lines[1]).map(parseAlignment);
  const rows = lines.slice(2).map(splitMarkdownRow);

  return { headers, alignments, rows };
}

/** Turns pasted CSV/TSV into table data, using the first row as headers. */
export function parseDelimitedText(text: string, delimiter: string): MarkdownTable {
  const rows = parseCsvRows(text, delimiter);
  if (rows.length === 0) return { headers: [], rows: [], alignments: [] };

  const headers = rows[0];
  return {
    headers,
    rows: rows.slice(1),
    alignments: headers.map(() => "none" as ColumnAlignment),
  };
}

export function createEmptyTable(columns: number, rows: number): MarkdownTable {
  return {
    headers: Array.from({ length: columns }, (_, index) => `Column ${index + 1}`),
    rows: Array.from({ length: rows }, () => Array.from({ length: columns }, () => "")),
    alignments: Array.from({ length: columns }, () => "none" as ColumnAlignment),
  };
}
