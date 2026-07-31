import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("user-agent-parser");

export default function Page() {
  return <ToolClient />;
}
