export interface CssSizeStats {
  originalBytes: number;
  resultBytes: number;
  savedBytes: number;
  savedPercent: number;
}

const PLACEHOLDER_START = "\x01";
const PLACEHOLDER_END = "\x02";
const PLACEHOLDER_RE = /\x01(\d+)\x02/g;

// \x01/\x02 can't appear in valid CSS source, so they make placeholder
// delimiters that survive the minifier's whitespace/punctuation-collapsing
// passes untouched (a plain-space delimiter would get eaten by them).
function extractStrings(css: string): { masked: string; strings: string[] } {
  const strings: string[] = [];
  const masked = css.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, (match) => {
    strings.push(match);
    return `${PLACEHOLDER_START}${strings.length - 1}${PLACEHOLDER_END}`;
  });
  return { masked, strings };
}

function restoreStrings(css: string, strings: string[]): string {
  return css.replace(PLACEHOLDER_RE, (_, index: string) => strings[Number(index)]);
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function minifyCss(css: string): string {
  const { masked, strings } = extractStrings(css);
  const stripped = stripComments(masked);
  const collapsed = stripped
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
  return restoreStrings(collapsed, strings);
}

/** Reformats CSS with 2-space indentation, one declaration per line. Comments and string literals pass through untouched. */
export function beautifyCss(css: string): string {
  let result = "";
  let indent = 0;
  let buffer = "";
  let i = 0;
  const length = css.length;

  function flush(terminator: "{" | ";") {
    const trimmed = buffer.replace(/\s+/g, " ").trim();
    buffer = "";
    if (trimmed === "") return;
    const pad = "  ".repeat(indent);
    if (terminator === "{") {
      result += `${pad}${trimmed} {\n`;
    } else {
      // Only the first colon is the property/value separator — later ones
      // (e.g. inside `url(http://...)`) must be left alone.
      const spaced = trimmed.replace(/:\s*/, ": ");
      result += `${pad}${spaced};\n`;
    }
  }

  while (i < length) {
    const char = css[i];

    if (char === '"' || char === "'") {
      const quote = char;
      let j = i + 1;
      while (j < length && css[j] !== quote) {
        if (css[j] === "\\") j += 1;
        j += 1;
      }
      buffer += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    if (char === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? length : end + 2;
      result += `${"  ".repeat(indent)}${css.slice(i, commentEnd)}\n`;
      i = commentEnd;
      continue;
    }

    if (char === "{") {
      flush("{");
      indent += 1;
      i += 1;
      continue;
    }

    if (char === "}") {
      flush(";");
      indent = Math.max(0, indent - 1);
      result += `${"  ".repeat(indent)}}\n`;
      i += 1;
      continue;
    }

    if (char === ";") {
      flush(";");
      i += 1;
      continue;
    }

    buffer += char;
    i += 1;
  }

  flush(";");

  return `${result.trim()}\n`;
}

export function computeCssSizeStats(original: string, result: string): CssSizeStats {
  const originalBytes = new TextEncoder().encode(original).length;
  const resultBytes = new TextEncoder().encode(result).length;
  const savedBytes = Math.max(0, originalBytes - resultBytes);
  const savedPercent = originalBytes === 0 ? 0 : (savedBytes / originalBytes) * 100;
  return { originalBytes, resultBytes, savedBytes, savedPercent };
}
