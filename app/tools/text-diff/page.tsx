"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolLayout } from "@/components/tool-layout";
import { computeLineDiff, formatDiffAsText } from "@/lib/text-diff";

export default function TextDiffPage() {
  const [original, setOriginal] = React.useState("");
  const [changed, setChanged] = React.useState("");

  const diffLines = React.useMemo(
    () => computeLineDiff(original, changed),
    [original, changed]
  );

  const additions = diffLines.filter((line) => line.type === "added").length;
  const deletions = diffLines.filter((line) => line.type === "removed").length;
  const hasDiff = original !== "" || changed !== "";

  return (
    <ToolLayout
      toolId="text-diff"
      title="Text Diff"
      description="Compare two texts side by side."
      onClear={() => {
        setOriginal("");
        setChanged("");
      }}
      onCopy={() => navigator.clipboard.writeText(formatDiffAsText(diffLines))}
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="original">Original</Label>
            <Textarea
              id="original"
              value={original}
              onChange={(event) => setOriginal(event.target.value)}
              placeholder="Paste the original text..."
              className="min-h-[180px] font-mono text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="changed">Changed</Label>
            <Textarea
              id="changed"
              value={changed}
              onChange={(event) => setChanged(event.target.value)}
              placeholder="Paste the changed text..."
              className="min-h-[180px] font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Label>Diff</Label>
            {hasDiff && (
              <span className="text-muted-foreground font-mono text-xs">
                <span className="text-green-500">+{additions}</span>{" "}
                <span className="text-red-500">-{deletions}</span>
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-md border">
            {hasDiff ? (
              <pre className="max-h-[420px] overflow-auto font-mono text-sm leading-relaxed">
                {diffLines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      "px-3 whitespace-pre-wrap",
                      line.type === "added" &&
                        "bg-green-500/15 text-green-400 dark:text-green-400",
                      line.type === "removed" &&
                        "bg-red-500/15 text-red-400 dark:text-red-400"
                    )}
                  >
                    <span className="text-muted-foreground/60 select-none">
                      {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
                    </span>
                    {line.text || " "}
                  </div>
                ))}
              </pre>
            ) : (
              <p className="text-muted-foreground p-4 text-sm">
                Paste text into both fields to see the diff.
              </p>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
