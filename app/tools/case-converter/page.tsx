import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("case-converter");

export default function Page() {
  return <ToolClient />;
}
