export type CaseStyle =
  | "camelCase"
  | "PascalCase"
  | "snake_case"
  | "CONSTANT_CASE"
  | "kebab-case"
  | "Title Case"
  | "Sentence case"
  | "UPPER CASE"
  | "lower case";

export const CASE_STYLES: CaseStyle[] = [
  "camelCase",
  "PascalCase",
  "snake_case",
  "CONSTANT_CASE",
  "kebab-case",
  "Title Case",
  "Sentence case",
  "UPPER CASE",
  "lower case",
];

export function tokenize(input: string): string[] {
  const spaced = input
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  return spaced
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function convertCase(input: string, style: CaseStyle): string {
  const words = tokenize(input);
  if (words.length === 0) return "";

  switch (style) {
    case "camelCase":
      return words.map((word, i) => (i === 0 ? word : capitalize(word))).join("");
    case "PascalCase":
      return words.map(capitalize).join("");
    case "snake_case":
      return words.join("_");
    case "CONSTANT_CASE":
      return words.join("_").toUpperCase();
    case "kebab-case":
      return words.join("-");
    case "Title Case":
      return words.map(capitalize).join(" ");
    case "Sentence case":
      return capitalize(words.join(" "));
    case "UPPER CASE":
      return words.join(" ").toUpperCase();
    case "lower case":
      return words.join(" ");
  }
}
