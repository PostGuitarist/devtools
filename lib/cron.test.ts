import { describe, expect, it } from "vitest";
import { computeNextRun, describeCron, getNextRuns, parseCron } from "./cron";

describe("parseCron", () => {
  it("throws when the expression doesn't have exactly 5 fields", () => {
    expect(() => parseCron("* * * *")).toThrow();
    expect(() => parseCron("* * * * * *")).toThrow();
  });

  it("throws on an out-of-range value", () => {
    expect(() => parseCron("60 * * * *")).toThrow();
    expect(() => parseCron("* 24 * * *")).toThrow();
  });

  it("throws on an invalid segment", () => {
    expect(() => parseCron("abc * * * *")).toThrow();
  });

  it("parses a wildcard field to the full range", () => {
    const fields = parseCron("* * * * *");
    expect(fields.minute.size).toBe(60);
    expect(fields.hour.size).toBe(24);
  });

  it("parses a step field", () => {
    const fields = parseCron("*/15 * * * *");
    expect(Array.from(fields.minute).sort((a, b) => a - b)).toEqual([0, 15, 30, 45]);
  });

  it("maps day-of-week 7 to 0 (Sunday)", () => {
    const fields = parseCron("0 0 * * 7");
    expect(fields.dayOfWeek.has(0)).toBe(true);
    expect(fields.dayOfWeek.has(7)).toBe(false);
  });
});

describe("computeNextRun", () => {
  it("finds the next minute for '* * * * *'", () => {
    const fields = parseCron("* * * * *");
    const from = new Date(2024, 0, 1, 10, 30, 15);
    const next = computeNextRun(fields, from);
    expect(next).toEqual(new Date(2024, 0, 1, 10, 31, 0, 0));
  });

  it("finds the next 15-minute mark", () => {
    const fields = parseCron("*/15 * * * *");
    const from = new Date(2024, 0, 1, 10, 7);
    const next = computeNextRun(fields, from);
    expect(next).toEqual(new Date(2024, 0, 1, 10, 15));
  });

  it("finds the next weekday 9am run from a weekend", () => {
    const fields = parseCron("0 9 * * 1-5");
    const from = new Date(2024, 0, 6, 12, 0); // Saturday Jan 6, 2024
    const next = computeNextRun(fields, from);
    expect(next).toEqual(new Date(2024, 0, 8, 9, 0)); // Monday Jan 8
  });

  it("applies OR semantics when both day-of-month and day-of-week are restricted", () => {
    const fields = parseCron("0 0 10 * 1"); // midnight on the 10th, or any Monday
    const from = new Date(2024, 0, 8, 0, 5); // Monday Jan 8, just past midnight
    const next = computeNextRun(fields, from);
    // Jan 10 (Wednesday) matches via day-of-month and comes before the next Monday (Jan 15).
    expect(next).toEqual(new Date(2024, 0, 10, 0, 0));
  });

  it("rolls over to the next month", () => {
    const fields = parseCron("0 0 1 * *");
    const from = new Date(2024, 0, 15);
    const next = computeNextRun(fields, from);
    expect(next).toEqual(new Date(2024, 1, 1, 0, 0));
  });
});

describe("getNextRuns", () => {
  it("returns the requested number of runs in ascending order", () => {
    const from = new Date(2024, 0, 1, 0, 0);
    const runs = getNextRuns("0 * * * *", 3, from);
    expect(runs).toEqual([
      new Date(2024, 0, 1, 1, 0),
      new Date(2024, 0, 1, 2, 0),
      new Date(2024, 0, 1, 3, 0),
    ]);
  });
});

describe("describeCron", () => {
  it("describes every minute", () => {
    expect(describeCron("* * * * *")).toBe("Every minute");
  });

  it("describes every N minutes", () => {
    expect(describeCron("*/5 * * * *")).toBe("Every 5 minutes");
  });

  it("describes a fixed daily time", () => {
    expect(describeCron("30 14 * * *")).toBe("At 14:30");
  });

  it("describes weekday ranges", () => {
    expect(describeCron("0 9 * * 1-5")).toBe("At 09:00, Monday through Friday");
  });

  it("describes a day of the month", () => {
    expect(describeCron("0 0 1 * *")).toBe("At 00:00, on day 1 of the month");
  });

  it("describes a specific month", () => {
    expect(describeCron("0 0 1 1 *")).toBe("At 00:00, on day 1 of the month, in January");
  });

  it("throws for an invalid expression", () => {
    expect(() => describeCron("not a cron")).toThrow();
  });
});
