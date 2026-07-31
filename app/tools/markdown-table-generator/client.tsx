"use client";

import * as React from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { downloadTextFile } from "@/lib/download-text-file";
import {
  buildMarkdownTable,
  parseDelimitedText,
  parseMarkdownTable,
  type ColumnAlignment,
  type MarkdownTable,
} from "@/lib/markdown-table";

const ALIGNMENT_ICONS: Record<ColumnAlignment, React.ComponentType<{ className?: string }>> = {
  none: AlignJustify,
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

const ALIGNMENT_LABELS: Record<ColumnAlignment, string> = {
  none: "Default",
  left: "Left",
  center: "Center",
  right: "Right",
};

const DEFAULT_TABLE: MarkdownTable = {
  headers: ["Name", "Role", "Location"],
  rows: [
    ["Ada Lovelace", "Mathematician", "London"],
    ["Alan Turing", "Computer scientist", "Maida Vale"],
  ],
  alignments: ["left", "left", "right"],
};

interface ShareState {
  table: MarkdownTable;
  pretty: boolean;
}

/** Accepts Markdown, CSV, or TSV so pasted data lands in the grid either way. */
function importTable(text: string): MarkdownTable {
  const trimmed = text.trim();
  if (trimmed.startsWith("|")) return parseMarkdownTable(trimmed);
  return parseDelimitedText(trimmed, trimmed.includes("\t") ? "\t" : ",");
}

export default function MarkdownTableGeneratorClient() {
  const [table, setTable] = React.useState<MarkdownTable>(DEFAULT_TABLE);
  const [pretty, setPretty] = React.useState(true);
  const [markdown, setMarkdown] = React.useState(() =>
    buildMarkdownTable(DEFAULT_TABLE, { pretty: true })
  );
  const [error, setError] = React.useState<string | null>(null);
  const [importText, setImportText] = React.useState("");

  useShareableState<ShareState>((state) => {
    setTable(state.table);
    setPretty(state.pretty);
    setMarkdown(buildMarkdownTable(state.table, { pretty: state.pretty }));
  });

  function applyTable(next: MarkdownTable, nextPretty = pretty) {
    setTable(next);
    setMarkdown(buildMarkdownTable(next, { pretty: nextPretty }));
    setError(null);
  }

  function handleMarkdownChange(value: string) {
    setMarkdown(value);
    if (value.trim() === "") {
      setError(null);
      return;
    }
    try {
      setTable(parseMarkdownTable(value));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that Markdown table.");
    }
  }

  function handleImport(value: string) {
    try {
      applyTable(importTable(value));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that table.");
    }
  }

  function updateHeader(index: number, value: string) {
    applyTable({
      ...table,
      headers: table.headers.map((header, i) => (i === index ? value : header)),
    });
  }

  function updateCell(rowIndex: number, columnIndex: number, value: string) {
    applyTable({
      ...table,
      rows: table.rows.map((row, i) =>
        i === rowIndex
          ? Array.from({ length: table.headers.length }, (_, j) =>
              j === columnIndex ? value : (row[j] ?? "")
            )
          : row
      ),
    });
  }

  function updateAlignment(index: number, alignment: ColumnAlignment) {
    applyTable({
      ...table,
      alignments: table.headers.map((_, i) =>
        i === index ? alignment : (table.alignments[i] ?? "none")
      ),
    });
  }

  function addColumn() {
    applyTable({
      headers: [...table.headers, `Column ${table.headers.length + 1}`],
      rows: table.rows.map((row) => [...row, ""]),
      alignments: [...table.alignments, "none"],
    });
  }

  function removeColumn(index: number) {
    applyTable({
      headers: table.headers.filter((_, i) => i !== index),
      rows: table.rows.map((row) => row.filter((_, i) => i !== index)),
      alignments: table.alignments.filter((_, i) => i !== index),
    });
  }

  function addRow() {
    applyTable({
      ...table,
      rows: [...table.rows, table.headers.map(() => "")],
    });
  }

  function removeRow(index: number) {
    applyTable({ ...table, rows: table.rows.filter((_, i) => i !== index) });
  }

  return (
    <ToolLayout
      toolId="markdown-table-generator"
      title="Markdown Table Generator"
      description="Build a Markdown table from rows and columns."
      onClear={() => applyTable({ headers: ["Column 1"], rows: [[""]], alignments: ["none"] })}
      onCopy={() => navigator.clipboard.writeText(markdown)}
      onDownload={() => downloadTextFile("table.md", markdown)}
      shareState={{ table, pretty } satisfies ShareState}
      sendValue={markdown}
    >
      <div className="flex flex-1 flex-col gap-4">
        <IncomingTransferBanner toolId="markdown-table-generator" onApply={handleImport} />

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="mr-auto">Table data</Label>
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus />
                Row
              </Button>
              <Button variant="outline" size="sm" onClick={addColumn}>
                <Plus />
                Column
              </Button>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {table.headers.map((header, columnIndex) => {
                      const alignment = table.alignments[columnIndex] ?? "none";
                      const AlignmentIcon = ALIGNMENT_ICONS[alignment];
                      return (
                        <th key={columnIndex} className="min-w-48 border-b p-2 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1">
                              <Input
                                value={header}
                                onChange={(event) => updateHeader(columnIndex, event.target.value)}
                                aria-label={`Column ${columnIndex + 1} header`}
                                className="h-8 font-medium"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0"
                                aria-label={`Remove column ${columnIndex + 1}`}
                                onClick={() => removeColumn(columnIndex)}
                                disabled={table.headers.length === 1}
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                            <Select
                              value={alignment}
                              onValueChange={(value) =>
                                updateAlignment(columnIndex, value as ColumnAlignment)
                              }
                            >
                              <SelectTrigger
                                size="sm"
                                aria-label={`Column ${columnIndex + 1} alignment`}
                                className="w-full"
                              >
                                <AlignmentIcon className="size-3.5" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(ALIGNMENT_LABELS) as ColumnAlignment[]).map(
                                  (value) => (
                                    <SelectItem key={value} value={value}>
                                      {ALIGNMENT_LABELS[value]}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </th>
                      );
                    })}
                    <th className="w-10 border-b">
                      <span className="sr-only">Row actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {table.headers.map((_, columnIndex) => (
                        <td key={columnIndex} className="border-b p-2">
                          <Input
                            value={row[columnIndex] ?? ""}
                            onChange={(event) =>
                              updateCell(rowIndex, columnIndex, event.target.value)
                            }
                            aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`}
                            className="h-8"
                          />
                        </td>
                      ))}
                      <td className="border-b p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Remove row ${rowIndex + 1}`}
                          onClick={() => removeRow(rowIndex)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="table-import">Import CSV, TSV, or an existing Markdown table</Label>
              <Textarea
                id="table-import"
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder={"name,role\nAda,Mathematician"}
                className="min-h-[80px] font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                disabled={importText.trim() === ""}
                onClick={() => {
                  handleImport(importText);
                  setImportText("");
                }}
              >
                Import into the grid
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:sticky xl:top-6 xl:self-start">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="table-markdown">Markdown</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="table-pretty" className="text-muted-foreground text-xs font-normal">
                  Align source
                </Label>
                <Switch
                  id="table-pretty"
                  checked={pretty}
                  onCheckedChange={(checked) => {
                    setPretty(checked);
                    setMarkdown(buildMarkdownTable(table, { pretty: checked }));
                  }}
                />
                <CopyButton value={markdown} label="Copy Markdown" />
              </div>
            </div>
            <Textarea
              id="table-markdown"
              value={markdown}
              onChange={(event) => handleMarkdownChange(event.target.value)}
              // wrap="off" keeps the aligned source readable instead of folding rows.
              wrap="off"
              className="min-h-[420px] flex-1 overflow-x-auto font-mono text-sm text-nowrap"
              spellCheck={false}
            />
            <p className="text-muted-foreground text-xs">
              Editing the Markdown here updates the grid. Pipes in cells are escaped and line
              breaks become &lt;br&gt; so the table stays valid.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
