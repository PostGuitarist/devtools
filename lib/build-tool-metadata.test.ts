import { describe, expect, it } from "vitest";
import { buildToolMetadata } from "./build-tool-metadata";

describe("buildToolMetadata", () => {
  it("builds title/description/canonical from the registry entry", () => {
    const metadata = buildToolMetadata("json-formatter");
    expect(metadata.title).toBe("JSON Formatter — DevTools");
    expect(metadata.description).toBe(
      "Format, minify, and validate JSON with a Monaco editor."
    );
    expect(metadata.alternates).toEqual({ canonical: "/tools/json-formatter" });
  });

  it("sets matching Open Graph fields", () => {
    const metadata = buildToolMetadata("base64-encoder");
    expect(metadata.openGraph).toMatchObject({
      title: "Base64 Encoder — DevTools",
      url: "/tools/base64-encoder",
    });
  });

  it("returns an empty object for an unknown tool id", () => {
    expect(buildToolMetadata("does-not-exist")).toEqual({});
  });
});
