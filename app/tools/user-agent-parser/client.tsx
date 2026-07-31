"use client";

import * as React from "react";
import { MonitorSmartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  describeUserAgent,
  parseUserAgent,
  SAMPLE_USER_AGENTS,
} from "@/lib/user-agent";

interface ShareState {
  userAgent: string;
}

export default function UserAgentParserClient() {
  const [userAgent, setUserAgent] = React.useState(SAMPLE_USER_AGENTS[0].value);

  useShareableState<ShareState>((state) => setUserAgent(state.userAgent));

  const parsed = React.useMemo(() => parseUserAgent(userAgent), [userAgent]);
  const fields = describeUserAgent(parsed);
  const json = JSON.stringify(
    { browser: parsed.browser, engine: parsed.engine, os: parsed.os, device: parsed.device, cpu: parsed.cpu },
    null,
    2
  );
  const recognised = fields.some((field) => field.value !== null);

  return (
    <ToolLayout
      toolId="user-agent-parser"
      title="User-Agent Parser"
      description="Parse a User-Agent string into browser, OS, and device details."
      onClear={() => setUserAgent("")}
      onCopy={() => navigator.clipboard.writeText(json)}
      shareState={{ userAgent } satisfies ShareState}
      sendValue={json}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="user-agent-parser" onApply={setUserAgent} />

        <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ua-input">User-Agent string</Label>
              <Textarea
                id="ua-input"
                value={userAgent}
                onChange={(event) => setUserAgent(event.target.value)}
                placeholder="Mozilla/5.0 (…)"
                className="min-h-[120px] font-mono text-sm"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="ua-sample">Load a sample</Label>
                <Select value="" onValueChange={setUserAgent}>
                  <SelectTrigger id="ua-sample">
                    <SelectValue placeholder="Pick a known User-Agent…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_USER_AGENTS.map((sample) => (
                      <SelectItem key={sample.label} value={sample.value}>
                        {sample.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setUserAgent(navigator.userAgent)}
                className="sm:mb-0"
              >
                <MonitorSmartphone />
                Use my browser
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Parsed JSON</Label>
                <CopyButton value={json} label="Copy JSON" />
              </div>
              <Textarea
                readOnly
                value={json}
                aria-label="Parsed JSON"
                className="min-h-[200px] flex-1 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            {parsed.raw === "" ? (
              <p className="text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm">
                Paste a User-Agent string to break it down.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {parsed.bot.isBot && <Badge variant="destructive">Bot</Badge>}
                  {parsed.bot.isAICrawler && <Badge variant="secondary">AI crawler</Badge>}
                  {parsed.bot.isAIAssistant && <Badge variant="secondary">AI assistant</Badge>}
                  {!recognised && <Badge variant="outline">Unrecognised User-Agent</Badge>}
                </div>

                <dl className="divide-y rounded-md border">
                  {fields.map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <dt className="text-muted-foreground shrink-0 text-sm">{field.label}</dt>
                      <dd className="truncate font-mono text-sm">{field.value ?? "—"}</dd>
                    </div>
                  ))}
                </dl>

                <p className="text-muted-foreground text-xs">
                  Parsing happens locally with UAParser.js. User-Agent strings are self-reported
                  and increasingly frozen by browsers, so treat the result as a hint rather than
                  proof — prefer feature detection or Client Hints for behaviour decisions.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
