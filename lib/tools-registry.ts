import {
  Braces,
  Binary,
  Fingerprint,
  Palette,
  Database,
  FileCode2,
  Link2,
  Ampersand,
  Type,
  KeyRound,
  KeySquare,
  Blend,
  GitCompare,
  CaseSensitive,
  Clock,
  Hash,
  Regex,
  type LucideIcon,
} from "lucide-react";

export type ToolCategoryId =
  | "formatters"
  | "encoders"
  | "generators"
  | "colors"
  | "text";

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
  /** Surfaced with a "Popular" badge on the homepage. */
  popular?: boolean;
  /** Listed in the catalog (mega-menu, homepage) but not yet built. */
  comingSoon?: boolean;
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
  {
    id: "text",
    name: "Text",
    description: "Compare, transform, and clean up text.",
    icon: Type,
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
    popular: true,
  },
  {
    id: "xml-formatter",
    name: "XML Formatter",
    description: "Format and validate XML documents.",
    icon: FileCode2,
    category: "formatters",
    href: "/tools/xml-formatter",
    keywords: ["xml", "format", "validate", "pretty print"],
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description: "Beautify SQL queries with consistent indentation.",
    icon: Database,
    category: "formatters",
    href: "/tools/sql-formatter",
    keywords: ["sql", "query", "format", "mysql", "postgres"],
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
    id: "url-encoder",
    name: "URL Encoder",
    description: "Encode special characters for URLs or decode them back.",
    icon: Link2,
    category: "encoders",
    href: "/tools/url-encoder",
    keywords: ["url", "uri", "encode", "decode", "percent"],
  },
  {
    id: "html-entities",
    name: "HTML Entities",
    description: "Encode and decode HTML entity characters.",
    icon: Ampersand,
    category: "encoders",
    href: "/tools/html-entities",
    keywords: ["html", "entities", "escape", "unescape"],
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
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "Generate placeholder text, paragraphs, or words.",
    icon: Type,
    category: "generators",
    href: "/tools/lorem-ipsum",
    keywords: ["lorem ipsum", "placeholder", "dummy text"],
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate strong, random passwords.",
    icon: KeyRound,
    category: "generators",
    href: "/tools/password-generator",
    keywords: ["password", "generate", "random", "secure"],
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
  {
    id: "gradient-generator",
    name: "Gradient Generator",
    description: "Design and preview CSS gradients.",
    icon: Blend,
    category: "colors",
    href: "/tools/gradient-generator",
    keywords: ["gradient", "css", "linear", "radial"],
  },
  {
    id: "text-diff",
    name: "Text Diff",
    description: "Compare two texts side by side.",
    icon: GitCompare,
    category: "text",
    href: "/tools/text-diff",
    keywords: ["diff", "compare", "text", "changes"],
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "Convert text between case styles.",
    icon: CaseSensitive,
    category: "text",
    href: "/tools/case-converter",
    keywords: ["case", "camelcase", "snake_case", "kebab-case", "title case"],
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test a regular expression against sample text with live match highlighting.",
    icon: Regex,
    category: "text",
    href: "/tools/regex-tester",
    keywords: ["regex", "regexp", "regular expression", "match", "pattern"],
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode a JWT's header and payload, and verify HMAC signatures.",
    icon: KeySquare,
    category: "encoders",
    href: "/tools/jwt-decoder",
    keywords: ["jwt", "json web token", "decode", "verify", "hmac"],
    popular: true,
  },
  {
    id: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix epoch timestamps to and from human-readable dates.",
    icon: Clock,
    category: "encoders",
    href: "/tools/timestamp-converter",
    keywords: ["timestamp", "epoch", "unix", "date", "time", "convert"],
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes of text or a file.",
    icon: Hash,
    category: "generators",
    href: "/tools/hash-generator",
    keywords: ["hash", "md5", "sha1", "sha256", "sha512", "checksum", "digest"],
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
