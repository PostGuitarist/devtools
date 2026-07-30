import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: false });

/** Renders Markdown to sanitized HTML, safe to render via dangerouslySetInnerHTML. */
export function markdownToHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string;
  // DOMPurify needs a real DOM; Next.js prerenders this "use client" page's
  // static shell in Node, which has none. The browser always sanitizes.
  if (typeof window === "undefined") return rawHtml;
  return DOMPurify.sanitize(rawHtml);
}
