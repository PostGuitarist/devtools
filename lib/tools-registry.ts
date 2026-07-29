import {
  Braces,
  Binary,
  Fingerprint,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type ToolCategoryId = "formatters" | "encoders" | "generators" | "colors";

export interface ToolCategory {
  id: ToolCategoryId;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategoryId;
  href: string;
  /** Search keywords beyond name/description, used by the command palette. */
  keywords?: string[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: "formatters",
    name: "Formatters",
    description: "Format, validate, and beautify structured data.",
    icon: Braces,
  },
  {
    id: "encoders",
    name: "Encoders",
    description: "Encode and decode data between formats.",
    icon: Binary,
  },
  {
    id: "generators",
    name: "Generators",
    description: "Generate IDs, tokens, and other dev artifacts.",
    icon: Fingerprint,
  },
  {
    id: "colors",
    name: "Colors",
    description: "Inspect, convert, and preview colors.",
    icon: Palette,
  },
];

export const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, minify, and validate JSON with a Monaco editor.",
    icon: Braces,
    category: "formatters",
    href: "/tools/json-formatter",
    keywords: ["json", "beautify", "minify", "validate", "pretty print"],
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    description: "Encode and decode Base64 strings instantly.",
    icon: Binary,
    category: "encoders",
    href: "/tools/base64-encoder",
    keywords: ["base64", "encode", "decode"],
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v4 UUIDs in bulk.",
    icon: Fingerprint,
    category: "generators",
    href: "/tools/uuid-generator",
    keywords: ["uuid", "guid", "id", "generate"],
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, and HSL color formats.",
    icon: Palette,
    category: "colors",
    href: "/tools/color-converter",
    keywords: ["color", "hex", "rgb", "hsl", "convert"],
  },
];

export function getToolsByCategory(category: ToolCategoryId): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolById(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}

export function getCategoryById(id: ToolCategoryId): ToolCategory | undefined {
  return toolCategories.find((category) => category.id === id);
}
