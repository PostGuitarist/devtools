import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("yaml-json-converter");

export default function Page() {
  return <ToolClient />;
}
