"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { AlignLeft, Minus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { formatXml, minifyXml } from "@/lib/xml";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `<note>
  <to>World</to>
  <from>DevTools</from>
  <body>Hello!</body>
</note>`;

interface ShareState {
  code: string;
}

export default function XmlFormatterPage() {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = React.useState(PLACEHOLDER);
  const [error, setError] = React.useState<string | null>(null);

  useShareableState<ShareState>((state) => setCode(state.code));

  function format() {
    try {
      setCode(formatXml(code));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid XML");
    }
  }

  function minify() {
    try {
      setCode(minifyXml(code));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid XML");
    }
  }

  return (
    <ToolLayout
      toolId="xml-formatter"
      title="XML Formatter"
      description="Format and validate XML documents."
      onClear={() => {
        setCode("");
        setError(null);
      }}
      onCopy={() => navigator.clipboard.writeText(code)}
      onDownload={() => downloadTextFile("data.xml", code)}
      shareState={{ code } satisfies ShareState}
      sendValue={code}
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
        <IncomingTransferBanner toolId="xml-formatter" onApply={setCode} />
        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="h-[560px] overflow-hidden rounded-md border">
          <Editor
            language="xml"
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
