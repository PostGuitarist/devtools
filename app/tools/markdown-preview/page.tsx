import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("markdown-preview");

export default function Page() {
  return <ToolClient />;
}
