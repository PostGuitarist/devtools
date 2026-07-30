import { describe, expect, it } from "vitest";
import { buildEmailPayload, buildWifiPayload, generateQrSvg } from "./qr-code";

describe("generateQrSvg", () => {
  it("generates SVG markup for text", async () => {
    const svg = await generateQrSvg("hello world");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("respects the width option", async () => {
    const svg = await generateQrSvg("hello", { width: 128 });
    expect(svg).toContain('width="128"');
  });

  it("rejects empty text", async () => {
    await expect(generateQrSvg("")).rejects.toThrow();
  });
});

describe("buildWifiPayload", () => {
  it("builds a WPA WIFI: payload", () => {
    expect(buildWifiPayload({ ssid: "MyNetwork", password: "secret123" })).toBe(
      "WIFI:T:WPA;S:MyNetwork;P:secret123;H:false;;"
    );
  });

  it("omits the password for nopass networks", () => {
    expect(buildWifiPayload({ ssid: "Open", password: "", encryption: "nopass" })).toBe(
      "WIFI:T:nopass;S:Open;P:;H:false;;"
    );
  });

  it("marks hidden networks", () => {
    expect(buildWifiPayload({ ssid: "Hidden", password: "x", hidden: true })).toContain("H:true");
  });

  it("escapes special characters in SSID and password", () => {
    expect(buildWifiPayload({ ssid: 'a;b', password: 'c"d' })).toBe(
      'WIFI:T:WPA;S:a\\;b;P:c\\"d;H:false;;'
    );
  });
});

describe("buildEmailPayload", () => {
  it("builds a plain mailto link", () => {
    expect(buildEmailPayload({ to: "a@example.com" })).toBe("mailto:a@example.com");
  });

  it("includes subject and body as query params", () => {
    const result = buildEmailPayload({ to: "a@example.com", subject: "Hi", body: "Hello there" });
    expect(result).toBe("mailto:a@example.com?subject=Hi&body=Hello+there");
  });
});
