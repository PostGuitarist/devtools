import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("word-counter");

export default function Page() {
  return <ToolClient />;
}
