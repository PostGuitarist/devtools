"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/tools/copy-button";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { buildGradientCss, type GradientStop, type GradientType } from "@/lib/gradient";

const MAX_STOPS = 5;
const MIN_STOPS = 2;
const DEFAULT_STOPS: GradientStop[] = [
  { id: "1", color: "#6366f1" },
  { id: "2", color: "#f59e0b" },
];

interface ShareState {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
}

export default function GradientGeneratorPage() {
  const [type, setType] = React.useState<GradientType>("linear");
  const [angle, setAngle] = React.useState(90);
  const [stops, setStops] = React.useState<GradientStop[]>(DEFAULT_STOPS);
  const nextId = React.useRef(3);

  useShareableState<ShareState>((state) => {
    setType(state.type);
    setAngle(state.angle);
    setStops(state.stops);
    nextId.current = state.stops.length + 1;
  });

  const css = buildGradientCss(type, angle, stops);
  const declaration = `background: ${css};`;

  function updateStopColor(id: string, color: string) {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  }

  function addStop() {
    if (stops.length >= MAX_STOPS) return;
    setStops((prev) => [...prev, { id: String(nextId.current++), color: "#ffffff" }]);
  }

  function removeStop(id: string) {
    if (stops.length <= MIN_STOPS) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <ToolLayout
      toolId="gradient-generator"
      title="Gradient Generator"
      description="Design and preview CSS gradients."
      onClear={() => {
        setType("linear");
        setAngle(90);
        setStops(DEFAULT_STOPS);
      }}
      onCopy={() => navigator.clipboard.writeText(declaration)}
      shareState={{ type, angle, stops } satisfies ShareState}
      sendValue={declaration}
    >
      <div className="flex flex-1 flex-col gap-6">
        <div
          className="h-48 w-full rounded-2xl border sm:h-64"
          style={{ background: css }}
        />

        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="gradient-type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as GradientType)}>
              <SelectTrigger id="gradient-type" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "linear" && (
            <div className="flex w-56 flex-col gap-2">
              <Label>Angle: {angle}&deg;</Label>
              <Slider
                aria-label="Angle"
                min={0}
                max={360}
                step={1}
                value={[angle]}
                onValueChange={([value]) => setAngle(value)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Colors</Label>
          <div className="flex flex-wrap gap-3">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-1.5">
                <div className="border-input relative size-9 shrink-0 overflow-hidden rounded-md border">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(event) => updateStopColor(stop.id, event.target.value)}
                    aria-label={`Color stop ${stop.color}`}
                    className="absolute -top-1 -left-1 size-11 cursor-pointer border-none p-0"
                  />
                </div>
                <Input
                  value={stop.color}
                  onChange={(event) => updateStopColor(stop.id, event.target.value)}
                  aria-label="Color stop hex value"
                  className="w-24 font-mono text-sm"
                />
                {stops.length > MIN_STOPS && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Remove color"
                    onClick={() => removeStop(stop.id)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {stops.length < MAX_STOPS && (
              <Button variant="outline" size="sm" onClick={addStop}>
                <Plus />
                Add color
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>CSS</Label>
          <div className="border-input flex items-center justify-between gap-2 rounded-md border px-3 py-2">
            <code className="truncate font-mono text-sm">{declaration}</code>
            <CopyButton value={declaration} label="Copy CSS" />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
