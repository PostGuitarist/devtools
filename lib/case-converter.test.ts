import { describe, expect, it } from "vitest";
import { convertCase, tokenize } from "./case-converter";

describe("tokenize", () => {
  it("splits camelCase", () => {
    expect(tokenize("helloWorld")).toEqual(["hello", "world"]);
  });

  it("splits snake_case and kebab-case", () => {
    expect(tokenize("hello_world")).toEqual(["hello", "world"]);
    expect(tokenize("hello-world")).toEqual(["hello", "world"]);
  });

  it("splits acronym boundaries", () => {
    expect(tokenize("XMLHttpRequest")).toEqual(["xml", "http", "request"]);
  });

  it("returns an empty array for an empty string", () => {
    expect(tokenize("")).toEqual([]);
  });
});

describe("convertCase", () => {
  const input = "hello world example";

  it("converts to camelCase", () => {
    expect(convertCase(input, "camelCase")).toBe("helloWorldExample");
  });

  it("converts to PascalCase", () => {
    expect(convertCase(input, "PascalCase")).toBe("HelloWorldExample");
  });

  it("converts to snake_case", () => {
    expect(convertCase(input, "snake_case")).toBe("hello_world_example");
  });

  it("converts to CONSTANT_CASE", () => {
    expect(convertCase(input, "CONSTANT_CASE")).toBe("HELLO_WORLD_EXAMPLE");
  });

  it("converts to kebab-case", () => {
    expect(convertCase(input, "kebab-case")).toBe("hello-world-example");
  });

  it("converts to Title Case", () => {
    expect(convertCase(input, "Title Case")).toBe("Hello World Example");
  });

  it("converts to Sentence case", () => {
    expect(convertCase(input, "Sentence case")).toBe("Hello world example");
  });

  it("returns an empty string for empty input", () => {
    expect(convertCase("", "camelCase")).toBe("");
  });
});
