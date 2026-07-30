"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { CRON_PRESETS, describeCron, getNextRuns } from "@/lib/cron";

const FIELDS: { label: string; placeholder: string }[] = [
  { label: "Minute", placeholder: "0-59" },
  { label: "Hour", placeholder: "0-23" },
  { label: "Day (month)", placeholder: "1-31" },
  { label: "Month", placeholder: "1-12" },
  { label: "Day (week)", placeholder: "0-7" },
];

function splitExpression(expression: string): string[] {
  const parts = expression.trim().split(/\s+/).filter(Boolean);
  while (parts.length < 5) parts.push("*");
  return parts.slice(0, 5);
}

interface ShareState {
  expression: string;
}

export default function CronGeneratorClient() {
  const [expression, setExpression] = React.useState("0 9 * * 1-5");

  useShareableState<ShareState>((state) => setExpression(state.expression));

  const parts = splitExpression(expression);

  function updatePart(index: number, value: string) {
    const next = [...parts];
    next[index] = value.trim() || "*";
    setExpression(next.join(" "));
  }

  let description = "";
  let nextRuns: Date[] = [];
  let error: string | null = null;
  try {
    description = describeCron(expression);
    nextRuns = getNextRuns(expression, 5);
  } catch (err) {
    error = err instanceof Error ? err.message : "Invalid cron expression";
  }

  return (
    <ToolLayout
      toolId="cron-generator"
      title="Cron Expression Generator"
      description="Build, parse, and explain cron schedules. See next execution times. Crontab guru alternative."
      shareState={{ expression } satisfies ShareState}
      sendValue={expression}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="cron-generator" onApply={setExpression} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="cron-preset">Presets</Label>
          <Select value="" onValueChange={(value) => setExpression(value)}>
            <SelectTrigger id="cron-preset" className="w-72">
              <SelectValue placeholder="Choose a common schedule..." />
            </SelectTrigger>
            <SelectContent>
              {CRON_PRESETS.map((preset) => (
                <SelectItem key={preset.expression} value={preset.expression}>
                  {preset.label} — {preset.expression}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cron-expression">Cron expression</Label>
          <div className="flex items-center gap-2">
            <Input
              id="cron-expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              className="max-w-md font-mono"
            />
            <CopyButton value={expression} label="Copy expression" />
          </div>
        </div>

        <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
          {FIELDS.map((field, index) => (
            <div key={field.label} className="flex flex-col gap-2">
              <Label htmlFor={`cron-field-${index}`}>{field.label}</Label>
              <Input
                id={`cron-field-${index}`}
                value={parts[index]}
                onChange={(event) => updatePart(index, event.target.value)}
                placeholder={field.placeholder}
                className="font-mono"
              />
            </div>
          ))}
        </div>

        {error ? (
          <Alert variant="destructive" className="max-w-xl">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm font-medium">{description}</p>
        )}

        {!error && (
          <div className="flex flex-col gap-2">
            <Label>Next 5 executions</Label>
            <ul className="flex flex-col gap-1 font-mono text-sm">
              {nextRuns.map((run) => (
                <li key={run.getTime()} className="border-input rounded-md border px-3 py-1.5">
                  {run.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
