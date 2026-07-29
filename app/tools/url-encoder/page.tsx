"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "@/components/tools/copy-button";
import { ToolLayout } from "@/components/tool-layout";

export default function UrlEncoderPage() {
  const [plainText, setPlainText] = React.useState("");
  const [encodedText, setEncodedText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function handlePlainTextChange(value: string) {
    setPlainText(value);
    setEncodedText(encodeURIComponent(value));
    setError(null);
  }

  function handleEncodedTextChange(value: string) {
    setEncodedText(value);
    if (value === "") {
      setPlainText("");
      setError(null);
      return;
    }
    try {
      setPlainText(decodeURIComponent(value));
      setError(null);
    } catch {
      setError("Invalid percent-encoded string.");
    }
  }

  return (
    <ToolLayout
      toolId="url-encoder"
      title="URL Encoder"
      description="Encode special characters for URLs or decode percent-encoded strings."
      onClear={() => {
        setPlainText("");
        setEncodedText("");
        setError(null);
      }}
      onCopy={() => navigator.clipboard.writeText(encodedText)}
    >
      <div className="flex flex-1 flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="plain-text">Plain text</Label>
              <CopyButton value={plainText} label="Copy plain text" />
            </div>
            <Textarea
              id="plain-text"
              value={plainText}
              onChange={(event) => handlePlainTextChange(event.target.value)}
              placeholder="Type text or a URL to encode..."
              className="min-h-[350px] flex-1 font-mono text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="encoded-text">Encoded</Label>
              <CopyButton value={encodedText} label="Copy encoded text" />
            </div>
            <Textarea
              id="encoded-text"
              value={encodedText}
              onChange={(event) => handleEncodedTextChange(event.target.value)}
              placeholder="Or paste a percent-encoded string to decode..."
              className="min-h-[350px] flex-1 font-mono text-sm"
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
