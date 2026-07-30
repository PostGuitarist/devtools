"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { computeJsonDiff, formatJsonDiffAsText, formatJsonDiffValue } from "@/lib/json-diff";

const PLACEHOLDER_ORIGINAL = `{
  "name": "devtools",
  "version": 1,
  "tags": ["json"]
}`;

const PLACEHOLDER_CHANGED = `{
  "name": "devtools",
  "version": 2,
  "tags": ["json", "diff"]
}`;

interface ShareState {
  original: string;
  changed: string;
}

export default function JsonDiffClient() {
  const [original, setOriginal] = React.useState(PLACEHOLDER_ORIGINAL);
  const [changed, setChanged] = React.useState(PLACEHOLDER_CHANGED);

  useShareableState<ShareState>((state) => {
    setOriginal(state.original);
    setChanged(state.changed);
  });

  const { entries, error } = React.useMemo(() => {
    try {
      return { entries: computeJsonDiff(original, changed), error: null };
    } catch (err) {
      return { entries: [], error: err instanceof Error ? err.message : "Invalid JSON" };
    }
  }, [original, changed]);

  const added = entries.filter((entry) => entry.type === "added").length;
  const removed = entries.filter((entry) => entry.type === "removed").length;
  const changedCount = entries.filter((entry) => entry.type === "changed").length;

  return (
    <ToolLayout
      toolId="json-diff"
      title="JSON Diff"
      description="Compare two JSON documents key by key."
      onClear={() => {
        setOriginal("");
        setChanged("");
      }}
      onCopy={() => navigator.clipboard.writeText(formatJsonDiffAsText(entries))}
      shareState={{ original, changed } satisfies ShareState}
      sendValue={changed}
    >
      <div className="flex flex-1 flex-col gap-4">
        <IncomingTransferBanner toolId="json-diff" onApply={setChanged} />

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="json-diff-original">Original JSON</Label>
            <Textarea
              id="json-diff-original"
              value={original}
              onChange={(event) => setOriginal(event.target.value)}
              placeholder="Paste the original JSON..."
              className="min-h-[220px] font-mono text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="json-diff-changed">Changed JSON</Label>
            <Textarea
              id="json-diff-changed"
              value={changed}
              onChange={(event) => setChanged(event.target.value)}
              placeholder="Paste the changed JSON..."
              className="min-h-[220px] font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Label>Diff</Label>
            {entries.length > 0 && (
              <span className="text-muted-foreground font-mono text-xs">
                <span className="text-green-500">+{added}</span>{" "}
                <span className="text-red-500">-{removed}</span>{" "}
                <span className="text-amber-500">~{changedCount}</span>
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-md border">
            {entries.length > 0 ? (
              <div className="max-h-[420px] overflow-auto font-mono text-sm leading-relaxed">
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      "px-3 py-1 whitespace-pre-wrap",
                      entry.type === "added" && "bg-green-500/15 text-green-400 dark:text-green-400",
                      entry.type === "removed" && "bg-red-500/15 text-red-400 dark:text-red-400",
                      entry.type === "changed" && "bg-amber-500/15 text-amber-400 dark:text-amber-400"
                    )}
                  >
                    <span className="text-muted-foreground/60 select-none">
                      {entry.type === "added" ? "+ " : entry.type === "removed" ? "- " : "~ "}
                    </span>
                    {entry.path}:{" "}
                    {entry.type !== "added" && (
                      <span className="line-through opacity-70">
                        {formatJsonDiffValue(entry.oldValue)}
                      </span>
                    )}
                    {entry.type === "changed" && " -> "}
                    {entry.type !== "removed" && formatJsonDiffValue(entry.newValue)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground p-4 text-sm">
                {error ? "Fix the JSON above to see a diff." : "No differences found."}
              </p>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
