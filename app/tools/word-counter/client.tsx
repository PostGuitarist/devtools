"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { computeWordCounterStats, wordFrequency } from "@/lib/word-counter";

interface ShareState {
  text: string;
}

export default function WordCounterClient() {
  const [text, setText] = React.useState("");

  useShareableState<ShareState>((state) => setText(state.text));

  const stats = computeWordCounterStats(text);
  const frequency = wordFrequency(text, 10);

  return (
    <ToolLayout
      toolId="word-counter"
      title="Word Counter"
      description="Count words, characters, and sentences. Reading time and word frequency analysis."
      onClear={() => setText("")}
      shareState={{ text } satisfies ShareState}
      sendValue={text}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="word-counter" onApply={setText} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="word-counter-input">Text</Label>
          <Textarea
            id="word-counter-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type or paste text to analyze..."
            className="min-h-[250px] font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Words" value={stats.words} />
          <Stat label="Characters" value={stats.characters} />
          <Stat label="Characters (no spaces)" value={stats.charactersNoSpaces} />
          <Stat label="Sentences" value={stats.sentences} />
          <Stat label="Paragraphs" value={stats.paragraphs} />
          <Stat label="Lines" value={stats.lines} />
          <Stat label="Reading time" value={formatMinutes(stats.readingTimeMinutes)} />
          <Stat label="Speaking time" value={formatMinutes(stats.speakingTimeMinutes)} />
        </div>

        {frequency.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>Most frequent words</Label>
            <div className="flex flex-wrap gap-2">
              {frequency.map(({ word, count }) => (
                <Badge key={word} variant="secondary" className="gap-1.5 font-mono">
                  {word}
                  <span className="text-muted-foreground">{count}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  return `${Math.ceil(minutes)} min`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-input flex flex-col gap-1 rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}
