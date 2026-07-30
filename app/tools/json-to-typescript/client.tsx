"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { jsonToTypeScript } from "@/lib/json-to-typescript";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `{
  "id": 1,
  "name": "Ada Lovelace",
  "active": true,
  "tags": ["mathematician", "writer"],
  "address": {
    "city": "London"
  }
}`;

interface ShareState {
  json: string;
  rootName: string;
  useInterface: boolean;
}

export default function JsonToTypeScriptClient() {
  const { resolvedTheme } = useTheme();
  const [json, setJson] = React.useState(PLACEHOLDER);
  const [rootName, setRootName] = React.useState("Root");
  const [useInterface, setUseInterface] = React.useState(true);

  useShareableState<ShareState>((state) => {
    setJson(state.json);
    setRootName(state.rootName);
    setUseInterface(state.useInterface);
  });

  let output = "";
  let error: string | null = null;
  try {
    output = jsonToTypeScript(json, { rootName, useInterface });
  } catch (err) {
    error = err instanceof Error ? err.message : "Invalid JSON";
  }

  return (
    <ToolLayout
      toolId="json-to-typescript"
      title="JSON to TypeScript"
      description="Convert JSON to TypeScript interfaces and types. Nested objects, arrays, optional fields."
      onCopy={() => navigator.clipboard.writeText(output)}
      onDownload={() => downloadTextFile("types.ts", output)}
      shareState={{ json, rootName, useInterface } satisfies ShareState}
      sendValue={output}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="json-to-typescript" onApply={setJson} />

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="json-to-ts-root-name">Root type name</Label>
            <Input
              id="json-to-ts-root-name"
              value={rootName}
              onChange={(event) => setRootName(event.target.value)}
              className="w-40 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch
              id="json-to-ts-use-interface"
              checked={useInterface}
              onCheckedChange={setUseInterface}
            />
            <Label htmlFor="json-to-ts-use-interface">Use interface (off = type)</Label>
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
            <Label>JSON input</Label>
            <div className="h-[480px] overflow-hidden rounded-md border">
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
            <Label>TypeScript output</Label>
            <div className="h-[480px] overflow-hidden rounded-md border">
              <Editor
                language="typescript"
                value={output}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  readOnly: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
