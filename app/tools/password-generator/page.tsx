import { buildToolMetadata } from "@/lib/build-tool-metadata";
import ToolClient from "./client";

export const metadata = buildToolMetadata("password-generator");

export default function Page() {
  return <ToolClient />;
}
