"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";

import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { htmlToMarkdown } from "@/lib/html-to-markdown";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `<h1>Hello</h1>
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
<p><a href="https://example.com">A link</a></p>`;

interface ShareState {
  html: string;
}

export default function HtmlToMarkdownClient() {
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = React.useState(PLACEHOLDER);

  useShareableState<ShareState>((state) => setHtml(state.html));

  let markdown = "";
  let error: string | null = null;
  try {
    markdown = htmlToMarkdown(html);
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not convert HTML";
  }

  return (
    <ToolLayout
      toolId="html-to-markdown"
      title="HTML to Markdown"
      description="Convert HTML to clean Markdown. Headings, links, images, tables, code blocks."
      onClear={() => setHtml("")}
      onCopy={() => navigator.clipboard.writeText(markdown)}
      onDownload={() => downloadTextFile("document.md", markdown)}
      shareState={{ html } satisfies ShareState}
      sendValue={markdown}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="html-to-markdown" onApply={setHtml} />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>HTML input</Label>
            <div className="h-[500px] overflow-hidden rounded-md border">
              <Editor
                language="html"
                value={html}
                onChange={(value) => setHtml(value ?? "")}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Markdown output</Label>
              <CopyButton value={markdown} label="Copy Markdown" />
            </div>
            <div className="h-[500px] overflow-hidden rounded-md border">
              <Editor
                language="markdown"
                value={markdown}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  readOnly: true,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
