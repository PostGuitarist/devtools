"use client";

import * as React from "react";
import { TriangleAlert, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import {
  buildCssBackground,
  buildImgTag,
  estimateDecodedByteSize,
  formatByteSize,
  parseDataUri,
} from "@/lib/image-base64";

export default function ImageToBase64Client() {
  const [dataUri, setDataUri] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setDataUri(String(reader.result));
      setFileName(file.name);
      setError(null);
    };
    reader.onerror = () => setError("Could not read the selected file.");
    reader.readAsDataURL(file);
  }

  function handleDataUriChange(value: string) {
    setDataUri(value);
    setFileName("");
    if (value.trim() === "") {
      setError(null);
      return;
    }
    try {
      parseDataUri(value);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid data URI");
    }
  }

  let mimeType = "";
  let byteSize = 0;
  let previewSrc = "";
  if (dataUri.trim() !== "" && !error) {
    try {
      const parsed = parseDataUri(dataUri);
      mimeType = parsed.mimeType;
      byteSize = estimateDecodedByteSize(parsed.base64);
      previewSrc = dataUri;
    } catch {
      // handleDataUriChange already surfaces the error via state.
    }
  }

  return (
    <ToolLayout
      toolId="image-to-base64"
      title="Image to Base64"
      description="Encode images to Base64 data URIs. Decode Base64 back to images. HTML & CSS snippets."
      onClear={() => {
        setDataUri("");
        setFileName("");
        setError(null);
      }}
      onCopy={() => navigator.clipboard.writeText(dataUri)}
      sendValue={dataUri}
    >
      <div className="flex flex-1 flex-col gap-4">
        <IncomingTransferBanner toolId="image-to-base64" onApply={handleDataUriChange} />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) loadFile(file);
          }}
          className={cn(
            "border-input flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors",
            isDragging && "border-primary bg-accent"
          )}
        >
          <Upload className="text-muted-foreground size-6" />
          <span className="text-sm font-medium">Click to upload or drag and drop an image</span>
          {fileName && <span className="text-muted-foreground text-xs">{fileName}</span>}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) loadFile(file);
            }}
          />
        </button>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {previewSrc && (
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element -- previewing an arbitrary user-supplied data URI, not an optimizable static asset */}
            <img
              src={previewSrc}
              alt="Preview"
              className="border-input max-h-48 max-w-48 rounded-md border object-contain"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <Stat label="MIME type" value={mimeType} />
              <Stat label="Decoded size" value={formatByteSize(byteSize)} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="image-base64-output">Base64 data URI</Label>
            <CopyButton value={dataUri} label="Copy data URI" />
          </div>
          <Textarea
            id="image-base64-output"
            value={dataUri}
            onChange={(event) => handleDataUriChange(event.target.value)}
            placeholder="Upload an image above, or paste a data:image/...;base64,... URI to decode..."
            className="min-h-[140px] font-mono text-xs"
          />
        </div>

        {previewSrc && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>HTML</Label>
                <CopyButton value={buildImgTag(dataUri)} label="Copy HTML snippet" />
              </div>
              <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                {buildImgTag(dataUri)}
              </pre>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>CSS</Label>
                <CopyButton value={buildCssBackground(dataUri)} label="Copy CSS snippet" />
              </div>
              <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs whitespace-pre-wrap">
                {buildCssBackground(dataUri)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-input flex flex-col gap-1 rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}
