"use client";

import * as React from "react";
import { Download, TriangleAlert, Upload } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { parseSvgDimensions, svgToDataUri } from "@/lib/svg-to-png";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="54" fill="#f59e0b" />
  <path d="M40 60 L55 75 L82 45" stroke="#1c1917" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

interface ShareState {
  svg: string;
  scale: number;
  transparent: boolean;
}

export default function SvgToPngClient() {
  const [svg, setSvg] = React.useState(PLACEHOLDER_SVG);
  const [scale, setScale] = React.useState(2);
  const [transparent, setTransparent] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useShareableState<ShareState>((state) => {
    setSvg(state.svg);
    setScale(state.scale);
    setTransparent(state.transparent);
  });

  const dimensions = parseSvgDimensions(svg);
  const previewSrc = svg.trim() !== "" ? svgToDataUri(svg) : "";

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setSvg(String(reader.result));
    reader.onerror = () => setError("Could not read the selected file.");
    reader.readAsText(file);
  }

  function renderToCanvas(): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(dimensions.width * scale));
        canvas.height = Math.max(1, Math.round(dimensions.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas is not supported in this browser."));
          return;
        }
        if (!transparent) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      image.onerror = () => reject(new Error("Could not render the SVG. Check that it's valid."));
      image.src = svgToDataUri(svg);
    });
  }

  async function downloadPng() {
    try {
      const canvas = await renderToCanvas();
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "image.png";
      link.click();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not convert to PNG");
    }
  }

  return (
    <ToolLayout
      toolId="svg-to-png"
      title="SVG to PNG"
      description="Convert SVG to high-quality PNG. Custom scale (1x-4x), transparent background."
      onClear={() => {
        setSvg("");
        setError(null);
      }}
      shareState={{ svg, scale, transparent } satisfies ShareState}
      sendValue={svg}
    >
      <div className="flex flex-1 flex-col gap-4">
        <IncomingTransferBanner toolId="svg-to-png" onApply={setSvg} />

        <div>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload />
            Upload .svg file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) loadFile(file);
            }}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="svg-input">SVG markup</Label>
            <Textarea
              id="svg-input"
              value={svg}
              onChange={(event) => setSvg(event.target.value)}
              placeholder="Paste SVG markup..."
              className="min-h-[300px] flex-1 font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Preview</Label>
            <div
              className="flex min-h-[300px] flex-1 items-center justify-center rounded-md border p-4"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(#80808022 0% 25%, transparent 0% 50%) 50% / 16px 16px",
              }}
            >
              {previewSrc && (
                // eslint-disable-next-line @next/next/no-img-element -- previewing arbitrary user-supplied SVG markup, not an optimizable static asset
                <img src={previewSrc} alt="SVG preview" className="max-h-64 max-w-full" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2">
            <Label>
              Scale: {scale}x ({Math.round(dimensions.width * scale)}×
              {Math.round(dimensions.height * scale)}px)
            </Label>
            <Slider
              aria-label="Scale"
              min={1}
              max={4}
              step={0.5}
              value={[scale]}
              onValueChange={([value]) => setScale(value)}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch id="svg-transparent" checked={transparent} onCheckedChange={setTransparent} />
            <Label htmlFor="svg-transparent">Transparent background</Label>
          </div>
          <Button onClick={downloadPng} disabled={!svg.trim()}>
            <Download />
            Download PNG
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
