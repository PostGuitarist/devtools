"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { decodeHtmlEntities, encodeHtmlEntities } from "@/lib/html-entities";

interface ShareState {
  plainText: string;
}

export default function HtmlEntitiesPage() {
  const [plainText, setPlainText] = React.useState("");
  const [encodedText, setEncodedText] = React.useState("");

  useShareableState<ShareState>((state) => handlePlainTextChange(state.plainText));

  function handlePlainTextChange(value: string) {
    setPlainText(value);
    setEncodedText(encodeHtmlEntities(value));
  }

  function handleEncodedTextChange(value: string) {
    setEncodedText(value);
    setPlainText(decodeHtmlEntities(value));
  }

  return (
    <ToolLayout
      toolId="html-entities"
      title="HTML Entities"
      description="Encode and decode HTML entity characters."
      onClear={() => {
        setPlainText("");
        setEncodedText("");
      }}
      onCopy={() => navigator.clipboard.writeText(encodedText)}
      shareState={{ plainText } satisfies ShareState}
      sendValue={encodedText}
    >
      <IncomingTransferBanner toolId="html-entities" onApply={handlePlainTextChange} />
      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="plain-text">Plain text</Label>
            <CopyButton value={plainText} label="Copy plain text" />
          </div>
          <Textarea
            id="plain-text"
            value={plainText}
            onChange={(event) => handlePlainTextChange(event.target.value)}
            placeholder='Type text like <div class="a">...</div> to encode...'
            className="min-h-[350px] flex-1 font-mono text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="encoded-text">HTML entities</Label>
            <CopyButton value={encodedText} label="Copy encoded text" />
          </div>
          <Textarea
            id="encoded-text"
            value={encodedText}
            onChange={(event) => handleEncodedTextChange(event.target.value)}
            placeholder="Or paste entity-encoded HTML to decode..."
            className="min-h-[350px] flex-1 font-mono text-sm"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
