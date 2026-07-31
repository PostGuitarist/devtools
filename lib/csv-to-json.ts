export interface CsvToJsonOptions {
  delimiter?: string;
  /** Treat the first row as column names. When false, rows become arrays. */
  header?: boolean;
  /** Convert numeric, boolean, and null-looking cells to real JSON values. */
  inferTypes?: boolean;
  /** Drop leading/trailing whitespace around unquoted cells. */
  trim?: boolean;
}

/**
 * RFC 4180 CSV reader: honours quoted fields, doubled quotes as escapes, and
 * newlines inside quotes. Line endings may be LF or CRLF.
 */
export function parseCsvRows(text: string, delimiter = ","): string[][] {
  if (delimiter.length !== 1) {
    throw new Error("Delimiter must be a single character.");
  }
  if (delimiter === '"' || delimiter === "\n" || delimiter === "\r") {
    throw new Error("Delimiter cannot be a quote or newline character.");
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let sawField = false;

  const endField = () => {
    row.push(field);
    field = "";
    sawField = false;
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === "" && !sawField) {
      inQuotes = true;
      sawField = true;
    } else if (char === delimiter) {
      endField();
    } else if (char === "\n") {
      endRow();
    } else if (char === "\r") {
      if (text[i + 1] === "\n") i += 1;
      endRow();
    } else {
      field += char;
      sawField = true;
    }
  }

  if (inQuotes) {
    throw new Error("Unterminated quoted field — check for a missing closing quote.");
  }
  if (field !== "" || row.length > 0) endRow();

  return rows.filter((cells) => !(cells.length === 1 && cells[0] === ""));
}

function inferValue(raw: string): unknown {
  if (raw === "") return "";
  const lower = raw.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (lower === "null") return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

/** Makes header names unique and non-empty so the JSON keys stay addressable. */
function normalizeHeaders(cells: string[]): string[] {
  const used = new Map<string, number>();
  return cells.map((cell, index) => {
    const base = cell.trim() || `column_${index + 1}`;
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return seen === 0 ? base : `${base}_${seen + 1}`;
  });
}

export function csvToJson(csvText: string, options: CsvToJsonOptions = {}): string {
  const { delimiter = ",", header = true, inferTypes = true, trim = true } = options;

  const rows = parseCsvRows(csvText, delimiter);
  if (rows.length === 0) return "[]";

  const cell = (value: string) => {
    const cleaned = trim ? value.trim() : value;
    return inferTypes ? inferValue(cleaned) : cleaned;
  };

  if (!header) {
    return JSON.stringify(
      rows.map((cells) => cells.map(cell)),
      null,
      2
    );
  }

  const headers = normalizeHeaders(rows[0]);
  const records = rows.slice(1).map((cells) => {
    const record: Record<string, unknown> = {};
    headers.forEach((name, index) => {
      record[name] = cell(cells[index] ?? "");
    });
    return record;
  });

  return JSON.stringify(records, null, 2);
}
