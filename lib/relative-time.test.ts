import { describe, expect, it } from "vitest";
import { formatDayLabel, formatRelativeTime } from "./relative-time";

describe("formatRelativeTime", () => {
  const now = new Date("2023-11-14T12:00:00.000Z").getTime();

  it("formats a few seconds ago", () => {
    expect(formatRelativeTime(now - 5_000, now)).toBe("5 seconds ago");
  });

  it("formats minutes ago", () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe("5 minutes ago");
  });

  it("formats hours ago", () => {
    expect(formatRelativeTime(now - 3 * 60 * 60_000, now)).toBe("3 hours ago");
  });

  it("formats days ago", () => {
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe("2 days ago");
  });

  it("formats future timestamps", () => {
    expect(formatRelativeTime(now + 60_000, now)).toBe("in 1 minute");
  });

  it("formats 'now' as 0 seconds", () => {
    expect(formatRelativeTime(now, now)).toBe("now");
  });
});

describe("formatDayLabel", () => {
  const now = new Date("2023-11-14T12:00:00.000Z").getTime();

  it("labels the same calendar day as Today", () => {
    expect(formatDayLabel(new Date("2023-11-14T01:00:00.000Z").getTime(), now)).toBe("Today");
  });

  it("labels the previous calendar day as Yesterday", () => {
    expect(formatDayLabel(new Date("2023-11-13T23:00:00.000Z").getTime(), now)).toBe(
      "Yesterday"
    );
  });

  it("labels older same-year dates with month and day only", () => {
    expect(formatDayLabel(new Date("2023-01-05T12:00:00.000Z").getTime(), now)).toBe(
      "January 5"
    );
  });

  it("labels dates from a different year with the year included", () => {
    expect(formatDayLabel(new Date("2022-01-05T12:00:00.000Z").getTime(), now)).toBe(
      "January 5, 2022"
    );
  });
});
