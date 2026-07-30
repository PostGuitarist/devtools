"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";

interface ShareState {
  quantity: number;
}

function generateUuids(quantity: number): string[] {
  return Array.from({ length: quantity }, () => crypto.randomUUID());
}

export default function UuidGeneratorPage() {
  const [quantity, setQuantity] = React.useState(5);
  const [uuids, setUuids] = React.useState<string[]>(() => generateUuids(5));

  useShareableState<ShareState>((state) => {
    setQuantity(state.quantity);
    setUuids(generateUuids(state.quantity));
  });

  const output = uuids.join("\n");

  return (
    <ToolLayout
      toolId="uuid-generator"
      title="UUID Generator"
      description="Generate v4 UUIDs in bulk."
      onClear={() => setUuids([])}
      onCopy={() => navigator.clipboard.writeText(output)}
      onDownload={() => downloadTextFile("uuids.txt", output)}
      shareState={{ quantity } satisfies ShareState}
      sendValue={output}
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Label>Quantity: {quantity}</Label>
            <Slider
              aria-label="Quantity"
              min={1}
              max={100}
              step={1}
              value={[quantity]}
              onValueChange={([value]) => setQuantity(value)}
            />
          </div>
          <Button onClick={() => setUuids(generateUuids(quantity))}>
            <RefreshCw />
            Generate
          </Button>
        </div>

        <Textarea
          readOnly
          value={output}
          placeholder="Generated UUIDs will appear here."
          className="min-h-[400px] flex-1 font-mono text-sm"
        />
      </div>
    </ToolLayout>
  );
}
