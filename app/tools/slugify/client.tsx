"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { slugify, slugifyLines, type SlugifyOptions } from "@/lib/slugify";

const PLACEHOLDER = "10 Things I Learned Writing Crème Brûlée Recipes";

interface State extends Required<SlugifyOptions> {
  input: string;
  perLine: boolean;
}

const DEFAULT_STATE: State = {
  input: PLACEHOLDER,
  separator: "-",
  lowercase: true,
  ascii: true,
  maxLength: 0,
  perLine: false,
};

export default function SlugifyClient() {
  const [state, setState] = React.useState<State>(DEFAULT_STATE);

  useShareableState<State>((restored) => setState(restored));

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  const options: SlugifyOptions = {
    separator: state.separator,
    lowercase: state.lowercase,
    ascii: state.ascii,
    maxLength: state.maxLength,
  };

  const output = state.perLine
    ? slugifyLines(state.input, options)
    : slugify(state.input, options);

  return (
    <ToolLayout
      toolId="slugify"
      title="Slugify"
      description="Convert text into a URL-safe slug."
      onClear={() => update("input", "")}
      onCopy={() => navigator.clipboard.writeText(output)}
      shareState={state}
      sendValue={output}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="slugify" onApply={(value) => update("input", value)} />

        <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="slugify-input">Text</Label>
              <Textarea
                id="slugify-input"
                value={state.input}
                onChange={(event) => update("input", event.target.value)}
                placeholder="Paste a title, heading, or filename…"
                className="min-h-[160px] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="slugify-separator">Separator</Label>
                <Input
                  id="slugify-separator"
                  value={state.separator}
                  onChange={(event) => update("separator", event.target.value)}
                  maxLength={1}
                  className="w-20 font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="slugify-max-length">
                  Max length: {state.maxLength === 0 ? "unlimited" : state.maxLength}
                </Label>
                <Slider
                  id="slugify-max-length"
                  aria-label="Max length"
                  min={0}
                  max={120}
                  step={5}
                  value={[state.maxLength]}
                  onValueChange={([value]) => update("maxLength", value)}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="slugify-lowercase">Lowercase</Label>
                <Switch
                  id="slugify-lowercase"
                  checked={state.lowercase}
                  onCheckedChange={(checked) => update("lowercase", checked)}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="slugify-ascii">Transliterate to ASCII</Label>
                <Switch
                  id="slugify-ascii"
                  checked={state.ascii}
                  onCheckedChange={(checked) => update("ascii", checked)}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="slugify-per-line">Slugify each line</Label>
                <Switch
                  id="slugify-per-line"
                  checked={state.perLine}
                  onCheckedChange={(checked) => update("perLine", checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slugify-output">Slug</Label>
                <CopyButton value={output} label="Copy slug" />
              </div>
              <Textarea
                id="slugify-output"
                readOnly
                value={output}
                placeholder="The slug appears here."
                className="min-h-[160px] font-mono text-sm"
              />
              <p className="text-muted-foreground text-xs">
                {output.length} characters
                {state.maxLength > 0 && ` · trimmed to ${state.maxLength} at a word boundary`}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              <div className="text-muted-foreground truncate rounded-md border px-3 py-2 font-mono text-sm">
                https://example.com/
                <span className="text-foreground">
                  {state.perLine ? output.split("\n")[0] : output}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
