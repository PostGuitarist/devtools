import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("html-to-markdown");

export default function Page() {
  return <ToolClient />;
}
