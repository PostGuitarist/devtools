export interface CronFields {
  minute: Set<number>;
  hour: Set<number>;
  dayOfMonth: Set<number>;
  month: Set<number>;
  dayOfWeek: Set<number>;
  raw: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
}

export const CRON_PRESETS: { label: string; expression: string }[] = [
  { label: "Every minute", expression: "* * * * *" },
  { label: "Every 5 minutes", expression: "*/5 * * * *" },
  { label: "Every 15 minutes", expression: "*/15 * * * *" },
  { label: "Every hour", expression: "0 * * * *" },
  { label: "Every day at midnight", expression: "0 0 * * *" },
  { label: "Every day at 9am", expression: "0 9 * * *" },
  { label: "Every weekday at 9am", expression: "0 9 * * 1-5" },
  { label: "Every Sunday at midnight", expression: "0 0 * * 0" },
  { label: "First of the month at midnight", expression: "0 0 1 * *" },
  { label: "Every year on Jan 1st", expression: "0 0 1 1 *" },
];

const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseField(field: string, min: number, max: number, fieldName: string): Set<number> {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const match = part.match(/^(\*|\d+-\d+|\d+)(?:\/(\d+))?$/);
    if (!match) {
      throw new Error(`Invalid ${fieldName} field segment: "${part}".`);
    }
    const [, rangePart, stepStr] = match;
    const step = stepStr ? parseInt(stepStr, 10) : 1;
    if (step <= 0) {
      throw new Error(`Step must be positive in "${part}".`);
    }

    let start = min;
    let end = max;
    if (rangePart !== "*") {
      if (rangePart.includes("-")) {
        const [a, b] = rangePart.split("-").map(Number);
        start = a;
        end = b;
      } else {
        start = end = Number(rangePart);
      }
    }
    if (start < min || end > max || start > end) {
      throw new Error(`${fieldName} value out of range in "${part}" (expected ${min}-${max}).`);
    }
    for (let v = start; v <= end; v += step) values.add(v);
  }
  return values;
}

export function parseCron(expression: string): CronFields {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      "Cron expression must have exactly 5 fields: minute hour day-of-month month day-of-week."
    );
  }
  const [minuteStr, hourStr, domStr, monthStr, dowStr] = parts;

  const minute = parseField(minuteStr, 0, 59, "minute");
  const hour = parseField(hourStr, 0, 23, "hour");
  const dayOfMonth = parseField(domStr, 1, 31, "day-of-month");
  const month = parseField(monthStr, 1, 12, "month");
  const dayOfWeekRaw = parseField(dowStr, 0, 7, "day-of-week");
  // 7 is a common alias for Sunday alongside 0.
  const dayOfWeek = new Set(Array.from(dayOfWeekRaw, (v) => (v === 7 ? 0 : v)));

  return {
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
    raw: { minute: minuteStr, hour: hourStr, dayOfMonth: domStr, month: monthStr, dayOfWeek: dowStr },
  };
}

function dayMatches(fields: CronFields, date: Date): boolean {
  const domRestricted = fields.raw.dayOfMonth !== "*";
  const dowRestricted = fields.raw.dayOfWeek !== "*";
  const domMatch = fields.dayOfMonth.has(date.getDate());
  const dowMatch = fields.dayOfWeek.has(date.getDay());
  // Standard cron semantics: when both day-of-month and day-of-week are
  // restricted, a date matches if EITHER matches (union), not both.
  if (domRestricted && dowRestricted) return domMatch || dowMatch;
  return domMatch && dowMatch;
}

const MAX_SEARCH_ITERATIONS = 10_000;

export function computeNextRun(fields: CronFields, from: Date): Date {
  const candidate = new Date(from);
  candidate.setSeconds(0, 0);
  candidate.setMinutes(candidate.getMinutes() + 1);

  for (let i = 0; i < MAX_SEARCH_ITERATIONS; i++) {
    if (!fields.month.has(candidate.getMonth() + 1)) {
      candidate.setMonth(candidate.getMonth() + 1, 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }
    if (!dayMatches(fields, candidate)) {
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }
    if (!fields.hour.has(candidate.getHours())) {
      candidate.setHours(candidate.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!fields.minute.has(candidate.getMinutes())) {
      candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);
      continue;
    }
    return candidate;
  }

  throw new Error("No matching execution time found — this expression may never run.");
}

export function getNextRuns(expression: string, count: number, from: Date = new Date()): Date[] {
  const fields = parseCron(expression);
  const runs: Date[] = [];
  let cursor = from;
  for (let i = 0; i < count; i++) {
    const next = computeNextRun(fields, cursor);
    runs.push(next);
    cursor = next;
  }
  return runs;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isWildcard(field: string): boolean {
  return field === "*";
}

function isSingleValue(field: string): number | null {
  return /^\d+$/.test(field) ? Number(field) : null;
}

function describeStep(field: string): number | null {
  const match = field.match(/^\*\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function describeTimeOfDay(minuteField: string, hourField: string): string {
  const minuteValue = isSingleValue(minuteField);
  const hourValue = isSingleValue(hourField);

  if (isWildcard(minuteField) && isWildcard(hourField)) return "every minute";

  const minuteStep = describeStep(minuteField);
  if (minuteStep && isWildcard(hourField)) {
    return `every ${minuteStep} minute${minuteStep === 1 ? "" : "s"}`;
  }

  const hourStep = describeStep(hourField);
  if (hourStep && minuteValue !== null) {
    return `every ${hourStep} hour${hourStep === 1 ? "" : "s"} at minute ${minuteValue}`;
  }

  if (isWildcard(hourField) && minuteValue !== null) {
    return `every hour, at minute ${minuteValue}`;
  }

  if (minuteValue !== null && hourValue !== null) {
    return `at ${pad(hourValue)}:${pad(minuteValue)}`;
  }

  return `at minute ${minuteField} past hour ${hourField}`;
}

function describeDayOfMonth(field: string): string | null {
  if (isWildcard(field)) return null;
  const step = describeStep(field);
  if (step) return `every ${step} days`;
  const single = isSingleValue(field);
  if (single !== null) return `on day ${single} of the month`;
  return `on day(s) ${field} of the month`;
}

function describeMonth(field: string): string | null {
  if (isWildcard(field)) return null;
  const single = isSingleValue(field);
  if (single !== null) return `in ${MONTH_NAMES[single - 1]}`;
  const rangeMatch = field.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return `from ${MONTH_NAMES[Number(rangeMatch[1]) - 1]} through ${MONTH_NAMES[Number(rangeMatch[2]) - 1]}`;
  }
  if (/^[\d,]+$/.test(field)) {
    const names = field.split(",").map((n) => MONTH_NAMES[Number(n) - 1]);
    return `in ${names.join(", ")}`;
  }
  return `in month(s) ${field}`;
}

function weekdayName(value: number): string {
  return WEEKDAY_NAMES[value === 7 ? 0 : value];
}

function describeDayOfWeek(field: string): string | null {
  if (isWildcard(field)) return null;
  const single = isSingleValue(field);
  if (single !== null) return `on ${weekdayName(single)}`;
  const rangeMatch = field.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return `${weekdayName(Number(rangeMatch[1]))} through ${weekdayName(Number(rangeMatch[2]))}`;
  }
  if (/^[\d,]+$/.test(field)) {
    const names = field.split(",").map((n) => weekdayName(Number(n)));
    return `on ${names.join(", ")}`;
  }
  return `on day(s) ${field} of the week`;
}

export function describeCron(expression: string): string {
  parseCron(expression); // validates and throws a clear error for malformed input

  const [minuteField, hourField, domField, monthField, dowField] = expression.trim().split(/\s+/);

  const segments = [
    describeTimeOfDay(minuteField, hourField),
    describeDayOfMonth(domField),
    describeMonth(monthField),
    describeDayOfWeek(dowField),
  ].filter((segment): segment is string => Boolean(segment));

  const sentence = segments.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
