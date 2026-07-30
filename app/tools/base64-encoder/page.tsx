import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("base64-encoder");

export default function Page() {
  return <ToolClient />;
}
