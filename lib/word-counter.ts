export interface WordCounterStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

const READING_WORDS_PER_MINUTE = 200;
const SPEAKING_WORDS_PER_MINUTE = 130;

export function computeWordCounterStats(text: string): WordCounterStats {
  const words = countWords(text);
  const sentences = text.trim() === "" ? 0 : (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).filter((s) => s.trim() !== "").length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim() !== "").length;
  const lines = text === "" ? 0 : text.split("\n").length;

  return {
    words,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes: words / READING_WORDS_PER_MINUTE,
    speakingTimeMinutes: words / SPEAKING_WORDS_PER_MINUTE,
  };
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

export function wordFrequency(text: string, limit = 10): WordFrequency[] {
  const counts = new Map<string, number>();
  const matches = text.toLowerCase().match(/[a-z0-9'-]+/g) ?? [];
  for (const raw of matches) {
    const word = raw.replace(/^[-']+|[-']+$/g, "");
    if (word === "") continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}
