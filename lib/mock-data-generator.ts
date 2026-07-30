import { generateWords } from "@/lib/lorem-ipsum";
import { jsonToCsv } from "@/lib/json-to-csv";

export type MockFieldType =
  | "uuid"
  | "name"
  | "email"
  | "word"
  | "sentence"
  | "number"
  | "boolean"
  | "date";

export const MOCK_FIELD_TYPES: MockFieldType[] = [
  "uuid",
  "name",
  "email",
  "word",
  "sentence",
  "number",
  "boolean",
  "date",
];

export interface MockFieldSchema {
  name: string;
  type: MockFieldType;
}

const FIRST_NAMES = [
  "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "Lucas", "Mia", "Elijah", "Amelia", "James", "Harper", "Benjamin",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Lee",
];
const EMAIL_DOMAINS = ["example.com", "mail.com", "test.dev", "sample.org"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomDate(): string {
  const start = new Date(2015, 0, 1).getTime();
  const end = Date.now();
  return new Date(randomInt(start, end)).toISOString().slice(0, 10);
}

function generateFieldValue(type: MockFieldType): unknown {
  switch (type) {
    case "uuid":
      return crypto.randomUUID();
    case "name":
      return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    case "email": {
      const first = randomItem(FIRST_NAMES).toLowerCase();
      const last = randomItem(LAST_NAMES).toLowerCase();
      return `${first}.${last}@${randomItem(EMAIL_DOMAINS)}`;
    }
    case "word":
      return generateWords(1);
    case "sentence":
      return generateWords(randomInt(4, 9));
    case "number":
      return randomInt(0, 1000);
    case "boolean":
      return Math.random() < 0.5;
    case "date":
      return randomDate();
  }
}

export function generateMockData(
  schema: MockFieldSchema[],
  rowCount: number
): Record<string, unknown>[] {
  return Array.from({ length: rowCount }, () => {
    const row: Record<string, unknown> = {};
    for (const field of schema) {
      if (field.name.trim() === "") continue;
      row[field.name] = generateFieldValue(field.type);
    }
    return row;
  });
}

export function mockDataToJson(rows: Record<string, unknown>[]): string {
  return JSON.stringify(rows, null, 2);
}

export function mockDataToCsv(rows: Record<string, unknown>[]): string {
  return jsonToCsv(JSON.stringify(rows));
}
