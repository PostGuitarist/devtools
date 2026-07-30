import { describe, expect, it } from "vitest";
import { getCategoryById, getToolById, getToolsByCategory, tools } from "./tools-registry";

describe("getToolById", () => {
  it("finds an existing tool by id", () => {
    expect(getToolById("json-formatter")?.name).toBe("JSON Formatter");
  });

  it("returns undefined for an unknown id", () => {
    expect(getToolById("does-not-exist")).toBeUndefined();
  });
});

describe("getToolsByCategory", () => {
  it("returns only tools in the requested category", () => {
    const colorTools = getToolsByCategory("colors");
    expect(colorTools.length).toBeGreaterThan(0);
    expect(colorTools.every((tool) => tool.category === "colors")).toBe(true);
  });
});

describe("getCategoryById", () => {
  it("finds an existing category", () => {
    expect(getCategoryById("formatters")?.name).toBe("Formatters");
  });

  it("returns undefined for an unknown category", () => {
    // @ts-expect-error - intentionally invalid category id
    expect(getCategoryById("nonexistent")).toBeUndefined();
  });
});

describe("tools registry integrity", () => {
  it("has unique tool ids", () => {
    const ids = tools.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a non-empty href for every tool", () => {
    expect(tools.every((tool) => tool.href.startsWith("/tools/"))).toBe(true);
  });
});
