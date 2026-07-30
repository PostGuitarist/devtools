export interface SvgDimensions {
  width: number;
  height: number;
}

const DEFAULT_DIMENSIONS: SvgDimensions = { width: 300, height: 150 };

/** Reads intrinsic width/height from an <svg> element's attributes, falling back to its viewBox, then the SVG spec default. */
export function parseSvgDimensions(svgMarkup: string): SvgDimensions {
  const openTagMatch = svgMarkup.match(/<svg[^>]*>/i);
  if (!openTagMatch) return DEFAULT_DIMENSIONS;
  const openTag = openTagMatch[0];

  const widthMatch = openTag.match(/\swidth="([\d.]+)(?:px)?"/i);
  const heightMatch = openTag.match(/\sheight="([\d.]+)(?:px)?"/i);
  if (widthMatch && heightMatch) {
    return { width: parseFloat(widthMatch[1]), height: parseFloat(heightMatch[1]) };
  }

  const viewBoxMatch = openTag.match(
    /\sviewBox="\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*"/i
  );
  if (viewBoxMatch) {
    return { width: parseFloat(viewBoxMatch[1]), height: parseFloat(viewBoxMatch[2]) };
  }

  return DEFAULT_DIMENSIONS;
}

export function svgToDataUri(svgMarkup: string): string {
  const encoded = encodeURIComponent(svgMarkup).replace(/'/g, "%27").replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
