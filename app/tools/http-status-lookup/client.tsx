"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import {
  httpStatusCategories,
  searchHttpStatuses,
  type HttpStatus,
  type HttpStatusCategoryId,
} from "@/lib/http-status-codes";

const CATEGORY_STYLES: Record<HttpStatusCategoryId, string> = {
  "1xx": "text-sky-600 dark:text-sky-400",
  "2xx": "text-green-600 dark:text-green-400",
  "3xx": "text-amber-600 dark:text-amber-400",
  "4xx": "text-orange-600 dark:text-orange-400",
  "5xx": "text-red-600 dark:text-red-400",
};

interface ShareState {
  query: string;
  category: HttpStatusCategoryId | "all";
}

export default function HttpStatusLookupClient() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<HttpStatusCategoryId | "all">("all");

  useShareableState<ShareState>((state) => {
    setQuery(state.query);
    setCategory(state.category);
  });

  const results = React.useMemo(() => {
    const matches = searchHttpStatuses(query);
    return category === "all"
      ? matches
      : matches.filter((status) => status.category === category);
  }, [query, category]);

  return (
    <ToolLayout
      toolId="http-status-lookup"
      title="HTTP Status Code Lookup"
      description="Look up the meaning of an HTTP status code."
      onClear={() => {
        setQuery("");
        setCategory("all");
      }}
      shareState={{ query, category } satisfies ShareState}
    >
      <div className="flex flex-1 flex-col gap-4">
        <IncomingTransferBanner toolId="http-status-lookup" onApply={setQuery} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status-search">Search</Label>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="status-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="404, teapot, rate limit, gateway…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
            >
              All
            </Button>
            {httpStatusCategories.map((group) => (
              <Button
                key={group.id}
                variant={category === group.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(group.id)}
                aria-pressed={category === group.id}
              >
                {group.id} {group.name}
              </Button>
            ))}
            <span className="text-muted-foreground ml-auto text-xs">
              {results.length} {results.length === 1 ? "code" : "codes"}
            </span>
          </div>
        </div>

        {results.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No status code matches “{query}”.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.map((status) => (
              <StatusCard key={status.code} status={status} />
            ))}
          </ul>
        )}
      </div>
    </ToolLayout>
  );
}

function StatusCard({ status }: { status: HttpStatus }) {
  const summary = `${status.code} ${status.name} — ${status.description}`;

  return (
    <li className="flex flex-col gap-2 rounded-md border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className={cn("font-mono text-2xl font-semibold", CATEGORY_STYLES[status.category])}>
            {status.code}
          </span>
          <span className="font-medium">{status.name}</span>
        </div>
        <CopyButton value={summary} label={`Copy ${status.code} ${status.name}`} />
      </div>

      <p className="text-muted-foreground text-sm">{status.description}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Badge variant="secondary">{status.spec}</Badge>
        {status.unofficial && <Badge variant="outline">Non-standard</Badge>}
        {status.deprecated && <Badge variant="destructive">Deprecated</Badge>}
      </div>
    </li>
  );
}
