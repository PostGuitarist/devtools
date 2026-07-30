"use client";

import * as React from "react";
import { Plus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  MOCK_FIELD_TYPES,
  generateMockData,
  mockDataToCsv,
  mockDataToJson,
  type MockFieldSchema,
  type MockFieldType,
} from "@/lib/mock-data-generator";

type OutputFormat = "json" | "csv";

const DEFAULT_SCHEMA: MockFieldSchema[] = [
  { name: "id", type: "uuid" },
  { name: "name", type: "name" },
  { name: "email", type: "email" },
];

function toRows(schema: MockFieldSchema[], rowCount: number, format: OutputFormat): string {
  const rows = generateMockData(schema, rowCount);
  return format === "json" ? mockDataToJson(rows) : mockDataToCsv(rows);
}

interface ShareState {
  schema: MockFieldSchema[];
  rowCount: number;
  format: OutputFormat;
}

export default function MockDataGeneratorClient() {
  const [schema, setSchema] = React.useState<MockFieldSchema[]>(DEFAULT_SCHEMA);
  const [rowCount, setRowCount] = React.useState(10);
  const [format, setFormat] = React.useState<OutputFormat>("json");
  const [output, setOutput] = React.useState(() => toRows(DEFAULT_SCHEMA, 10, "json"));
  const nextId = React.useRef(DEFAULT_SCHEMA.length + 1);

  useShareableState<ShareState>((state) => {
    setSchema(state.schema);
    setRowCount(state.rowCount);
    setFormat(state.format);
    setOutput(toRows(state.schema, state.rowCount, state.format));
  });

  function regenerate(
    nextSchema: MockFieldSchema[] = schema,
    nextRowCount: number = rowCount,
    nextFormat: OutputFormat = format
  ) {
    setOutput(toRows(nextSchema, nextRowCount, nextFormat));
  }

  function updateField(index: number, patch: Partial<MockFieldSchema>) {
    const next = schema.map((field, i) => (i === index ? { ...field, ...patch } : field));
    setSchema(next);
    regenerate(next);
  }

  function addField() {
    const next = [...schema, { name: `field${nextId.current++}`, type: "word" as MockFieldType }];
    setSchema(next);
    regenerate(next);
  }

  function removeField(index: number) {
    if (schema.length <= 1) return;
    const next = schema.filter((_, i) => i !== index);
    setSchema(next);
    regenerate(next);
  }

  function changeFormat(nextFormat: OutputFormat) {
    setFormat(nextFormat);
    regenerate(schema, rowCount, nextFormat);
  }

  function changeRowCount(nextRowCount: number) {
    setRowCount(nextRowCount);
    regenerate(schema, nextRowCount);
  }

  return (
    <ToolLayout
      toolId="mock-data-generator"
      title="Mock Data Generator"
      description="Generate fake JSON or CSV data from a field schema."
      onCopy={() => navigator.clipboard.writeText(output)}
      onDownload={() => downloadTextFile(format === "json" ? "mock-data.json" : "mock-data.csv", output)}
      shareState={{ schema, rowCount, format } satisfies ShareState}
      sendValue={output}
      actions={
        <>
          <Select value={format} onValueChange={(value) => changeFormat(value as OutputFormat)}>
            <SelectTrigger size="sm" className="w-24" aria-label="Output format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => regenerate()}>
            <RefreshCw />
            Generate
          </Button>
        </>
      }
    >
      <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <Button variant="outline" size="sm" onClick={addField}>
                <Plus />
                Add field
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {schema.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={field.name}
                    onChange={(event) => updateField(index, { name: event.target.value })}
                    aria-label={`Field ${index + 1} name`}
                    placeholder="Field name"
                    className="flex-1 font-mono text-sm"
                  />
                  <Select
                    value={field.type}
                    onValueChange={(value) => updateField(index, { type: value as MockFieldType })}
                  >
                    <SelectTrigger aria-label={`Field ${index + 1} type`} className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_FIELD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {schema.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Remove field ${index + 1}`}
                      onClick={() => removeField(index)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label>Rows: {rowCount}</Label>
            <Slider
              aria-label="Row count"
              min={1}
              max={100}
              step={1}
              value={[rowCount]}
              onValueChange={([value]) => changeRowCount(value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:sticky lg:top-6 lg:self-start">
          <Label htmlFor="mock-data-output">Output</Label>
          <Textarea
            id="mock-data-output"
            readOnly
            value={output}
            className="min-h-[400px] font-mono text-sm"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
