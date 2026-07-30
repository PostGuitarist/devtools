import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("curl-command-builder");

export default function Page() {
  return <ToolClient />;
}
