import { diffLines } from "diff";

export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

export function computeLineDiff(original: string, changed: string): DiffLine[] {
  const changes = diffLines(original, changed);
  const lines: DiffLine[] = [];

  for (const change of changes) {
    const type: DiffLineType = change.added
      ? "added"
      : change.removed
        ? "removed"
        : "unchanged";
    const chunkLines = change.value.split("\n");
    // A trailing newline produces one trailing empty string; drop it.
    if (chunkLines.at(-1) === "") chunkLines.pop();
    for (const text of chunkLines) {
      lines.push({ type, text });
    }
  }

  return lines;
}

export function formatDiffAsText(lines: DiffLine[]): string {
  return lines
    .map((line) => {
      const prefix = line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  ";
      return prefix + line.text;
    })
    .join("\n");
}
