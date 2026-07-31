import { describe, expect, it } from "vitest";
import {
  buildMarkdownTable,
  createEmptyTable,
  parseDelimitedText,
  parseMarkdownTable,
} from "./markdown-table";

describe("buildMarkdownTable", () => {
  it("pads cells so the source lines up", () => {
    const table = buildMarkdownTable({
      headers: ["Name", "Role"],
      rows: [["Ada", "Mathematician"]],
      alignments: ["none", "none"],
    });
    expect(table).toBe(
      ["| Name | Role          |", "| ---- | ------------- |", "| Ada  | Mathematician |"].join("\n")
    );
  });

  it("skips padding when pretty is off", () => {
    const table = buildMarkdownTable(
      { headers: ["Name", "Role"], rows: [["Ada", "Mathematician"]], alignments: ["none", "none"] },
      { pretty: false }
    );
    expect(table).toBe(["| Name | Role |", "| --- | --- |", "| Ada | Mathematician |"].join("\n"));
  });

  it("writes alignment markers into the separator row", () => {
    const table = buildMarkdownTable(
      { headers: ["a", "b", "c"], rows: [], alignments: ["left", "center", "right"] },
      { pretty: false }
    );
    expect(table.split("\n")[1]).toBe("| :-- | :-: | --: |");
  });

  it("escapes pipes and collapses newlines in cells", () => {
    const table = buildMarkdownTable(
      { headers: ["v"], rows: [["a|b"], ["one\ntwo"]], alignments: ["none"] },
      { pretty: false }
    );
    expect(table.split("\n").slice(2)).toEqual(["| a\\|b |", "| one<br>two |"]);
  });

  it("fills in missing cells in short rows", () => {
    const table = buildMarkdownTable(
      { headers: ["a", "b"], rows: [["1"]], alignments: ["none", "none"] },
      { pretty: false }
    );
    expect(table.split("\n")[2]).toBe("| 1 |  |");
  });

  it("returns an empty string with no columns", () => {
    expect(buildMarkdownTable({ headers: [], rows: [], alignments: [] })).toBe("");
  });
});

describe("parseMarkdownTable", () => {
  it("reads headers, alignments, and rows back", () => {
    const parsed = parseMarkdownTable(
      ["| Name | Age |", "| :--- | --: |", "| Ada  | 36  |"].join("\n")
    );
    expect(parsed).toEqual({
      headers: ["Name", "Age"],
      alignments: ["left", "right"],
      rows: [["Ada", "36"]],
    });
  });

  it("round-trips a built table", () => {
    const original = {
      headers: ["Name", "Role"],
      rows: [["Ada", "Mathematician"]],
      alignments: ["left", "center"] as const,
    };
    const parsed = parseMarkdownTable(buildMarkdownTable({ ...original, alignments: [...original.alignments] }));
    expect(parsed.headers).toEqual(original.headers);
    expect(parsed.rows).toEqual(original.rows);
    expect(parsed.alignments).toEqual([...original.alignments]);
  });

  it("unescapes pipes inside cells", () => {
    const parsed = parseMarkdownTable(["| v |", "| --- |", "| a\\|b |"].join("\n"));
    expect(parsed.rows).toEqual([["a|b"]]);
  });

  it("throws when the separator row is missing", () => {
    expect(() => parseMarkdownTable("| a |\n| 1 |")).toThrow(/separator/i);
  });
});

describe("parseDelimitedText", () => {
  it("uses the first CSV row as headers", () => {
    expect(parseDelimitedText("name,role\nAda,Mathematician", ",")).toEqual({
      headers: ["name", "role"],
      rows: [["Ada", "Mathematician"]],
      alignments: ["none", "none"],
    });
  });

  it("supports tab-separated input", () => {
    expect(parseDelimitedText("a\tb\n1\t2", "\t").rows).toEqual([["1", "2"]]);
  });
});

describe("createEmptyTable", () => {
  it("creates numbered columns and blank rows", () => {
    expect(createEmptyTable(2, 1)).toEqual({
      headers: ["Column 1", "Column 2"],
      rows: [["", ""]],
      alignments: ["none", "none"],
    });
  });
});
