import { describe, expect, it } from "vitest";
import { convertEnv, parseEnv, stringifyEnv } from "./env-converter";

describe("parseEnv", () => {
  it("parses plain assignments", () => {
    expect(parseEnv("PORT=3000\nHOST=localhost")).toEqual({ PORT: "3000", HOST: "localhost" });
  });

  it("ignores comments and blank lines", () => {
    expect(parseEnv("# comment\n\nPORT=3000")).toEqual({ PORT: "3000" });
  });

  it("strips an export prefix", () => {
    expect(parseEnv("export TOKEN=abc")).toEqual({ TOKEN: "abc" });
  });

  it("keeps spaces and hashes inside quoted values", () => {
    expect(parseEnv('GREETING="hello world # not a comment"')).toEqual({
      GREETING: "hello world # not a comment",
    });
  });

  it("removes inline comments from unquoted values", () => {
    expect(parseEnv("PORT=3000 # the port")).toEqual({ PORT: "3000" });
  });

  it("unescapes sequences in double-quoted values only", () => {
    expect(parseEnv('A="line1\\nline2"')).toEqual({ A: "line1\nline2" });
    expect(parseEnv("B='line1\\nline2'")).toEqual({ B: "line1\\nline2" });
  });

  it("reads a quoted value spanning multiple lines", () => {
    expect(parseEnv('KEY="first\nsecond"\nNEXT=1')).toEqual({ KEY: "first\nsecond", NEXT: "1" });
  });

  it("supports empty values", () => {
    expect(parseEnv("EMPTY=")).toEqual({ EMPTY: "" });
  });

  it("throws on a line that is not an assignment", () => {
    expect(() => parseEnv("just some text")).toThrow(/line 1/i);
  });

  it("throws on an invalid variable name", () => {
    expect(() => parseEnv("1BAD=x")).toThrow(/not a valid variable name/i);
  });

  it("throws on an unterminated quote", () => {
    expect(() => parseEnv('KEY="unclosed')).toThrow(/unterminated/i);
  });
});

describe("stringifyEnv", () => {
  it("leaves simple values unquoted", () => {
    expect(stringifyEnv({ PORT: "3000" })).toBe("PORT=3000");
  });

  it("quotes values containing whitespace or hashes", () => {
    expect(stringifyEnv({ MSG: "hello world" })).toBe('MSG="hello world"');
  });

  it("escapes newlines and quotes", () => {
    expect(stringifyEnv({ KEY: 'a\n"b"' })).toBe('KEY="a\\n\\"b\\""');
  });

  it("quotes an empty value", () => {
    expect(stringifyEnv({ EMPTY: "" })).toBe('EMPTY=""');
  });
});

describe("convertEnv", () => {
  it("converts .env to JSON", () => {
    expect(JSON.parse(convertEnv("PORT=3000\nDEBUG=true", "env", "json"))).toEqual({
      PORT: "3000",
      DEBUG: "true",
    });
  });

  it("converts JSON to .env, stringifying non-string values", () => {
    expect(convertEnv('{"PORT":3000,"NESTED":{"a":1}}', "json", "env")).toBe(
      'PORT=3000\nNESTED="{\\"a\\":1}"'
    );
  });

  it("converts .env to YAML", () => {
    expect(convertEnv("PORT=3000", "env", "yaml").trim()).toBe("PORT: '3000'");
  });

  it("converts YAML to .env", () => {
    expect(convertEnv("PORT: 3000\nHOST: localhost", "yaml", "env")).toBe(
      "PORT=3000\nHOST=localhost"
    );
  });

  it("round-trips .env through JSON", () => {
    const source = 'PORT=3000\nMSG="hello world"';
    expect(convertEnv(convertEnv(source, "env", "json"), "json", "env")).toBe(source);
  });

  it("rejects a JSON array", () => {
    expect(() => convertEnv("[1,2]", "json", "env")).toThrow(/object/i);
  });

  it("returns empty output for empty input", () => {
    expect(convertEnv("", "env", "json")).toBe("{}");
    expect(convertEnv("", "json", "env")).toBe("");
  });
});
