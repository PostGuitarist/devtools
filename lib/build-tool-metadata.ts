import type { Metadata } from "next";

import { getToolById } from "@/lib/tools-registry";

const SITE_NAME = "DevTools";

export function buildToolMetadata(toolId: string): Metadata {
  const tool = getToolById(toolId);
  if (!tool) return {};

  const title = `${tool.name} — ${SITE_NAME}`;

  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: tool.href },
    openGraph: {
      title,
      description: tool.description,
      url: tool.href,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: tool.description,
    },
  };
}
