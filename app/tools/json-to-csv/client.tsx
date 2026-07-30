"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { jsonToCsv } from "@/lib/json-to-csv";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `[
  { "name": "Ada Lovelace", "age": 36, "city": "London" },
  { "name": "Alan Turing", "age": 41, "city": "Maida Vale" }
]`;

interface ShareState {
  json: string;
  delimiter: string;
}

export default function JsonToCsvClient() {
  const { resolvedTheme } = useTheme();
  const [json, setJson] = React.useState(PLACEHOLDER);
  const [delimiter, setDelimiter] = React.useState(",");

  useShareableState<ShareState>((state) => {
    setJson(state.json);
    setDelimiter(state.delimiter);
  });

  let csv = "";
  let error: string | null = null;
  try {
    csv = jsonToCsv(json, { delimiter: delimiter || "," });
  } catch (err) {
    error = err instanceof Error ? err.message : "Invalid JSON";
  }

  return (
    <ToolLayout
      toolId="json-to-csv"
      title="JSON to CSV"
      description="Convert JSON arrays to CSV format. Custom delimiters, download as .csv file."
      onCopy={() => navigator.clipboard.writeText(csv)}
      onDownload={() => downloadTextFile("data.csv", csv)}
      shareState={{ json, delimiter } satisfies ShareState}
      sendValue={csv}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="json-to-csv" onApply={setJson} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="json-to-csv-delimiter">Delimiter</Label>
          <Input
            id="json-to-csv-delimiter"
            value={delimiter}
            onChange={(event) => setDelimiter(event.target.value)}
            className="w-20 font-mono"
            maxLength={1}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>JSON input</Label>
            <div className="h-[420px] overflow-hidden rounded-md border">
              <Editor
                language="json"
                value={json}
                onChange={(value) => setJson(value ?? "")}
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
          <div className="flex flex-col gap-2">
            <Label>CSV output</Label>
            <div className="h-[420px] overflow-hidden rounded-md border">
              <Editor
                language="plaintext"
                value={csv}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  readOnly: true,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
