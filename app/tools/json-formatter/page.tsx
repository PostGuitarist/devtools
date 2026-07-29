"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { AlignLeft, Minus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToolLayout } from "@/components/tool-layout";
import { downloadTextFile } from "@/lib/download-text-file";

// Load Monaco's assets from our own /public/vs instead of the jsdelivr CDN,
// so the editor works offline and nothing is fetched from a third party.
loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `{
  "hello": "world"
}`;

export default function JsonFormatterPage() {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = React.useState(PLACEHOLDER);
  const [error, setError] = React.useState<string | null>(null);

  function format() {
    try {
      const parsed = JSON.parse(code);
      setCode(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }

  function minify() {
    try {
      const parsed = JSON.parse(code);
      setCode(JSON.stringify(parsed));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }

  return (
    <ToolLayout
      toolId="json-formatter"
      title="JSON Formatter"
      description="Format, minify, and validate JSON."
      onClear={() => {
        setCode("");
        setError(null);
      }}
      onCopy={() => navigator.clipboard.writeText(code)}
      onDownload={() => downloadTextFile("data.json", code)}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={format}>
            <AlignLeft />
            Format
          </Button>
          <Button variant="outline" size="sm" onClick={minify}>
            <Minus />
            Minify
          </Button>
        </>
      }
    >
      <div className="flex flex-1 flex-col gap-3">
        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="h-[560px] overflow-hidden rounded-md border">
          <Editor
            language="json"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
