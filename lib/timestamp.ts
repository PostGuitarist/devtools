export type EpochUnit = "s" | "ms" | "auto";

/** 10-digit epoch seconds vs 13-digit epoch milliseconds is the common convention. */
export function detectEpochUnit(value: number): "s" | "ms" {
  return Math.abs(value) >= 1e12 ? "ms" : "s";
}

export function parseEpochInput(value: string, unit: EpochUnit): Date | null {
  const trimmed = value.trim();
  if (trimmed === "" || !/^-?\d+$/.test(trimmed)) return null;

  const raw = Number(trimmed);
  const resolvedUnit = unit === "auto" ? detectEpochUnit(raw) : unit;
  const ms = resolvedUnit === "s" ? raw * 1000 : raw;

  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function toUnixMillis(date: Date): number {
  return date.getTime();
}

export function toIsoString(date: Date): string {
  return date.toISOString();
}

export function toUtcString(date: Date): string {
  return date.toUTCString();
}

export function toLocalString(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "long",
  });
}

export function nowMs(): number {
  return Date.now();
}
