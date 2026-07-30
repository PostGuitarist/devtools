export interface DataUriInfo {
  mimeType: string;
  base64: string;
}

const DATA_URI_RE = /^data:([^;,]+);base64,([\s\S]*)$/;

export function parseDataUri(dataUri: string): DataUriInfo {
  const match = dataUri.trim().match(DATA_URI_RE);
  if (!match) {
    throw new Error("Not a valid base64 image data URI (expected data:<mime>;base64,<data>).");
  }
  return { mimeType: match[1], base64: match[2].replace(/\s/g, "") };
}

export function buildDataUri(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64}`;
}

export function buildImgTag(dataUri: string, alt = ""): string {
  return `<img src="${dataUri}" alt="${alt}" />`;
}

export function buildCssBackground(dataUri: string): string {
  return `background-image: url("${dataUri}");`;
}

export function estimateDecodedByteSize(base64: string): number {
  const length = base64.length;
  if (length === 0) return 0;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((length * 3) / 4) - padding;
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
