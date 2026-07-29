"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "@/components/tools/copy-button";
import { ToolLayout } from "@/components/tool-layout";
import { decodeBase64, encodeBase64 } from "@/lib/base64";

export default function Base64EncoderPage() {
  const [plainText, setPlainText] = React.useState("");
  const [base64Text, setBase64Text] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function handlePlainTextChange(value: string) {
    setPlainText(value);
    setBase64Text(encodeBase64(value));
    setError(null);
  }

  function handleBase64TextChange(value: string) {
    setBase64Text(value);
    if (value === "") {
      setPlainText("");
      setError(null);
      return;
    }
    try {
      setPlainText(decodeBase64(value));
      setError(null);
    } catch {
      setError("Invalid Base64 string.");
    }
  }

  return (
    <ToolLayout
      toolId="base64-encoder"
      title="Base64 Encoder"
      description="Encode and decode Base64 strings instantly."
      onClear={() => {
        setPlainText("");
        setBase64Text("");
        setError(null);
      }}
      onCopy={() => navigator.clipboard.writeText(base64Text)}
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
              placeholder="Type text to encode..."
              className="min-h-[350px] flex-1 font-mono text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="base64-text">Base64</Label>
              <CopyButton value={base64Text} label="Copy Base64" />
            </div>
            <Textarea
              id="base64-text"
              value={base64Text}
              onChange={(event) => handleBase64TextChange(event.target.value)}
              placeholder="Or paste Base64 to decode..."
              className="min-h-[350px] flex-1 font-mono text-sm"
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
