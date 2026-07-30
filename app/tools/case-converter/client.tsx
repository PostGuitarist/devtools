"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { CASE_STYLES, convertCase } from "@/lib/case-converter";

interface ShareState {
  input: string;
}

export default function CaseConverterPage() {
  const [input, setInput] = React.useState("hello world example");

  useShareableState<ShareState>((state) => setInput(state.input));

  return (
    <ToolLayout
      toolId="case-converter"
      title="Case Converter"
      description="Convert text between case styles."
      onClear={() => setInput("")}
      shareState={{ input } satisfies ShareState}
      sendValue={convertCase(input, CASE_STYLES[0])}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="case-converter" onApply={setInput} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="case-input">Input</Label>
          <Textarea
            id="case-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type or paste text, camelCase, snake_case, kebab-case..."
            className="min-h-[100px] font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CASE_STYLES.map((style) => {
            const value = convertCase(input, style);
            return (
              <div key={style} className="flex flex-col gap-2">
                <Label>{style}</Label>
                <div className="border-input flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                  <span className="truncate font-mono text-sm">
                    {value || "—"}
                  </span>
                  <CopyButton value={value} label={`Copy ${style}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
