"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { jsonToYaml, yamlToJson } from "@/lib/yaml-json";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER_YAML = `name: devtools
version: 1
tags:
  - json
  - yaml
`;

interface ShareState {
  yaml: string;
}

export default function YamlJsonConverterClient() {
  const { resolvedTheme } = useTheme();
  const [yamlText, setYamlText] = React.useState(PLACEHOLDER_YAML);
  const [jsonText, setJsonText] = React.useState(() => yamlToJson(PLACEHOLDER_YAML));
  const [error, setError] = React.useState<string | null>(null);

  useShareableState<ShareState>((state) => handleYamlChange(state.yaml));

  function handleYamlChange(value: string) {
    setYamlText(value);
    try {
      setJsonText(yamlToJson(value));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid YAML");
    }
  }

  function handleJsonChange(value: string) {
    setJsonText(value);
    if (value.trim() === "") {
      setYamlText("");
      setError(null);
      return;
    }
    try {
      setYamlText(jsonToYaml(value));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }

  return (
    <ToolLayout
      toolId="yaml-json-converter"
      title="YAML ↔ JSON Converter"
      description="Convert between YAML and JSON instantly. Supports Kubernetes, Docker Compose, GitHub Actions."
      onClear={() => {
        setYamlText("");
        setJsonText("");
        setError(null);
      }}
      onDownload={() => downloadTextFile("data.yaml", yamlText)}
      shareState={{ yaml: yamlText } satisfies ShareState}
      sendValue={jsonText}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="yaml-json-converter" onApply={handleYamlChange} />

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>YAML</Label>
              <CopyButton value={yamlText} label="Copy YAML" />
            </div>
            <div className="h-[480px] overflow-hidden rounded-md border">
              <Editor
                language="yaml"
                value={yamlText}
                onChange={(value) => handleYamlChange(value ?? "")}
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
              <Label>JSON</Label>
              <CopyButton value={jsonText} label="Copy JSON" />
            </div>
            <div className="h-[480px] overflow-hidden rounded-md border">
              <Editor
                language="json"
                value={jsonText}
                onChange={(value) => handleJsonChange(value ?? "")}
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
        </div>
      </div>
    </ToolLayout>
  );
}
