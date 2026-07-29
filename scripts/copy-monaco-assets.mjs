import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(rootDir, "node_modules", "monaco-editor", "min", "vs");
const dest = path.join(rootDir, "public", "vs");

if (!existsSync(src)) {
  console.warn("monaco-editor package not found, skipping asset copy.");
  process.exit(0);
}

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log(`Copied monaco-editor assets to ${path.relative(rootDir, dest)}`);
