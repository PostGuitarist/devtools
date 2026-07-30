export interface RegexMatch {
  match: string;
  index: number;
  groups: {
    numbered: string[];
    named: Record<string, string>;
  };
}

export interface RegexTestResult {
  matches: RegexMatch[];
  error: string | null;
}

/**
 * Runs the pattern against the text, always enumerating every occurrence
 * (regardless of whether the user's own flags include "g") since the
 * highlighter and match list both want to show all hits, not just the first.
 */
export function getMatches(pattern: string, flags: string, text: string): RegexTestResult {
  if (pattern === "") return { matches: [], error: null };

  let regex: RegExp;
  try {
    const enumerationFlags = flags.includes("g") ? flags : flags + "g";
    regex = new RegExp(pattern, enumerationFlags);
  } catch (err) {
    return {
      matches: [],
      error: err instanceof Error ? err.message : "Invalid regular expression.",
    };
  }

  const matches: RegexMatch[] = [];
  let result: RegExpExecArray | null;
  let guard = 0;
  while ((result = regex.exec(text)) !== null && guard < 10000) {
    matches.push({
      match: result[0],
      index: result.index,
      groups: {
        numbered: result.slice(1),
        named: result.groups ? { ...result.groups } : {},
      },
    });
    // A zero-length match wouldn't otherwise advance lastIndex, causing an infinite loop.
    if (result[0].length === 0) regex.lastIndex += 1;
    guard += 1;
  }

  return { matches, error: null };
}

export interface HighlightSegment {
  text: string;
  matched: boolean;
}

export function buildHighlightSegments(
  text: string,
  matches: RegexMatch[]
): HighlightSegment[] {
  if (matches.length === 0) return [{ text, matched: false }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.index > cursor) {
      segments.push({ text: text.slice(cursor, match.index), matched: false });
    }
    if (match.match.length > 0) {
      segments.push({ text: match.match, matched: true });
      cursor = match.index + match.match.length;
    } else {
      cursor = Math.max(cursor, match.index);
    }
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), matched: false });
  }
  return segments;
}
