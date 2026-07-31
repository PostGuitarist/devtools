import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("csv-to-json");

export default function Page() {
  return <ToolClient />;
}
