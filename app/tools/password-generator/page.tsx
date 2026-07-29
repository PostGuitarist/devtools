"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "@/components/tools/copy-button";
import { ToolLayout } from "@/components/tool-layout";
import {
  buildCharset,
  estimateStrength,
  generatePassword,
  type PasswordOptions,
  type PasswordStrength,
} from "@/lib/password";

const STRENGTH_META: Record<
  PasswordStrength,
  { label: string; segments: number; className: string }
> = {
  weak: { label: "Weak", segments: 1, className: "bg-red-500" },
  fair: { label: "Fair", segments: 2, className: "bg-amber-500" },
  strong: { label: "Strong", segments: 3, className: "bg-lime-500" },
  "very-strong": { label: "Very strong", segments: 4, className: "bg-green-500" },
};

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

export default function PasswordGeneratorPage() {
  const [options, setOptions] = React.useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [password, setPassword] = React.useState(() =>
    generatePassword(DEFAULT_OPTIONS)
  );

  const charsetSize = buildCharset(options).length;
  const strength = estimateStrength(options.length, charsetSize);
  const strengthMeta = STRENGTH_META[strength];
  const hasAnyCharset = charsetSize > 0;

  function regenerate(next: PasswordOptions = options) {
    setPassword(generatePassword(next));
  }

  function updateOption<K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K]
  ) {
    const next = { ...options, [key]: value };
    setOptions(next);
    regenerate(next);
  }

  return (
    <ToolLayout
      toolId="password-generator"
      title="Password Generator"
      description="Generate strong, random passwords."
      onCopy={() => navigator.clipboard.writeText(password)}
    >
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={password}
              placeholder="Adjust the options below to generate a password"
              className="h-12 font-mono text-lg tracking-wide"
            />
            <CopyButton value={password} label="Copy password" className="size-12" />
            <Button
              variant="outline"
              size="icon"
              className="size-12"
              aria-label="Regenerate password"
              onClick={() => regenerate()}
            >
              <RefreshCw />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-muted flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-full flex-1 rounded-full transition-colors",
                    index < strengthMeta.segments ? strengthMeta.className : "bg-transparent"
                  )}
                />
              ))}
            </div>
            <span className="text-muted-foreground w-24 shrink-0 text-xs font-medium">
              {hasAnyCharset ? strengthMeta.label : "Select a charset"}
            </span>
          </div>
        </div>

        <div className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-full flex flex-col gap-2">
            <Label>Length: {options.length}</Label>
            <Slider
              aria-label="Length"
              min={4}
              max={64}
              step={1}
              value={[options.length]}
              onValueChange={([value]) => updateOption("length", value)}
            />
          </div>

          <OptionToggle
            label="Uppercase (A-Z)"
            checked={options.uppercase}
            onCheckedChange={(checked) => updateOption("uppercase", checked)}
          />
          <OptionToggle
            label="Lowercase (a-z)"
            checked={options.lowercase}
            onCheckedChange={(checked) => updateOption("lowercase", checked)}
          />
          <OptionToggle
            label="Numbers (0-9)"
            checked={options.numbers}
            onCheckedChange={(checked) => updateOption("numbers", checked)}
          />
          <OptionToggle
            label="Symbols (!@#$...)"
            checked={options.symbols}
            onCheckedChange={(checked) => updateOption("symbols", checked)}
          />
          <OptionToggle
            label="Exclude ambiguous (0 O 1 l I)"
            checked={options.excludeAmbiguous}
            onCheckedChange={(checked) => updateOption("excludeAmbiguous", checked)}
          />
        </div>
      </div>
    </ToolLayout>
  );
}

function OptionToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={label}>{label}</Label>
      <Switch id={label} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
