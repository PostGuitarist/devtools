"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";

import { Label } from "@/components/ui/label";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { downloadTextFile } from "@/lib/download-text-file";
import { markdownToHtml } from "@/lib/markdown";

loader.config({ paths: { vs: "/vs" } });

const PLACEHOLDER = `# Hello, Markdown!

Write **Markdown** on the left, see the *live preview* on the right.

- Supports GitHub Flavored Markdown
- Tables, task lists, and \`code\`
- Fenced code blocks

\`\`\`js
console.log("hi");
\`\`\`

> Blockquotes work too.
`;

interface ShareState {
  markdown: string;
}

export default function MarkdownPreviewClient() {
  const { resolvedTheme } = useTheme();
  const [markdown, setMarkdown] = React.useState(PLACEHOLDER);

  useShareableState<ShareState>((state) => setMarkdown(state.markdown));

  const html = markdownToHtml(markdown);

  return (
    <ToolLayout
      toolId="markdown-preview"
      title="Markdown Preview"
      description="Write and preview Markdown in real-time. GFM, tables, code blocks. Export to HTML."
      onClear={() => setMarkdown("")}
      onCopy={() => navigator.clipboard.writeText(html)}
      onDownload={() => downloadTextFile("document.html", html)}
      shareState={{ markdown } satisfies ShareState}
      sendValue={markdown}
    >
      <div className="flex flex-1 flex-col gap-3">
        <IncomingTransferBanner toolId="markdown-preview" onApply={setMarkdown} />

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Markdown</Label>
            <div className="h-[560px] overflow-hidden rounded-md border">
              <Editor
                language="markdown"
                value={markdown}
                onChange={(value) => setMarkdown(value ?? "")}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Preview</Label>
            <div className="h-[560px] overflow-y-auto rounded-md border p-4">
              <div
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
