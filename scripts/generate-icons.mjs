import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

// lucide-react's "wrench" glyph, the same one used in the navbar logo badge.
const WRENCH_PATH =
  "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z";

function buildSvg({ size, iconScale, cornerRadius }) {
  const iconSize = size * iconScale;
  const offset = (size - iconSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="#f59e0b"/>
  <g transform="translate(${offset}, ${offset}) scale(${iconSize / 24})">
    <path d="${WRENCH_PATH}" fill="none" stroke="#1c1917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

async function renderPng(svg, size, filename) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT_DIR, filename));
  console.log(`Wrote public/icons/${filename}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  await renderPng(
    buildSvg({ size: 512, iconScale: 0.55, cornerRadius: 96 }),
    192,
    "icon-192.png"
  );
  await renderPng(
    buildSvg({ size: 512, iconScale: 0.55, cornerRadius: 96 }),
    512,
    "icon-512.png"
  );
  // Maskable icons need the glyph inside a safe zone (~80% of the canvas)
  // and a full-bleed background, since the OS applies its own mask shape.
  await renderPng(
    buildSvg({ size: 512, iconScale: 0.45, cornerRadius: 0 }),
    512,
    "icon-maskable-512.png"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
