"use client";

import * as React from "react";
import { Plus, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import {
  buildCurlCommand,
  parseCurlCommand,
  type CurlHeader,
  type CurlRequest,
} from "@/lib/curl-command-builder";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const DEFAULT_REQUEST: CurlRequest = {
  method: "POST",
  url: "https://api.example.com/users",
  headers: [{ key: "Content-Type", value: "application/json" }],
  body: '{\n  "name": "Ada"\n}',
};

type ShareState = CurlRequest;

export default function CurlCommandBuilderClient() {
  const [request, setRequest] = React.useState<CurlRequest>(DEFAULT_REQUEST);
  const [command, setCommand] = React.useState(() => buildCurlCommand(DEFAULT_REQUEST));
  const [error, setError] = React.useState<string | null>(null);

  useShareableState<ShareState>((state) => {
    setRequest(state);
    setCommand(buildCurlCommand(state));
    setError(null);
  });

  function updateRequest(patch: Partial<CurlRequest>) {
    const next = { ...request, ...patch };
    setRequest(next);
    setCommand(buildCurlCommand(next));
    setError(null);
  }

  function updateHeader(index: number, patch: Partial<CurlHeader>) {
    updateRequest({
      headers: request.headers.map((header, i) => (i === index ? { ...header, ...patch } : header)),
    });
  }

  function addHeader() {
    updateRequest({ headers: [...request.headers, { key: "", value: "" }] });
  }

  function removeHeader(index: number) {
    updateRequest({ headers: request.headers.filter((_, i) => i !== index) });
  }

  function handleCommandChange(value: string) {
    setCommand(value);
    try {
      const parsed = parseCurlCommand(value);
      setRequest(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid curl command");
    }
  }

  return (
    <ToolLayout
      toolId="curl-command-builder"
      title="curl Command Builder"
      description="Build a curl command from method, headers, and body — or paste one to break it apart."
      onClear={() => updateRequest({ url: "", headers: [], body: "" })}
      onCopy={() => navigator.clipboard.writeText(command)}
      shareState={request satisfies ShareState}
      sendValue={command}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="curl-command-builder" onApply={handleCommandChange} />

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-col gap-2">
                <Label htmlFor="curl-method">Method</Label>
                <Select value={request.method} onValueChange={(value) => updateRequest({ method: value })}>
                  <SelectTrigger id="curl-method" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="curl-url">URL</Label>
                <Input
                  id="curl-url"
                  value={request.url}
                  onChange={(event) => updateRequest({ url: event.target.value })}
                  placeholder="https://api.example.com/users"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Headers</Label>
                <Button variant="outline" size="sm" onClick={addHeader}>
                  <Plus />
                  Add header
                </Button>
              </div>
              {request.headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={header.key}
                    onChange={(event) => updateHeader(index, { key: event.target.value })}
                    aria-label={`Header ${index + 1} name`}
                    placeholder="Header-Name"
                    className="max-w-56 font-mono text-sm"
                  />
                  <Input
                    value={header.value}
                    onChange={(event) => updateHeader(index, { value: event.target.value })}
                    aria-label={`Header ${index + 1} value`}
                    placeholder="value"
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={`Remove header ${index + 1}`}
                    onClick={() => removeHeader(index)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="curl-body">Body</Label>
              <Textarea
                id="curl-body"
                value={request.body}
                onChange={(event) => updateRequest({ body: event.target.value })}
                placeholder="Request body (sent as -d, implies POST if no method is set)..."
                className="min-h-[120px] flex-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-center justify-between">
              <Label htmlFor="curl-command">curl command</Label>
              <CopyButton value={command} label="Copy command" />
            </div>
            <Textarea
              id="curl-command"
              value={command}
              onChange={(event) => handleCommandChange(event.target.value)}
              className="min-h-[280px] font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
