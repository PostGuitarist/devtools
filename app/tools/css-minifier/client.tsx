"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { AlignLeft, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { beautifyCss, computeCssSizeStats, minifyCss } from "@/lib/css-formatter";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `.card {
  display: flex;
  padding: 1rem;
  border-radius: 0.5rem;
}

.card__title {
  font-weight: 600;
  color: #111827;
}`;

interface ShareState {
  code: string;
}

export default function CssMinifierClient() {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = React.useState(PLACEHOLDER);
  const [original, setOriginal] = React.useState(PLACEHOLDER);

  useShareableState<ShareState>((state) => {
    setCode(state.code);
    setOriginal(state.code);
  });

  const stats = computeCssSizeStats(original, code);

  function minify() {
    setOriginal(code);
    setCode(minifyCss(code));
  }

  function beautify() {
    setOriginal(code);
    setCode(beautifyCss(code));
  }

  function handleChange(value: string) {
    setCode(value);
    setOriginal(value);
  }

  return (
    <ToolLayout
      toolId="css-minifier"
      title="CSS Minifier & Beautifier"
      description="Minify CSS for production or beautify for readability. Shows size savings and stats."
      onCopy={() => navigator.clipboard.writeText(code)}
      onDownload={() => downloadTextFile("styles.css", code)}
      shareState={{ code } satisfies ShareState}
      sendValue={code}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={beautify}>
            <AlignLeft />
            Beautify
          </Button>
          <Button variant="outline" size="sm" onClick={minify}>
            <Minus />
            Minify
          </Button>
        </>
      }
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="css-minifier" onApply={handleChange} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Original size" value={`${stats.originalBytes} B`} />
          <Stat label="Current size" value={`${stats.resultBytes} B`} />
          <Stat label="Saved" value={`${stats.savedBytes} B`} />
          <Stat label="Reduction" value={`${stats.savedPercent.toFixed(1)}%`} />
        </div>

        <div className="h-[500px] overflow-hidden rounded-md border">
          <Editor
            language="css"
            value={code}
            onChange={(value) => handleChange(value ?? "")}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-input flex flex-col gap-1 rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}
