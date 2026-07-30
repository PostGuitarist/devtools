"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { validateJson } from "@/lib/json-validator";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `{
  "hello": "world",
  "numbers": [1, 2, 3]
}`;

interface ShareState {
  code: string;
}

export default function JsonValidatorClient() {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = React.useState(PLACEHOLDER);

  useShareableState<ShareState>((state) => setCode(state.code));

  const result = validateJson(code);

  return (
    <ToolLayout
      toolId="json-validator"
      title="JSON Validator"
      description="Validate JSON, find errors with line numbers, and analyze structure in real-time."
      onClear={() => setCode("")}
      shareState={{ code } satisfies ShareState}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="json-validator" onApply={setCode} />

        {result.valid ? (
          <Alert>
            <CheckCircle2 className="text-green-600" />
            <AlertTitle>Valid JSON</AlertTitle>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>
              Line {result.error.line}, column {result.error.column}
            </AlertTitle>
            <AlertDescription>{result.error.message}</AlertDescription>
          </Alert>
        )}

        <div className="h-[400px] overflow-hidden rounded-md border">
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

        {result.valid && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Max depth" value={result.stats.maxDepth} />
            <Stat label="Objects" value={result.stats.objectCount} />
            <Stat label="Arrays" value={result.stats.arrayCount} />
            <Stat label="Keys" value={result.stats.keyCount} />
            <Stat label="Strings" value={result.stats.stringCount} />
            <Stat label="Numbers" value={result.stats.numberCount} />
            <Stat label="Booleans" value={result.stats.booleanCount} />
            <Stat label="Nulls" value={result.stats.nullCount} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-input flex flex-col gap-1 rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}
