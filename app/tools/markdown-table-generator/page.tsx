import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("markdown-table-generator");

export default function Page() {
  return <ToolClient />;
}
