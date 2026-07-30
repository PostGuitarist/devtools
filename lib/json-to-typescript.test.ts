import { describe, expect, it } from "vitest";
import { jsonToTypeScript } from "./json-to-typescript";

describe("jsonToTypeScript", () => {
  it("generates an interface for a flat object", () => {
    const result = jsonToTypeScript('{"name": "Ada", "age": 36, "active": true}');
    expect(result).toContain("interface Root {");
    expect(result).toContain("name: string;");
    expect(result).toContain("age: number;");
    expect(result).toContain("active: boolean;");
  });

  it("uses a custom root name", () => {
    const result = jsonToTypeScript('{"id": 1}', { rootName: "user" });
    expect(result).toContain("interface User {");
  });

  it("generates nested interfaces for nested objects", () => {
    const result = jsonToTypeScript('{"address": {"city": "NYC"}}');
    expect(result).toContain("interface Address {");
    expect(result).toContain("address: Address;");
  });

  it("infers an array element type", () => {
    const result = jsonToTypeScript('{"tags": ["a", "b"]}');
    expect(result).toContain("tags: string[];");
  });

  it("merges shapes across array-of-object elements and marks missing keys optional", () => {
    const result = jsonToTypeScript('{"items": [{"id": 1, "name": "a"}, {"id": 2}]}');
    expect(result).toContain("id: number;");
    expect(result).toContain("name?: string;");
  });

  it("handles an empty array as unknown[]", () => {
    const result = jsonToTypeScript('{"list": []}');
    expect(result).toContain("list: unknown[];");
  });

  it("handles null values", () => {
    const result = jsonToTypeScript('{"middleName": null}');
    expect(result).toContain("middleName: null;");
  });

  it("quotes property keys that aren't valid identifiers", () => {
    const result = jsonToTypeScript('{"first-name": "Ada"}');
    expect(result).toContain('"first-name": string;');
  });

  it("emits `type` declarations when useInterface is false", () => {
    const result = jsonToTypeScript('{"id": 1}', { useInterface: false });
    expect(result).toContain("type Root = {");
  });

  it("emits a top-level alias for an array root", () => {
    const result = jsonToTypeScript('[{"id": 1}]');
    expect(result).toContain("interface RootItem {");
    expect(result).toContain("type Root = RootItem[];");
  });

  it("emits a top-level alias for a primitive root", () => {
    const result = jsonToTypeScript('"hello"');
    expect(result).toBe("type Root = string;\n");
  });

  it("throws on invalid JSON", () => {
    expect(() => jsonToTypeScript("{not json}")).toThrow();
  });
});
