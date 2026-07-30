import { describe, expect, it } from "vitest";
import { jsonToCsv } from "./json-to-csv";

describe("jsonToCsv", () => {
  it("converts an array of flat objects", () => {
    const csv = jsonToCsv('[{"name": "Ada", "age": 36}, {"name": "Alan", "age": 41}]');
    expect(csv).toBe("name,age\nAda,36\nAlan,41");
  });

  it("unions columns across objects, filling missing values with empty cells", () => {
    const csv = jsonToCsv('[{"a": 1}, {"a": 2, "b": 3}]');
    expect(csv).toBe("a,b\n1,\n2,3");
  });

  it("flattens nested objects with dot notation", () => {
    const csv = jsonToCsv('[{"name": "Ada", "address": {"city": "London"}}]');
    expect(csv).toBe("name,address.city\nAda,London");
  });

  it("quotes fields containing the delimiter, quotes, or newlines", () => {
    const csv = jsonToCsv('[{"note": "hello, \\"world\\"\\nagain"}]');
    expect(csv).toBe('note\n"hello, ""world""\nagain"');
  });

  it("supports a custom delimiter", () => {
    const csv = jsonToCsv('[{"a": 1, "b": 2}]', { delimiter: ";" });
    expect(csv).toBe("a;b\n1;2");
  });

  it("handles an array of primitives with a single value column", () => {
    const csv = jsonToCsv("[1, 2, 3]");
    expect(csv).toBe("value\n1\n2\n3");
  });

  it("returns an empty string for an empty array", () => {
    expect(jsonToCsv("[]")).toBe("");
  });

  it("throws when the root is not an array", () => {
    expect(() => jsonToCsv('{"a": 1}')).toThrow();
  });

  it("throws on invalid JSON", () => {
    expect(() => jsonToCsv("not json")).toThrow();
  });

  it("stringifies array values as JSON within a cell", () => {
    const csv = jsonToCsv('[{"tags": ["a", "b"]}]');
    expect(csv).toBe('tags\n"[""a"",""b""]"');
  });
});
