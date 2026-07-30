import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});
turndownService.use(gfm);

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}
