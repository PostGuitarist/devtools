import { describe, expect, it } from "vitest";
import {
  getHttpStatus,
  getHttpStatusCategory,
  httpStatuses,
  searchHttpStatuses,
} from "./http-status-codes";

describe("httpStatuses", () => {
  it("has unique codes", () => {
    const codes = httpStatuses.map((status) => status.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("is sorted by code", () => {
    const codes = httpStatuses.map((status) => status.code);
    expect([...codes].sort((a, b) => a - b)).toEqual(codes);
  });

  it("assigns each status to the category matching its code", () => {
    expect(
      httpStatuses.every((status) => status.category === getHttpStatusCategory(status.code))
    ).toBe(true);
  });

  it("gives every status a name and description", () => {
    expect(
      httpStatuses.every((status) => status.name.length > 0 && status.description.length > 0)
    ).toBe(true);
  });

  it("covers the most common codes", () => {
    for (const code of [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]) {
      expect(getHttpStatus(code), `missing ${code}`).toBeDefined();
    }
  });
});

describe("getHttpStatus", () => {
  it("finds a known code", () => {
    expect(getHttpStatus(418)?.name).toBe("I'm a teapot");
  });

  it("returns undefined for an unassigned code", () => {
    expect(getHttpStatus(499999)).toBeUndefined();
  });
});

describe("getHttpStatusCategory", () => {
  it("maps a code to its class", () => {
    expect(getHttpStatusCategory(204)).toBe("2xx");
    expect(getHttpStatusCategory(503)).toBe("5xx");
  });

  it("returns null outside the 1xx–5xx range", () => {
    expect(getHttpStatusCategory(600)).toBeNull();
    expect(getHttpStatusCategory(42)).toBeNull();
  });
});

describe("searchHttpStatuses", () => {
  it("returns everything for a blank query", () => {
    expect(searchHttpStatuses("  ")).toHaveLength(httpStatuses.length);
  });

  it("puts an exact code match first", () => {
    expect(searchHttpStatuses("404")[0].code).toBe(404);
  });

  it("matches on name, case-insensitively", () => {
    expect(searchHttpStatuses("teapot").map((status) => status.code)).toEqual([418]);
  });

  it("matches on description text", () => {
    expect(searchHttpStatuses("rate limit").some((status) => status.code === 429)).toBe(true);
  });

  it("returns nothing when there is no match", () => {
    expect(searchHttpStatuses("zzzzz")).toEqual([]);
  });
});
