"use client";

import * as React from "react";
import { TriangleAlert, Upload } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { HASH_ALGORITHMS, hashAllAlgorithms, type HashAlgorithm } from "@/lib/hash";

interface ShareState {
  text: string;
}

export default function HashGeneratorPage() {
  const [text, setText] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [digests, setDigests] = React.useState<Record<HashAlgorithm, string> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const computeFromInput = React.useCallback((input: ArrayBuffer | string) => {
    if (input === "") {
      requestIdRef.current += 1;
      setDigests(null);
      return;
    }
    const requestId = ++requestIdRef.current;
    setError(null);
    hashAllAlgorithms(input)
      .then((result) => {
        if (requestIdRef.current !== requestId) return;
        setDigests(result);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setError("Failed to compute hashes.");
      });
  }, []);

  useShareableState<ShareState>((state) => {
    setFileName(null);
    setText(state.text);
    computeFromInput(state.text);
  });

  function handleTextChange(value: string) {
    setFileName(null);
    setText(value);
    computeFromInput(value);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setText("");
    const buffer = await file.arrayBuffer();
    computeFromInput(buffer);
  }

  function handleClear() {
    requestIdRef.current += 1;
    setText("");
    setFileName(null);
    setDigests(null);
    setError(null);
  }

  const summaryText = digests
    ? HASH_ALGORITHMS.map((algo) => `${algo}: ${digests[algo]}`).join("\n")
    : "";

  return (
    <ToolLayout
      toolId="hash-generator"
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, and SHA-512 hashes of text or a file."
      onClear={handleClear}
      onCopy={() => navigator.clipboard.writeText(summaryText)}
      shareState={{ text } satisfies ShareState}
      sendValue={digests?.["SHA-256"]}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner
          toolId="hash-generator"
          onApply={(value) => {
            setFileName(null);
            setText(value);
          }}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="hash-input">
              Text{fileName ? ` (using file: ${fileName})` : ""}
            </Label>
            <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 text-xs font-medium">
              <Upload className="size-3.5" />
              Hash a file instead
              <input type="file" className="sr-only" onChange={handleFileChange} />
            </label>
          </div>
          <Textarea
            id="hash-input"
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder="Type or paste text to hash..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          {HASH_ALGORITHMS.map((algo) => (
            <div key={algo} className="flex flex-col gap-2">
              <Label>{algo}</Label>
              <div className="border-input flex items-center justify-between rounded-md border px-3 py-2">
                <span className="truncate font-mono text-sm">
                  {digests?.[algo] ?? "—"}
                </span>
                <CopyButton value={digests?.[algo] ?? ""} label={`Copy ${algo}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
