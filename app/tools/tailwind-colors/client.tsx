"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/copy-button";
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";
import { tailwindPalette, type TailwindSwatch } from "@/lib/tailwind-palette-data";

export default function TailwindColorsClient() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<{ family: string; swatch: TailwindSwatch }>(
    () => ({ family: tailwindPalette[0].name, swatch: tailwindPalette[0].swatches[5] })
  );

  const families = tailwindPalette.filter((family) =>
    family.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const className = `bg-${selected.family}-${selected.swatch.shade}`;

  return (
    <ToolLayout
      toolId="tailwind-colors"
      title="Tailwind Colors"
      description="Full Tailwind CSS palette with live component previews. Pick, preview, copy."
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="tailwind-colors-search">Filter colors</Label>
          <Input
            id="tailwind-colors-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. blue, emerald, gray..."
            className="max-w-xs"
          />
        </div>

        <div className="flex flex-col gap-6">
          {families.map((family) => (
            <div key={family.name} className="flex flex-col gap-2">
              <span className="text-sm font-medium capitalize">{family.name}</span>
              <div className="flex flex-wrap gap-2">
                {family.swatches.map((swatch) => {
                  const isSelected = selected.family === family.name && selected.swatch.shade === swatch.shade;
                  return (
                    <button
                      key={swatch.shade}
                      type="button"
                      onClick={() => setSelected({ family: family.name, swatch })}
                      className={cn(
                        "ring-offset-background flex size-12 flex-col items-center justify-center rounded-md text-[10px] font-medium transition-transform hover:scale-105",
                        isSelected && "ring-2 ring-offset-2"
                      )}
                      style={{
                        backgroundColor: swatch.hex,
                        color: swatch.shade >= 500 ? "#fff" : "#000",
                      }}
                      aria-label={`${family.name} ${swatch.shade}`}
                    >
                      {swatch.shade}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {families.length === 0 && (
            <p className="text-muted-foreground text-sm">No colors match &ldquo;{query}&rdquo;.</p>
          )}
        </div>

        <div className="border-input flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center">
          <div
            className="size-20 shrink-0 rounded-md border"
            style={{ backgroundColor: selected.swatch.hex }}
          />
          <div className="flex flex-1 flex-col gap-2">
            <span className="font-medium capitalize">
              {selected.family} {selected.swatch.shade}
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <CopyField label="Class" value={className} />
              <CopyField label="Hex" value={selected.swatch.hex} />
              <CopyField label="OKLCH" value={selected.swatch.oklch} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-md border p-4">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: selected.swatch.hex }}
          >
            Button preview
          </button>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: selected.swatch.hex }}
          >
            Badge preview
          </span>
          <span className="text-sm font-medium" style={{ color: selected.swatch.hex }}>
            Text preview
          </span>
          <div
            className="h-2 w-24 rounded-full"
            style={{ backgroundColor: selected.swatch.hex }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="border-input flex items-center justify-between gap-2 rounded-md border px-2 py-1">
        <span className="truncate font-mono text-xs">{value}</span>
        <CopyButton value={value} label={`Copy ${label}`} className="size-6" />
      </div>
    </div>
  );
}
