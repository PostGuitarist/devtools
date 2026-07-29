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

  if (tool.comingSoon) {
    return (
      <div className="border-border bg-card/50 relative flex flex-col gap-3 rounded-2xl border p-5 opacity-50">
        <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-xl">
          <tool.icon className="size-[18px]" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold tracking-tight">{tool.name}</h3>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Coming soon
          </p>
        </div>
        <span className="text-muted-foreground absolute top-5 right-5 text-[10px] font-bold tracking-wide">
          SOON
        </span>
      </div>
    );
  }

  return (
    <div className="group border-border bg-card hover:border-primary/40 relative flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-colors">
      <Link href={tool.href} className="flex flex-col gap-3">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          <tool.icon className="size-[18px]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold tracking-tight">{tool.name}</h3>
            {tool.popular && (
              <span className="border-primary/40 text-primary rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                Popular
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            {tool.description}
          </p>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[favorite=true]:opacity-100"
        data-favorite={isFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(event) => {
          event.preventDefault();
          toggleFavorite(tool.id);
        }}
      >
        <Star
          className={cn("size-4", isFavorite && "text-primary fill-current")}
        />
      </Button>
    </div>
  );
}
