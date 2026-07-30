import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("image-to-base64");

export default function Page() {
  return <ToolClient />;
}
