import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("number-base-converter");

export default function Page() {
  return <ToolClient />;
}
