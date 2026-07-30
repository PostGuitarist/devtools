import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("lorem-ipsum");

export default function Page() {
  return <ToolClient />;
}
