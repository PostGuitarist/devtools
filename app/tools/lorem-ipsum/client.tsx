"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolLayout } from "@/components/tool-layout";
import { downloadTextFile } from "@/lib/download-text-file";
import { generateParagraphs, generateSentences, generateWords } from "@/lib/lorem-ipsum";

type Mode = "paragraphs" | "sentences" | "words";

const MODE_LIMITS: Record<Mode, { min: number; max: number; default: number }> = {
  paragraphs: { min: 1, max: 10, default: 3 },
  sentences: { min: 1, max: 20, default: 5 },
  words: { min: 5, max: 200, default: 50 },
};

function generate(mode: Mode, count: number, startWithClassic: boolean): string {
  switch (mode) {
    case "paragraphs":
      return generateParagraphs(count, startWithClassic).join("\n\n");
    case "sentences":
      return generateSentences(count);
    case "words":
      return generateWords(count);
  }
}

export default function LoremIpsumPage() {
  const [mode, setMode] = React.useState<Mode>("paragraphs");
  const [count, setCount] = React.useState(MODE_LIMITS.paragraphs.default);
  const [startWithClassic, setStartWithClassic] = React.useState(true);
  const [output, setOutput] = React.useState(() =>
    generate("paragraphs", MODE_LIMITS.paragraphs.default, true)
  );

  function handleModeChange(value: Mode) {
    setMode(value);
    setCount(MODE_LIMITS[value].default);
  }

  function regenerate(nextMode: Mode = mode, nextCount: number = count) {
    setOutput(generate(nextMode, nextCount, startWithClassic));
  }

  const limits = MODE_LIMITS[mode];

  return (
    <ToolLayout
      toolId="lorem-ipsum"
      title="Lorem Ipsum"
      description="Generate placeholder text, paragraphs, or words."
      onClear={() => setOutput("")}
      onCopy={() => navigator.clipboard.writeText(output)}
      onDownload={() => downloadTextFile("lorem-ipsum.txt", output)}
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lorem-mode">Type</Label>
              <Select
                value={mode}
                onValueChange={(value) => handleModeChange(value as Mode)}
              >
                <SelectTrigger id="lorem-mode" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="words">Words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-56 flex-col gap-2">
              <Label>
                Count: {count}
              </Label>
              <Slider
                aria-label="Count"
                min={limits.min}
                max={limits.max}
                step={1}
                value={[count]}
                onValueChange={([value]) => setCount(value)}
              />
            </div>

            {mode === "paragraphs" && (
              <div className="flex items-center gap-2 pb-1.5">
                <Switch
                  id="start-classic"
                  checked={startWithClassic}
                  onCheckedChange={setStartWithClassic}
                />
                <Label htmlFor="start-classic">
                  Start with &ldquo;Lorem ipsum dolor sit amet&rdquo;
                </Label>
              </div>
            )}
          </div>

          <Button onClick={() => regenerate()}>
            <RefreshCw />
            Generate
          </Button>
        </div>

        <Textarea
          readOnly
          value={output}
          placeholder="Generated text will appear here."
          className="min-h-[400px] flex-1 text-sm leading-relaxed"
        />
      </div>
    </ToolLayout>
  );
}
