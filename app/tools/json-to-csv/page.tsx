import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("json-to-csv");

export default function Page() {
  return <ToolClient />;
}
