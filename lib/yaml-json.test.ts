import { describe, expect, it } from "vitest";
import { jsonToYaml, yamlToJson } from "./yaml-json";

describe("yamlToJson", () => {
  it("converts a simple mapping", () => {
    const result = yamlToJson("name: Ada\nage: 36\n");
    expect(JSON.parse(result)).toEqual({ name: "Ada", age: 36 });
  });

  it("converts nested lists and mappings", () => {
    const result = yamlToJson("items:\n  - a\n  - b\n");
    expect(JSON.parse(result)).toEqual({ items: ["a", "b"] });
  });

  it("converts an empty document to null", () => {
    expect(yamlToJson("")).toBe("null");
  });

  it("throws on invalid YAML", () => {
    expect(() => yamlToJson("a: [1,2\n")).toThrow();
  });
});

describe("jsonToYaml", () => {
  it("converts a simple object", () => {
    const result = jsonToYaml('{"name": "Ada", "age": 36}');
    expect(result).toBe("name: Ada\nage: 36\n");
  });

  it("converts arrays", () => {
    const result = jsonToYaml('{"items": ["a", "b"]}');
    expect(result).toBe("items:\n  - a\n  - b\n");
  });

  it("throws on invalid JSON", () => {
    expect(() => jsonToYaml("not json")).toThrow();
  });
});

describe("round trip", () => {
  it("round-trips JSON through YAML back to equivalent JSON", () => {
    const original = { a: 1, b: [1, 2, 3], c: { d: "hello" } };
    const yaml = jsonToYaml(JSON.stringify(original));
    expect(JSON.parse(yamlToJson(yaml))).toEqual(original);
  });
});
