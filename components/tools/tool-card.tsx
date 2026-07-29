"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToolsStore } from "@/lib/store/use-tools-store";
import type { Tool } from "@/lib/tools-registry";

export function ToolCard({ tool }: { tool: Tool }) {
  const isFavorite = useToolsStore((state) => state.isFavorite(tool.id));
  const toggleFavorite = useToolsStore((state) => state.toggleFavorite);

  return (
    <div className="group border-border bg-card hover:border-foreground/20 relative flex flex-col gap-3 rounded-lg border p-4 transition-colors">
      <Link href={tool.href} className="flex flex-col gap-3">
        <div className="bg-muted flex size-9 items-center justify-center rounded-md">
          <tool.icon className="size-5" />
        </div>
        <div>
          <h3 className="font-medium">{tool.name}</h3>
          <p className="text-muted-foreground text-sm">{tool.description}</p>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[favorite=true]:opacity-100"
        data-favorite={isFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(event) => {
          event.preventDefault();
          toggleFavorite(tool.id);
        }}
      >
        <Star
          className={cn("size-4", isFavorite && "fill-amber-500 text-amber-500")}
        />
      </Button>
    </div>
  );
}
