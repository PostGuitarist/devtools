"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import { buildHighlightSegments, getMatches, type RegexMatch } from "@/lib/regex-tester";

interface ShareState {
  pattern: string;
  flags: string;
  text: string;
}

const DEBOUNCE_MS = 200;

export default function RegexTesterPage() {
  const [pattern, setPattern] = React.useState("");
  const [flags, setFlags] = React.useState("g");
  const [text, setText] = React.useState("");
  const [matches, setMatches] = React.useState<RegexMatch[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  useShareableState<ShareState>((state) => {
    setPattern(state.pattern);
    setFlags(state.flags);
    setText(state.text);
  });

  React.useEffect(() => {
    // Debounced: a pathological pattern can take a while to run against long
    // text, so we avoid re-matching on every keystroke.
    const timeout = setTimeout(() => {
      const result = getMatches(pattern, flags, text);
      setMatches(result.matches);
      setError(result.error);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [pattern, flags, text]);

  const segments = React.useMemo(
    () => buildHighlightSegments(text, matches),
    [text, matches]
  );

  function handleClear() {
    setPattern("");
    setFlags("g");
    setText("");
    setMatches([]);
    setError(null);
  }

  const matchSummary = matches
    .map((match, i) => `${i + 1}: "${match.match}" at ${match.index}`)
    .join("\n");

  return (
    <ToolLayout
      toolId="regex-tester"
      title="Regex Tester"
      description="Test a regular expression against sample text with live match highlighting."
      onClear={handleClear}
      onCopy={() => navigator.clipboard.writeText(matchSummary)}
      shareState={{ pattern, flags, text } satisfies ShareState}
      sendValue={matches[0]?.match}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="regex-tester" onApply={(value) => setText(value)} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pattern-input">Pattern</Label>
            <div className="flex items-center gap-1 font-mono">
              <span className="text-muted-foreground">/</span>
              <Input
                id="pattern-input"
                value={pattern}
                onChange={(event) => setPattern(event.target.value)}
                placeholder="[a-z]+"
                className="font-mono"
                aria-invalid={error ? true : undefined}
              />
              <span className="text-muted-foreground">/</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="flags-input">Flags</Label>
            <Input
              id="flags-input"
              value={flags}
              onChange={(event) => setFlags(event.target.value)}
              placeholder="gi"
              className="w-24 font-mono"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sample-text">Sample text</Label>
            <Textarea
              id="sample-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste sample text to test against..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Highlighted matches ({matches.length})</Label>
            <div className="border-input min-h-[200px] rounded-md border px-3 py-2 font-mono text-sm break-words whitespace-pre-wrap">
              {text === "" ? (
                <span className="text-muted-foreground">
                  Matches will be highlighted here.
                </span>
              ) : (
                segments.map((segment, i) =>
                  segment.matched ? (
                    <mark key={i} className="bg-primary/30 text-foreground rounded-sm">
                      {segment.text}
                    </mark>
                  ) : (
                    <React.Fragment key={i}>{segment.text}</React.Fragment>
                  )
                )
              )}
            </div>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>Matches</Label>
            <div className="border-input max-h-64 overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground border-b text-left text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Match</th>
                    <th className="px-3 py-2 font-medium">Index</th>
                    <th className="px-3 py-2 font-medium">Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, i) => {
                    const groupEntries = [
                      ...match.groups.numbered.map(
                        (group, gi) => `$${gi + 1}: ${group ?? "—"}`
                      ),
                      ...Object.entries(match.groups.named).map(
                        ([name, value]) => `${name}: ${value ?? "—"}`
                      ),
                    ];
                    return (
                      <tr key={i} className="border-b last:border-0">
                        <td className="text-muted-foreground px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 font-mono">{match.match || "(empty)"}</td>
                        <td className="text-muted-foreground px-3 py-2">{match.index}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {groupEntries.length > 0 ? groupEntries.join(", ") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
