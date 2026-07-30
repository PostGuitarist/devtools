"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  BYTE_ENCODINGS,
  encodedToText,
  textToEncoded,
  type ByteEncoding,
} from "@/lib/binary-text";

interface ShareState {
  text: string;
  encoding: ByteEncoding;
}

export default function BinaryToTextClient() {
  const [text, setText] = React.useState("Hello!");
  const [encoding, setEncoding] = React.useState<ByteEncoding>("binary");
  const [error, setError] = React.useState<string | null>(null);

  useShareableState<ShareState>((state) => {
    setText(state.text);
    setEncoding(state.encoding);
  });

  const encoded = textToEncoded(text, encoding);

  function handleTextChange(value: string) {
    setText(value);
    setError(null);
  }

  function handleEncodedChange(value: string) {
    try {
      setText(encodedToText(value, encoding));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input");
    }
  }

  return (
    <ToolLayout
      toolId="binary-to-text"
      title="Binary to Text"
      description="Convert between text and binary, hex, octal, decimal. ASCII reference table included."
      onClear={() => handleTextChange("")}
      onCopy={() => navigator.clipboard.writeText(encoded)}
      shareState={{ text, encoding } satisfies ShareState}
      sendValue={text}
    >
      <div className="flex flex-1 flex-col gap-4">
        <IncomingTransferBanner toolId="binary-to-text" onApply={setText} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="binary-encoding">Byte encoding</Label>
          <Select value={encoding} onValueChange={(value) => setEncoding(value as ByteEncoding)}>
            <SelectTrigger id="binary-encoding" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BYTE_ENCODINGS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="binary-text">Text</Label>
              <CopyButton value={text} label="Copy text" />
            </div>
            <Textarea
              id="binary-text"
              value={text}
              onChange={(event) => handleTextChange(event.target.value)}
              placeholder="Type text to encode..."
              className="min-h-[300px] flex-1 font-mono text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="binary-encoded">Encoded</Label>
              <CopyButton value={encoded} label="Copy encoded" />
            </div>
            <Textarea
              id="binary-encoded"
              value={encoded}
              onChange={(event) => handleEncodedChange(event.target.value)}
              placeholder="Or paste encoded bytes to decode..."
              className="min-h-[300px] flex-1 font-mono text-sm"
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>

        <AsciiReferenceTable />
      </div>
    </ToolLayout>
  );
}

const REFERENCE_CHARS = Array.from({ length: 95 }, (_, i) => i + 32);

function AsciiReferenceTable() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-muted-foreground w-fit text-sm font-medium underline underline-offset-4"
      >
        {open ? "Hide" : "Show"} ASCII reference table
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto rounded-md border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="p-2">Char</th>
                <th className="p-2">Dec</th>
                <th className="p-2">Hex</th>
                <th className="p-2">Oct</th>
                <th className="p-2">Bin</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_CHARS.map((code) => (
                <tr key={code} className="border-t font-mono">
                  <td className="p-2">{code === 32 ? "(space)" : String.fromCharCode(code)}</td>
                  <td className="p-2">{code}</td>
                  <td className="p-2">{code.toString(16).padStart(2, "0")}</td>
                  <td className="p-2">{code.toString(8).padStart(3, "0")}</td>
                  <td className="p-2">{code.toString(2).padStart(8, "0")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
