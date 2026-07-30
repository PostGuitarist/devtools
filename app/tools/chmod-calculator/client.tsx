"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  buildChmodCommand,
  CHMOD_PRESETS,
  octalToPermissions,
  permissionsToOctal,
  permissionsToSymbolic,
  symbolicToPermissions,
  type ChmodPermissions,
  type PermissionSet,
} from "@/lib/chmod";

const SUBJECTS: { key: keyof ChmodPermissions; label: string }[] = [
  { key: "owner", label: "Owner" },
  { key: "group", label: "Group" },
  { key: "others", label: "Others" },
];

const DEFAULT_PERMISSIONS: ChmodPermissions = octalToPermissions("755");

interface ShareState {
  octal: string;
  target: string;
  recursive: boolean;
}

export default function ChmodCalculatorClient() {
  const [permissions, setPermissions] = React.useState<ChmodPermissions>(DEFAULT_PERMISSIONS);
  // Holds the raw text only while it doesn't parse; otherwise the input just
  // displays the canonical `symbolic` string derived from `permissions`.
  const [symbolicDraft, setSymbolicDraft] = React.useState<string | null>(null);
  const [symbolicError, setSymbolicError] = React.useState<string | null>(null);
  const [target, setTarget] = React.useState("file.txt");
  const [recursive, setRecursive] = React.useState(false);

  const octal = permissionsToOctal(permissions);
  const symbolic = permissionsToSymbolic(permissions);
  const symbolicInput = symbolicDraft ?? symbolic;
  const command = buildChmodCommand(permissions, target, recursive);

  useShareableState<ShareState>((state) => {
    setPermissions(octalToPermissions(state.octal));
    setTarget(state.target);
    setRecursive(state.recursive);
  });

  function toggleBit(subject: keyof ChmodPermissions, bit: keyof PermissionSet) {
    setPermissions((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [bit]: !prev[subject][bit] },
    }));
    setSymbolicDraft(null);
    setSymbolicError(null);
  }

  function applyOctal(value: string) {
    try {
      setPermissions(octalToPermissions(value));
      setSymbolicDraft(null);
      setSymbolicError(null);
    } catch {
      // Ignore incomplete/invalid input while typing; last valid value stays applied.
    }
  }

  function applySymbolic(value: string) {
    try {
      setPermissions(symbolicToPermissions(value));
      setSymbolicDraft(null);
      setSymbolicError(null);
    } catch (err) {
      setSymbolicDraft(value);
      setSymbolicError(err instanceof Error ? err.message : "Invalid symbolic permissions");
    }
  }

  return (
    <ToolLayout
      toolId="chmod-calculator"
      title="Chmod Calculator"
      description="Interactive Linux permission calculator. Octal ↔ symbolic, common presets, chmod commands."
      shareState={{ octal, target, recursive } satisfies ShareState}
      sendValue={command}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner
          toolId="chmod-calculator"
          onApply={(value) => {
            const trimmed = value.trim();
            if (/^[0-7]{3,4}$/.test(trimmed)) applyOctal(trimmed);
            else applySymbolic(trimmed);
          }}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="p-2 text-left font-medium">Subject</th>
                    <th className="p-2 text-center font-medium">Read</th>
                    <th className="p-2 text-center font-medium">Write</th>
                    <th className="p-2 text-center font-medium">Execute</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map(({ key, label }) => (
                    <tr key={key} className="border-t">
                      <td className="p-2 font-medium">{label}</td>
                      {(["read", "write", "execute"] as const).map((bit) => (
                        <td key={bit} className="p-2 text-center">
                          <Switch
                            aria-label={`${label} ${bit}`}
                            checked={permissions[key][bit]}
                            onCheckedChange={() => toggleBit(key, bit)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="chmod-octal">Octal</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="chmod-octal"
                    value={octal}
                    onChange={(event) => applyOctal(event.target.value)}
                    className="font-mono"
                    maxLength={4}
                  />
                  <CopyButton value={octal} label="Copy octal" />
                </div>
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="chmod-symbolic">Symbolic</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="chmod-symbolic"
                    value={symbolicInput}
                    onChange={(event) => applySymbolic(event.target.value)}
                    className="font-mono"
                    aria-invalid={symbolicError ? true : undefined}
                  />
                  <CopyButton value={symbolic} label="Copy symbolic" />
                </div>
              </div>
            </div>

            {symbolicError && (
              <Alert variant="destructive">
                <TriangleAlert />
                <AlertDescription>{symbolicError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="chmod-preset">Common presets</Label>
              <Select
                value={CHMOD_PRESETS.some((p) => p.octal === octal) ? octal : undefined}
                onValueChange={(value) => applyOctal(value)}
              >
                <SelectTrigger id="chmod-preset" className="w-64">
                  <SelectValue placeholder="Choose a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {CHMOD_PRESETS.map((preset) => (
                    <SelectItem key={preset.octal} value={preset.octal}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-col gap-2">
              <Label>Command</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
                <Input
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="file or directory name"
                  className="font-mono"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="chmod-recursive"
                    checked={recursive}
                    onCheckedChange={setRecursive}
                  />
                  <Label htmlFor="chmod-recursive">Recursive (-R)</Label>
                </div>
              </div>
              <div className="border-input flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                <span className="truncate font-mono text-sm">{command}</span>
                <CopyButton value={command} label="Copy command" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
