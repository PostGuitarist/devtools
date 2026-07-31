"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { ArrowLeftRight, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { convertEnv, ENV_FORMATS, type EnvFormat } from "@/lib/env-converter";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `# Database
DATABASE_URL="postgres://user:pass@localhost:5432/app"
PORT=5432

# Feature flags
ENABLE_SIGNUP=true
GREETING="hello world"`;

const EDITOR_LANGUAGES: Record<EnvFormat, string> = {
  env: "ini",
  json: "json",
  yaml: "yaml",
};

const FILE_NAMES: Record<EnvFormat, string> = {
  env: ".env",
  json: "env.json",
  yaml: "env.yaml",
};

interface ShareState {
  source: string;
  from: EnvFormat;
  to: EnvFormat;
}

export default function EnvConverterClient() {
  const { resolvedTheme } = useTheme();
  const [source, setSource] = React.useState(PLACEHOLDER);
  const [from, setFrom] = React.useState<EnvFormat>("env");
  const [to, setTo] = React.useState<EnvFormat>("json");

  useShareableState<ShareState>((state) => {
    setSource(state.source);
    setFrom(state.from);
    setTo(state.to);
  });

  let output = "";
  let error: string | null = null;
  try {
    output = convertEnv(source, from, to);
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not convert the input.";
  }

  function swap() {
    // Swapping keeps the pipeline honest by feeding the current output back in.
    const nextSource = error ? source : output;
    setSource(nextSource);
    setFrom(to);
    setTo(from);
  }

  const formatName = (format: EnvFormat) =>
    ENV_FORMATS.find((entry) => entry.id === format)?.name ?? format;

  return (
    <ToolLayout
      toolId="env-converter"
      title=".env Converter"
      description="Convert between .env, JSON, and YAML formats."
      onClear={() => setSource("")}
      onCopy={() => navigator.clipboard.writeText(output)}
      onDownload={() => downloadTextFile(FILE_NAMES[to], output)}
      shareState={{ source, from, to } satisfies ShareState}
      sendValue={output}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="env-converter" onApply={setSource} />

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="env-from">From</Label>
            <Select value={from} onValueChange={(value) => setFrom(value as EnvFormat)}>
              <SelectTrigger id="env-from" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENV_FORMATS.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="icon" aria-label="Swap formats" onClick={swap}>
            <ArrowLeftRight />
          </Button>

          <div className="flex flex-col gap-2">
            <Label htmlFor="env-to">To</Label>
            <Select value={to} onValueChange={(value) => setTo(value as EnvFormat)}>
              <SelectTrigger id="env-to" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENV_FORMATS.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <div className="flex items-center justify-between">
              <Label>{formatName(from)} input</Label>
              <CopyButton value={source} label="Copy input" />
            </div>
            <div className="h-[460px] overflow-hidden rounded-md border">
              <Editor
                language={EDITOR_LANGUAGES[from]}
                path={`input.${from}`}
                value={source}
                onChange={(value) => setSource(value ?? "")}
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
              <Label>{formatName(to)} output</Label>
              <CopyButton value={output} label="Copy output" />
            </div>
            <div className="h-[460px] overflow-hidden rounded-md border">
              <Editor
                language={EDITOR_LANGUAGES[to]}
                path={`output.${to}`}
                value={output}
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

        <p className="text-muted-foreground text-xs">
          Values are treated as strings, the way a process environment does. Nested JSON or YAML
          objects are serialised back to JSON so nothing is silently dropped.
        </p>
      </div>
    </ToolLayout>
  );
}
