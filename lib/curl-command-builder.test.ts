import { describe, expect, it } from "vitest";
import { buildCurlCommand, parseCurlCommand } from "./curl-command-builder";

describe("buildCurlCommand", () => {
  it("omits -X for a GET request", () => {
    const command = buildCurlCommand({ method: "GET", url: "https://example.com", headers: [], body: "" });
    expect(command).toBe("curl 'https://example.com'");
  });

  it("includes -X for a non-GET method", () => {
    const command = buildCurlCommand({ method: "POST", url: "https://example.com", headers: [], body: "" });
    expect(command).toBe("curl -X POST 'https://example.com'");
  });

  it("adds a -H flag per header and skips blank keys", () => {
    const command = buildCurlCommand({
      method: "GET",
      url: "https://example.com",
      headers: [{ key: "Authorization", value: "Bearer token" }, { key: "", value: "ignored" }],
      body: "",
    });
    expect(command).toBe("curl -H 'Authorization: Bearer token' 'https://example.com'");
  });

  it("adds a -d flag with an escaped body", () => {
    const command = buildCurlCommand({
      method: "POST",
      url: "https://example.com",
      headers: [],
      body: `{"name":"O'Brien"}`,
    });
    expect(command).toBe(`curl -X POST -d '{"name":"O'\\''Brien"}' 'https://example.com'`);
  });
});

describe("parseCurlCommand", () => {
  it("parses method, headers, body, and URL", () => {
    const request = parseCurlCommand(
      `curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer token' -d '{"name":"Ada"}' https://example.com/users`
    );
    expect(request).toEqual({
      method: "POST",
      url: "https://example.com/users",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "Authorization", value: "Bearer token" },
      ],
      body: '{"name":"Ada"}',
    });
  });

  it("defaults to GET when no method or data flag is present", () => {
    const request = parseCurlCommand("curl https://example.com");
    expect(request.method).toBe("GET");
  });

  it("defaults to POST when a data flag is present but no explicit method", () => {
    const request = parseCurlCommand(`curl -d 'a=1' https://example.com`);
    expect(request.method).toBe("POST");
  });

  it("round-trips a command built by buildCurlCommand", () => {
    const original = {
      method: "PUT",
      url: "https://example.com/items/1",
      headers: [{ key: "X-Api-Key", value: "abc123" }],
      body: '{"done":true}',
    };
    const roundTripped = parseCurlCommand(buildCurlCommand(original));
    expect(roundTripped).toEqual(original);
  });

  it("throws for an empty command", () => {
    expect(() => parseCurlCommand("")).toThrow(/empty/i);
  });

  it("throws when the command doesn't start with curl", () => {
    expect(() => parseCurlCommand("wget https://example.com")).toThrow(/curl/i);
  });

  it("throws when no URL is present", () => {
    expect(() => parseCurlCommand("curl -X GET")).toThrow(/url/i);
  });
});
