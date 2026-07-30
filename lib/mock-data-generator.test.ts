import { describe, expect, it } from "vitest";
import {
  generateMockData,
  mockDataToCsv,
  mockDataToJson,
  type MockFieldSchema,
} from "./mock-data-generator";

const schema: MockFieldSchema[] = [
  { name: "id", type: "uuid" },
  { name: "name", type: "name" },
  { name: "email", type: "email" },
  { name: "age", type: "number" },
  { name: "active", type: "boolean" },
  { name: "joined", type: "date" },
  { name: "tag", type: "word" },
  { name: "bio", type: "sentence" },
];

describe("generateMockData", () => {
  it("generates the requested number of rows", () => {
    expect(generateMockData(schema, 5)).toHaveLength(5);
  });

  it("returns an empty array for zero rows", () => {
    expect(generateMockData(schema, 0)).toEqual([]);
  });

  it("populates every non-blank field on each row", () => {
    const rows = generateMockData(schema, 3);
    for (const row of rows) {
      for (const field of schema) {
        expect(row).toHaveProperty(field.name);
      }
    }
  });

  it("skips fields with a blank name", () => {
    const rows = generateMockData([{ name: "  ", type: "word" }, { name: "id", type: "uuid" }], 1);
    expect(Object.keys(rows[0])).toEqual(["id"]);
  });

  it("generates plausible values per type", () => {
    const [row] = generateMockData(schema, 1);
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof row.name).toBe("string");
    expect(row.email).toMatch(/@/);
    expect(typeof row.age).toBe("number");
    expect(typeof row.active).toBe("boolean");
    expect(row.joined).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("mockDataToJson", () => {
  it("pretty-prints the rows as a JSON array", () => {
    const rows = [{ id: "1" }];
    expect(mockDataToJson(rows)).toBe(JSON.stringify(rows, null, 2));
  });
});

describe("mockDataToCsv", () => {
  it("converts rows to CSV with a header row", () => {
    const rows = [{ id: "1", name: "Ada" }];
    const csv = mockDataToCsv(rows);
    expect(csv.split("\n")[0]).toBe("id,name");
    expect(csv.split("\n")[1]).toBe("1,Ada");
  });

  it("returns an empty string for zero rows", () => {
    expect(mockDataToCsv([])).toBe("");
  });
});
