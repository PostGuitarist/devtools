"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { csvToJson } from "@/lib/csv-to-json";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `name,age,city
Ada Lovelace,36,London
Alan Turing,41,Maida Vale`;

const DELIMITERS = [
  { value: ",", label: "Comma  ,  (CSV)" },
  { value: "\t", label: "Tab  →  (TSV)" },
  { value: ";", label: "Semicolon  ;" },
  { value: "|", label: "Pipe  |" },
];

interface ShareState {
  csv: string;
  delimiter: string;
  header: boolean;
  inferTypes: boolean;
}

export default function CsvToJsonClient() {
  const { resolvedTheme } = useTheme();
  const [csv, setCsv] = React.useState(PLACEHOLDER);
  const [delimiter, setDelimiter] = React.useState(",");
  const [header, setHeader] = React.useState(true);
  const [inferTypes, setInferTypes] = React.useState(true);

  useShareableState<ShareState>((state) => {
    setCsv(state.csv);
    setDelimiter(state.delimiter);
    setHeader(state.header);
    setInferTypes(state.inferTypes);
  });

  let json = "";
  let error: string | null = null;
  try {
    json = csvToJson(csv, { delimiter, header, inferTypes });
  } catch (err) {
    error = err instanceof Error ? err.message : "Invalid CSV";
  }

  const rowCount = React.useMemo(() => {
    try {
      const parsed = JSON.parse(json || "[]");
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, [json]);

  return (
    <ToolLayout
      toolId="csv-to-json"
      title="CSV to JSON"
      description="Convert CSV data to a JSON array of objects."
      onClear={() => setCsv("")}
      onCopy={() => navigator.clipboard.writeText(json)}
      onDownload={() => downloadTextFile("data.json", json)}
      shareState={{ csv, delimiter, header, inferTypes } satisfies ShareState}
      sendValue={json}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="csv-to-json" onApply={setCsv} />

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="csv-to-json-delimiter">Delimiter</Label>
            <Select value={delimiter} onValueChange={setDelimiter}>
              <SelectTrigger id="csv-to-json-delimiter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIMITERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="csv-to-json-header" checked={header} onCheckedChange={setHeader} />
            <Label htmlFor="csv-to-json-header">First row is a header</Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="csv-to-json-infer"
              checked={inferTypes}
              onCheckedChange={setInferTypes}
            />
            <Label htmlFor="csv-to-json-infer">Infer numbers &amp; booleans</Label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>CSV input</Label>
            <div className="h-[420px] overflow-hidden rounded-md border">
              <Editor
                language="plaintext"
                value={csv}
                onChange={(value) => setCsv(value ?? "")}
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
            <div className="flex items-center justify-between">
              <Label>JSON output</Label>
              <span className="text-muted-foreground text-xs">
                {rowCount} {rowCount === 1 ? "record" : "records"}
              </span>
            </div>
            <div className="h-[420px] overflow-hidden rounded-md border">
              <Editor
                language="json"
                value={json}
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
