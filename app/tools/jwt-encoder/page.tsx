import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("jwt-encoder");

export default function Page() {
  return <ToolClient />;
}
