import { describe, expect, it } from "vitest";
import { describeUserAgent, parseUserAgent, SAMPLE_USER_AGENTS } from "./user-agent";

const CHROME_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("parseUserAgent", () => {
  it("identifies a desktop browser, engine, and OS", () => {
    const parsed = parseUserAgent(CHROME_WINDOWS);
    expect(parsed.browser.name).toBe("Chrome");
    expect(parsed.browser.major).toBe("131");
    expect(parsed.engine.name).toBe("Blink");
    expect(parsed.os.name).toBe("Windows");
    expect(parsed.cpu.architecture).toBe("amd64");
  });

  it("defaults the device type to desktop when the UA has no device hints", () => {
    expect(parseUserAgent(CHROME_WINDOWS).device.type).toBe("desktop");
  });

  it("identifies a mobile device", () => {
    const parsed = parseUserAgent(SAFARI_IPHONE);
    expect(parsed.browser.name).toBe("Mobile Safari");
    expect(parsed.os.name).toBe("iOS");
    expect(parsed.device.type).toBe("mobile");
    expect(parsed.device.vendor).toBe("Apple");
    expect(parsed.device.model).toBe("iPhone");
  });

  it("flags crawlers", () => {
    expect(parseUserAgent(GOOGLEBOT).bot.isBot).toBe(true);
    expect(parseUserAgent(CHROME_WINDOWS).bot.isBot).toBe(false);
  });

  it("trims the raw string and tolerates empty input", () => {
    const parsed = parseUserAgent("   ");
    expect(parsed.raw).toBe("");
    expect(parsed.browser.name).toBeNull();
    expect(parsed.device.type).toBeNull();
    expect(parsed.bot.isBot).toBe(false);
  });
});

describe("describeUserAgent", () => {
  it("joins names with versions and leaves unknown fields null", () => {
    const fields = describeUserAgent(parseUserAgent(CHROME_WINDOWS));
    const byLabel = Object.fromEntries(fields.map((field) => [field.label, field.value]));
    expect(byLabel.Browser).toBe("Chrome 131.0.0.0");
    expect(byLabel["Operating system"]).toBe("Windows 10");
    expect(byLabel["Device model"]).toBeNull();
  });
});

describe("SAMPLE_USER_AGENTS", () => {
  it("every sample parses to a recognised browser or bot", () => {
    for (const sample of SAMPLE_USER_AGENTS) {
      const parsed = parseUserAgent(sample.value);
      expect(parsed.browser.name ?? (parsed.bot.isBot ? "bot" : null)).not.toBeNull();
    }
  });
});
