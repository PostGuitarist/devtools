const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum", "at",
  "vero", "eos", "accusamus", "iusto", "odio", "dignissimos", "ducimus",
  "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWord(): string {
  return WORDS[randomInt(0, WORDS.length - 1)];
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function generateWords(count: number): string {
  return Array.from({ length: count }, pickWord).join(" ");
}

function generateSentence(): string {
  const wordCount = randomInt(6, 16);
  const words = Array.from({ length: wordCount }, pickWord);
  return capitalize(words.join(" ")) + ".";
}

export function generateSentences(count: number): string {
  return Array.from({ length: count }, generateSentence).join(" ");
}

const CLASSIC_OPENING =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export function generateParagraphs(
  count: number,
  startWithClassic = true
): string[] {
  return Array.from({ length: count }, (_, index) => {
    const sentenceCount = randomInt(4, 8);
    const sentences = Array.from({ length: sentenceCount }, generateSentence);
    if (index === 0 && startWithClassic) {
      sentences[0] = CLASSIC_OPENING;
    }
    return sentences.join(" ");
  });
}
