"use client";

import * as React from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  type EpochUnit,
  nowMs,
  parseDateInput,
  parseEpochInput,
  toIsoString,
  toLocalString,
  toUnixMillis,
  toUnixSeconds,
  toUtcString,
} from "@/lib/timestamp";

interface ShareState {
  epochInput: string;
  epochUnit: EpochUnit;
  dateInput: string;
}

export default function TimestampConverterPage() {
  // Starts empty (not `now`) so the server-rendered HTML and the client's
  // first render agree — `Date.now()` would otherwise differ between them
  // and trigger a hydration mismatch. "Now" is filled in after mount instead.
  const [epochInput, setEpochInput] = React.useState("");
  const [epochUnit, setEpochUnit] = React.useState<EpochUnit>("s");
  const [dateInput, setDateInput] = React.useState("");
  const restoredFromShareRef = React.useRef(false);

  useShareableState<ShareState>((state) => {
    restoredFromShareRef.current = true;
    setEpochInput(state.epochInput);
    setEpochUnit(state.epochUnit);
    setDateInput(state.dateInput);
  });

  React.useEffect(() => {
    if (restoredFromShareRef.current) return;
    setEpochInput(String(Math.floor(nowMs() / 1000)));
  }, []);

  const epochDate = React.useMemo(
    () => parseEpochInput(epochInput, epochUnit),
    [epochInput, epochUnit]
  );
  const epochError = epochInput.trim() !== "" && !epochDate;

  const typedDate = React.useMemo(() => parseDateInput(dateInput), [dateInput]);
  const dateError = dateInput.trim() !== "" && !typedDate;

  const activeDate = typedDate ?? epochDate;

  function handleNow() {
    const ms = nowMs();
    setEpochInput(String(Math.floor(ms / 1000)));
    setEpochUnit("s");
    setDateInput("");
  }

  const summary = activeDate
    ? [
        { label: "ISO 8601", value: toIsoString(activeDate) },
        { label: "UTC", value: toUtcString(activeDate) },
        { label: "Local", value: toLocalString(activeDate) },
        { label: "Unix seconds", value: String(toUnixSeconds(activeDate)) },
        { label: "Unix milliseconds", value: String(toUnixMillis(activeDate)) },
      ]
    : [];

  return (
    <ToolLayout
      toolId="timestamp-converter"
      title="Timestamp Converter"
      description="Convert Unix epoch timestamps to and from human-readable dates."
      onClear={() => {
        setEpochInput("");
        setDateInput("");
      }}
      shareState={{ epochInput, epochUnit, dateInput } satisfies ShareState}
      sendValue={activeDate ? toIsoString(activeDate) : undefined}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner
          toolId="timestamp-converter"
          onApply={(value) => setDateInput(value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="epoch-input">Epoch timestamp</Label>
            <div className="flex gap-2">
              <Input
                id="epoch-input"
                value={epochInput}
                onChange={(event) => {
                  setEpochInput(event.target.value);
                  setDateInput("");
                }}
                placeholder="1700000000"
                className="font-mono"
                aria-invalid={epochError ? true : undefined}
              />
              <Select value={epochUnit} onValueChange={(value) => setEpochUnit(value as EpochUnit)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">Seconds</SelectItem>
                  <SelectItem value="ms">Millis</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date-input">Date &amp; time</Label>
            <div className="flex gap-2">
              <Input
                id="date-input"
                value={dateInput}
                onChange={(event) => {
                  setDateInput(event.target.value);
                }}
                placeholder="2023-11-14T22:13:20Z"
                className="font-mono"
                aria-invalid={dateError ? true : undefined}
              />
              <Button type="button" variant="outline" onClick={handleNow}>
                <RotateCcw />
                Now
              </Button>
            </div>
          </div>
        </div>

        {(epochError || dateError) && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>
              {epochError ? "Invalid epoch timestamp." : "Unrecognized date format."}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {summary.map((row) => (
            <div key={row.label} className="flex flex-col gap-2">
              <Label>{row.label}</Label>
              <div className="border-input flex items-center justify-between rounded-md border px-3 py-2">
                <span className="truncate font-mono text-sm">{row.value}</span>
                <CopyButton value={row.value} label={`Copy ${row.label}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
