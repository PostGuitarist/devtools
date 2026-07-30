import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("jwt-decoder");

export default function Page() {
  return <ToolClient />;
}
