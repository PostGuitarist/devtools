"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "@/components/tools/copy-button";
import { ToolLayout } from "@/components/tool-layout";
import {
  formatHsl,
  formatRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  type Rgb,
} from "@/lib/color";

const DEFAULT_INPUT = "#6366f1";

export default function ColorConverterPage() {
  const [input, setInput] = React.useState(DEFAULT_INPUT);
  const rgb = React.useMemo<Rgb | null>(() => parseColor(input), [input]);

  const hex = rgb ? rgbToHex(rgb) : null;
  const rgbString = rgb ? formatRgb(rgb) : null;
  const hslString = rgb ? formatHsl(rgbToHsl(rgb)) : null;
  const error = input.trim() !== "" && !rgb ? "Unrecognized color format." : null;

  return (
    <ToolLayout
      toolId="color-converter"
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL color formats."
      onClear={() => setInput("")}
      onCopy={() => hex && navigator.clipboard.writeText(hex)}
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="border-border size-16 shrink-0 rounded-lg border"
            style={{ backgroundColor: rgb ? rgbString ?? undefined : undefined }}
          />
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Label htmlFor="color-input">HEX, RGB, or HSL</Label>
            <Input
              id="color-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="#6366f1, rgb(99, 102, 241), hsl(239, 84%, 67%)"
              className="font-mono"
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorField label="HEX" value={hex} />
          <ColorField label="RGB" value={rgbString} />
          <ColorField label="HSL" value={hslString} />
        </div>
      </div>
    </ToolLayout>
  );
}

function ColorField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="border-input flex items-center justify-between rounded-md border px-3 py-2">
        <span className="truncate font-mono text-sm">{value ?? "—"}</span>
        <CopyButton value={value ?? ""} label={`Copy ${label}`} />
      </div>
    </div>
  );
}
