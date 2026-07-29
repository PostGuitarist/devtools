export function validateXml(xml: string): void {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error(errorNode.textContent?.trim() || "Invalid XML");
  }
}

export function minifyXml(xml: string): string {
  validateXml(xml);
  return xml.replace(/>\s+</g, "><").trim();
}

export function formatXml(xml: string, indentSize = 2): string {
  validateXml(xml);

  const padding = " ".repeat(indentSize);
  const collapsed = xml.replace(/>\s*</g, "><").trim();
  const withBreaks = collapsed.replace(/(>)(<)(\/*)/g, "$1\n$2$3");

  let depth = 0;
  return withBreaks
    .split("\n")
    .map((line) => {
      let nextDepthDelta = 0;

      if (/^<\/.+>$/.test(line)) {
        depth = Math.max(0, depth - 1);
      } else if (/^<[^!?][^>]*[^/?]>.*$/.test(line) && !/<\/[^>]+>$/.test(line)) {
        nextDepthDelta = 1;
      }

      const indented = padding.repeat(depth) + line;
      depth += nextDepthDelta;
      return indented;
    })
    .join("\n");
}
