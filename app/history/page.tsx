"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDayLabel, formatRelativeTime } from "@/lib/relative-time";
import { getToolById, type Tool } from "@/lib/tools-registry";
import { type HistoryEntry, useToolsStore } from "@/lib/store/use-tools-store";

interface HistoryRow {
  entry: HistoryEntry;
  tool: Tool;
}

function groupByDay(rows: HistoryRow[]): Array<[string, HistoryRow[]]> {
  const groups = new Map<string, HistoryRow[]>();
  for (const row of rows) {
    const label = formatDayLabel(row.entry.visitedAt);
    const existing = groups.get(label);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(label, [row]);
    }
  }
  return Array.from(groups.entries());
}

export default function HistoryPage() {
  const history = useToolsStore((state) => state.history);
  const clearHistory = useToolsStore((state) => state.clearHistory);
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const withTools: HistoryRow[] = [];
    for (const entry of history) {
      const tool = getToolById(entry.toolId);
      if (!tool) continue;
      if (
        q !== "" &&
        !tool.name.toLowerCase().includes(q) &&
        !tool.keywords?.some((keyword) => keyword.toLowerCase().includes(q))
      ) {
        continue;
      }
      withTools.push({ entry, tool });
    }
    return withTools;
  }, [history, query]);

  const groups = React.useMemo(() => groupByDay(rows), [rows]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground text-sm">
            Tools you&apos;ve visited, most recent first.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearHistory}
          disabled={history.length === 0}
        >
          <Trash2 />
          Clear history
        </Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search history by tool name or keyword..."
          className="pl-9"
        />
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center text-sm">
          {history.length === 0
            ? "No tools visited yet — your history will show up here."
            : "No history matches your search."}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([day, dayRows]) => (
            <div key={day} className="flex flex-col gap-2">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {day}
              </h2>
              <div className="divide-border flex flex-col divide-y rounded-md border">
                {dayRows.map((row, i) => (
                  <Link
                    key={`${row.entry.toolId}-${row.entry.visitedAt}-${i}`}
                    href={row.tool.href}
                    className="hover:bg-accent flex items-center gap-3 px-3 py-2.5 text-sm"
                  >
                    <row.tool.icon className="text-primary size-4 shrink-0" />
                    <span className="flex-1 truncate font-medium">{row.tool.name}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatRelativeTime(row.entry.visitedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
