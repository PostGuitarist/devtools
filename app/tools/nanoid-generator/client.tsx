"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import {
  entropyBits,
  generateIds,
  inspectUlid,
  MAX_QUANTITY,
  NANOID_ALPHABETS,
  NANOID_MAX_SIZE,
  NANOID_MIN_SIZE,
  type IdKind,
} from "@/lib/id-generator";

interface Options {
  kind: IdKind;
  quantity: number;
  size: number;
  alphabetId: string;
  customAlphabet: string;
  monotonic: boolean;
  lowercase: boolean;
}

const DEFAULT_OPTIONS: Options = {
  kind: "nanoid",
  quantity: 10,
  size: 21,
  alphabetId: "url",
  customAlphabet: "",
  monotonic: true,
  lowercase: false,
};

function alphabetFor(options: Options): string | undefined {
  if (options.alphabetId === "custom") return options.customAlphabet || undefined;
  return NANOID_ALPHABETS.find((entry) => entry.id === options.alphabetId)?.value;
}

function generate(options: Options): string[] {
  return generateIds({
    kind: options.kind,
    quantity: options.quantity,
    size: options.size,
    alphabet: alphabetFor(options),
    monotonic: options.monotonic,
    lowercase: options.lowercase,
  });
}

export default function NanoidGeneratorClient() {
  const [options, setOptions] = React.useState<Options>(DEFAULT_OPTIONS);
  const [ids, setIds] = React.useState<string[]>(() => generate(DEFAULT_OPTIONS));

  useShareableState<Options>((state) => {
    setOptions(state);
    setIds(generate(state));
  });

  function updateOption<K extends keyof Options>(key: K, value: Options[K]) {
    const next = { ...options, [key]: value };
    setOptions(next);
    setIds(generate(next));
  }

  const isNanoid = options.kind === "nanoid";
  const output = ids.join("\n");
  const bits = entropyBits({
    kind: options.kind,
    size: options.size,
    alphabet: alphabetFor(options),
  });
  const ulidDetails = !isNanoid && ids[0] ? inspectUlid(ids[0]) : null;

  return (
    <ToolLayout
      toolId="nanoid-generator"
      title="Nanoid/ULID Generator"
      description="Generate Nanoid or ULID identifiers in bulk."
      onClear={() => setIds([])}
      onCopy={() => navigator.clipboard.writeText(output)}
      onDownload={() => downloadTextFile(`${options.kind}s.txt`, output)}
      shareState={options}
      sendValue={output}
    >
      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="id-kind">Identifier type</Label>
            <Select
              value={options.kind}
              onValueChange={(value) => updateOption("kind", value as IdKind)}
            >
              <SelectTrigger id="id-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nanoid">Nanoid — short, random, URL-safe</SelectItem>
                <SelectItem value="ulid">ULID — sortable, timestamp-prefixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Quantity: {options.quantity}</Label>
            <Slider
              aria-label="Quantity"
              min={1}
              max={MAX_QUANTITY}
              step={1}
              value={[options.quantity]}
              onValueChange={([value]) => updateOption("quantity", value)}
            />
          </div>

          {isNanoid ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>Length: {options.size} characters</Label>
                <Slider
                  aria-label="Length"
                  min={NANOID_MIN_SIZE}
                  max={NANOID_MAX_SIZE}
                  step={1}
                  value={[options.size]}
                  onValueChange={([value]) => updateOption("size", value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="id-alphabet">Alphabet</Label>
                <Select
                  value={options.alphabetId}
                  onValueChange={(value) => updateOption("alphabetId", value)}
                >
                  <SelectTrigger id="id-alphabet">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NANOID_ALPHABETS.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom…</SelectItem>
                  </SelectContent>
                </Select>
                {options.alphabetId === "custom" && (
                  <Input
                    value={options.customAlphabet}
                    onChange={(event) => updateOption("customAlphabet", event.target.value)}
                    aria-label="Custom alphabet"
                    placeholder="Characters to draw from, e.g. abcdef0123456789"
                    className="font-mono text-sm"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="ulid-monotonic">Monotonic (sortable within a millisecond)</Label>
                <Switch
                  id="ulid-monotonic"
                  checked={options.monotonic}
                  onCheckedChange={(checked) => updateOption("monotonic", checked)}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="ulid-lowercase">Lowercase</Label>
                <Switch
                  id="ulid-lowercase"
                  checked={options.lowercase}
                  onCheckedChange={(checked) => updateOption("lowercase", checked)}
                />
              </div>
            </div>
          )}

          <dl className="divide-y rounded-md border text-sm">
            <div className="flex items-center justify-between px-3 py-2">
              <dt className="text-muted-foreground">Randomness</dt>
              <dd className="font-mono text-xs">{bits} bits</dd>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <dt className="text-muted-foreground">Length</dt>
              <dd className="font-mono text-xs">{isNanoid ? options.size : 26} chars</dd>
            </div>
            {ulidDetails && (
              <>
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <dt className="text-muted-foreground shrink-0">First timestamp</dt>
                  <dd className="truncate font-mono text-xs">
                    {ulidDetails.timestamp.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <dt className="text-muted-foreground shrink-0">As UUID</dt>
                  <dd className="truncate font-mono text-xs">{ulidDetails.uuid}</dd>
                </div>
              </>
            )}
          </dl>

          <Button onClick={() => setIds(generate(options))}>
            <RefreshCw />
            Generate
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="id-output">
              {isNanoid ? "Nanoids" : "ULIDs"} ({ids.length})
            </Label>
            <span className="text-muted-foreground text-xs">
              {isNanoid
                ? "Random, URL-safe, no ordering guarantees"
                : "Lexicographically sortable by creation time"}
            </span>
          </div>
          <Textarea
            id="id-output"
            readOnly
            value={output}
            placeholder="Generated identifiers will appear here."
            className="min-h-[420px] flex-1 font-mono text-sm"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
