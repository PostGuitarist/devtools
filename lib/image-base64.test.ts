import { describe, expect, it } from "vitest";
import {
  buildCssBackground,
  buildDataUri,
  buildImgTag,
  estimateDecodedByteSize,
  formatByteSize,
  parseDataUri,
} from "./image-base64";

describe("parseDataUri", () => {
  it("parses a valid base64 image data URI", () => {
    const result = parseDataUri("data:image/png;base64,iVBORw0KG==");
    expect(result.mimeType).toBe("image/png");
    expect(result.base64).toBe("iVBORw0KG==");
  });

  it("strips whitespace from the base64 payload", () => {
    const result = parseDataUri("data:image/png;base64,iVBO\nRw0K==");
    expect(result.base64).toBe("iVBORw0K==");
  });

  it("throws for a non-data-URI string", () => {
    expect(() => parseDataUri("not a data uri")).toThrow();
  });

  it("throws for a data URI missing the base64 marker", () => {
    expect(() => parseDataUri("data:image/png,notbase64")).toThrow();
  });
});

describe("buildDataUri", () => {
  it("builds a data URI from mime type and base64", () => {
    expect(buildDataUri("image/png", "abc123==")).toBe("data:image/png;base64,abc123==");
  });
});

describe("buildImgTag / buildCssBackground", () => {
  it("builds an img tag", () => {
    const dataUri = "data:image/png;base64,abc";
    expect(buildImgTag(dataUri)).toBe(`<img src="${dataUri}" alt="" />`);
    expect(buildImgTag(dataUri, "logo")).toBe(`<img src="${dataUri}" alt="logo" />`);
  });

  it("builds a CSS background-image declaration", () => {
    const dataUri = "data:image/png;base64,abc";
    expect(buildCssBackground(dataUri)).toBe(`background-image: url("${dataUri}");`);
  });
});

describe("estimateDecodedByteSize", () => {
  it("returns 0 for empty input", () => {
    expect(estimateDecodedByteSize("")).toBe(0);
  });

  it("estimates size accounting for padding", () => {
    // "aGVsbG8=" decodes to "hello" (5 bytes), 1 padding char.
    expect(estimateDecodedByteSize("aGVsbG8=")).toBe(5);
    // "aGVsbG8h" decodes to "hello!" (6 bytes), no padding.
    expect(estimateDecodedByteSize("aGVsbG8h")).toBe(6);
  });
});

describe("formatByteSize", () => {
  it("formats bytes", () => {
    expect(formatByteSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatByteSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatByteSize(5 * 1024 * 1024)).toBe("5.00 MB");
  });
});
