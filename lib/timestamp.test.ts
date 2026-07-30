import { describe, expect, it } from "vitest";
import {
  detectEpochUnit,
  parseDateInput,
  parseEpochInput,
  toIsoString,
  toUnixMillis,
  toUnixSeconds,
  toUtcString,
} from "./timestamp";

describe("detectEpochUnit", () => {
  it("treats 10-digit values as seconds", () => {
    expect(detectEpochUnit(1700000000)).toBe("s");
  });

  it("treats 13-digit values as milliseconds", () => {
    expect(detectEpochUnit(1700000000000)).toBe("ms");
  });
});

describe("parseEpochInput", () => {
  it("parses seconds explicitly", () => {
    const date = parseEpochInput("1700000000", "s");
    expect(date && toUnixSeconds(date)).toBe(1700000000);
  });

  it("parses milliseconds explicitly", () => {
    const date = parseEpochInput("1700000000000", "ms");
    expect(date && toUnixMillis(date)).toBe(1700000000000);
  });

  it("auto-detects the unit", () => {
    const seconds = parseEpochInput("1700000000", "auto");
    const millis = parseEpochInput("1700000000000", "auto");
    expect(seconds && toUnixSeconds(seconds)).toBe(1700000000);
    expect(millis && toUnixMillis(millis)).toBe(1700000000000);
  });

  it("supports negative epochs (pre-1970)", () => {
    const date = parseEpochInput("-3600", "s");
    expect(date && toUnixSeconds(date)).toBe(-3600);
  });

  it("returns null for empty or non-numeric input", () => {
    expect(parseEpochInput("", "s")).toBeNull();
    expect(parseEpochInput("not-a-number", "s")).toBeNull();
  });
});

describe("parseDateInput", () => {
  it("parses an ISO 8601 date string", () => {
    const date = parseDateInput("2023-11-14T22:13:20.000Z");
    expect(date && toIsoString(date)).toBe("2023-11-14T22:13:20.000Z");
  });

  it("returns null for empty or invalid input", () => {
    expect(parseDateInput("")).toBeNull();
    expect(parseDateInput("not a date")).toBeNull();
  });
});

describe("formatters", () => {
  const date = new Date("2023-11-14T22:13:20.000Z");

  it("formats as ISO 8601", () => {
    expect(toIsoString(date)).toBe("2023-11-14T22:13:20.000Z");
  });

  it("formats as a UTC string", () => {
    expect(toUtcString(date)).toBe("Tue, 14 Nov 2023 22:13:20 GMT");
  });
});
