import { UAParser } from "ua-parser-js";
import { isAIAssistant, isAICrawler, isBot } from "ua-parser-js/bot-detection";

export interface ParsedUserAgentField {
  label: string;
  value: string | null;
}

export interface ParsedUserAgent {
  raw: string;
  browser: { name: string | null; version: string | null; major: string | null; type: string | null };
  engine: { name: string | null; version: string | null };
  os: { name: string | null; version: string | null };
  device: { type: string | null; vendor: string | null; model: string | null };
  cpu: { architecture: string | null };
  bot: { isBot: boolean; isAICrawler: boolean; isAIAssistant: boolean };
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const raw = userAgent.trim();
  const result = UAParser(raw);

  return {
    raw,
    browser: {
      name: clean(result.browser.name),
      version: clean(result.browser.version),
      major: clean(result.browser.major),
      type: clean(result.browser.type),
    },
    engine: { name: clean(result.engine.name), version: clean(result.engine.version) },
    os: { name: clean(result.os.name), version: clean(result.os.version) },
    device: {
      // ua-parser only reports a type for non-desktop devices; desktop is the
      // documented default when the UA carries no device hints.
      type: clean(result.device.type) ?? (raw ? "desktop" : null),
      vendor: clean(result.device.vendor),
      model: clean(result.device.model),
    },
    cpu: { architecture: clean(result.cpu.architecture) },
    bot: raw
      ? { isBot: isBot(raw), isAICrawler: isAICrawler(raw), isAIAssistant: isAIAssistant(raw) }
      : { isBot: false, isAICrawler: false, isAIAssistant: false },
  };
}

/** Flattens a parsed result into label/value rows for display and copying. */
export function describeUserAgent(parsed: ParsedUserAgent): ParsedUserAgentField[] {
  const version = (name: string | null, value: string | null) =>
    name ? [name, value].filter(Boolean).join(" ") : null;

  return [
    { label: "Browser", value: version(parsed.browser.name, parsed.browser.version) },
    { label: "Browser type", value: parsed.browser.type },
    { label: "Engine", value: version(parsed.engine.name, parsed.engine.version) },
    { label: "Operating system", value: version(parsed.os.name, parsed.os.version) },
    { label: "Device type", value: parsed.device.type },
    { label: "Device vendor", value: parsed.device.vendor },
    { label: "Device model", value: parsed.device.model },
    { label: "CPU architecture", value: parsed.cpu.architecture },
  ];
}

export const SAMPLE_USER_AGENTS: { label: string; value: string }[] = [
  {
    label: "Chrome on Windows",
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
  {
    label: "Safari on iPhone",
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  },
  {
    label: "Firefox on macOS",
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:133.0) Gecko/20100101 Firefox/133.0",
  },
  {
    label: "Chrome on Android",
    value:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  },
  {
    label: "Edge on Windows",
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  },
  {
    label: "Googlebot",
    value:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  { label: "curl", value: "curl/8.7.1" },
];
