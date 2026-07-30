"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  COMMON_BASES,
  formatBigIntInBase,
  MAX_BASE,
  MIN_BASE,
  parseBigIntInBase,
} from "@/lib/number-base";

interface ShareState {
  value: string;
  base: number;
}

export default function NumberBaseConverterClient() {
  const [value, setValue] = React.useState("42");
  const [base, setBase] = React.useState(10);
  const [customBase, setCustomBase] = React.useState(36);

  useShareableState<ShareState>((state) => {
    setValue(state.value);
    setBase(state.base);
  });

  let parsed: bigint | null = null;
  let error: string | null = null;
  try {
    parsed = value.trim() === "" ? null : parseBigIntInBase(value, base);
  } catch (err) {
    error = err instanceof Error ? err.message : "Invalid number";
  }

  function applyTransfer(incoming: string) {
    setValue(incoming.trim());
  }

  return (
    <ToolLayout
      toolId="number-base-converter"
      title="Number Base Converter"
      description="Convert between binary, octal, decimal, and hexadecimal. BigInt support."
      onClear={() => setValue("")}
      shareState={{ value, base } satisfies ShareState}
      sendValue={parsed !== null ? parsed.toString() : undefined}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="number-base-converter" onApply={applyTransfer} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="number-base-input">Value</Label>
                <Input
                  id="number-base-input"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Enter a number..."
                  className="font-mono"
                  aria-invalid={error ? true : undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="number-base-from">From base</Label>
                <Select value={String(base)} onValueChange={(next) => setBase(Number(next))}>
                  <SelectTrigger id="number-base-from" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_BASES.map(({ base: b, label }) => (
                      <SelectItem key={b} value={String(b)}>
                        {label} ({b})
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="number-base-custom">
                Custom base ({MIN_BASE}–{MAX_BASE})
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="number-base-custom"
                  type="number"
                  min={MIN_BASE}
                  max={MAX_BASE}
                  value={customBase}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) {
                      setCustomBase(Math.min(MAX_BASE, Math.max(MIN_BASE, next)));
                    }
                  }}
                  className="w-24"
                />
                <div className="border-input flex flex-1 items-center justify-between gap-2 rounded-md border px-3 py-2">
                  <span className="truncate font-mono text-sm">
                    {parsed !== null ? formatBigIntInBase(parsed, customBase) : "—"}
                  </span>
                  <CopyButton
                    value={parsed !== null ? formatBigIntInBase(parsed, customBase) : ""}
                    label="Copy custom base result"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:sticky lg:top-6 lg:self-start">
            {COMMON_BASES.map(({ base: b, label }) => {
              const result = parsed !== null ? formatBigIntInBase(parsed, b) : "";
              return (
                <div key={b} className="flex flex-col gap-2">
                  <Label>
                    {label} (base {b})
                  </Label>
                  <div className="border-input flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                    <span className="truncate font-mono text-sm">{result || "—"}</span>
                    <CopyButton value={result} label={`Copy ${label}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
