import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("binary-to-text");

export default function Page() {
  return <ToolClient />;
}
