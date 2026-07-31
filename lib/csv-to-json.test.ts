import { describe, expect, it } from "vitest";
import { csvToJson, parseCsvRows } from "./csv-to-json";

describe("parseCsvRows", () => {
  it("splits simple rows and columns", () => {
    expect(parseCsvRows("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps delimiters and newlines inside quoted fields", () => {
    expect(parseCsvRows('name,note\n"Ada","one, two\nthree"')).toEqual([
      ["name", "note"],
      ["Ada", "one, two\nthree"],
    ]);
  });

  it("unescapes doubled quotes", () => {
    expect(parseCsvRows('quote\n"She said ""hi"""')).toEqual([["quote"], ['She said "hi"']]);
  });

  it("handles CRLF line endings and a trailing newline", () => {
    expect(parseCsvRows("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("supports an alternate delimiter", () => {
    expect(parseCsvRows("a;b\n1;2", ";")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("throws on an unterminated quoted field", () => {
    expect(() => parseCsvRows('a\n"unclosed')).toThrow(/unterminated/i);
  });

  it("rejects a multi-character delimiter", () => {
    expect(() => parseCsvRows("a,b", ",,")).toThrow(/single character/i);
  });
});

describe("csvToJson", () => {
  it("uses the first row as object keys", () => {
    expect(JSON.parse(csvToJson("name,city\nAda,London"))).toEqual([
      { name: "Ada", city: "London" },
    ]);
  });

  it("infers numbers, booleans, and null", () => {
    expect(JSON.parse(csvToJson("n,b,x\n42,true,null"))).toEqual([{ n: 42, b: true, x: null }]);
  });

  it("keeps everything as strings when inference is off", () => {
    expect(JSON.parse(csvToJson("n\n42", { inferTypes: false }))).toEqual([{ n: "42" }]);
  });

  it("pads short rows with empty values", () => {
    expect(JSON.parse(csvToJson("a,b\n1"))).toEqual([{ a: 1, b: "" }]);
  });

  it("de-duplicates repeated header names", () => {
    expect(JSON.parse(csvToJson("id,id\n1,2"))).toEqual([{ id: 1, id_2: 2 }]);
  });

  it("names blank header columns", () => {
    expect(JSON.parse(csvToJson(",b\n1,2"))).toEqual([{ column_1: 1, b: 2 }]);
  });

  it("emits arrays when there is no header row", () => {
    expect(JSON.parse(csvToJson("1,2\n3,4", { header: false }))).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(csvToJson("")).toBe("[]");
  });
});
