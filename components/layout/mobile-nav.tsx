"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getToolById, toolCategories, tools } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

export function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const favoriteIds = useToolsStore((state) => state.favoriteIds);
  const addRecent = useToolsStore((state) => state.addRecent);

  const favoriteTools = favoriteIds
    .map((id) => getToolById(id))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined)
    .filter((tool) => !tool.comingSoon);

  return (
    <ScrollArea className="flex-1">
      <nav className="flex flex-col gap-5 px-3 py-4">
        {favoriteTools.length > 0 && (
          <div className="flex flex-col gap-1">
            <h3 className="text-muted-foreground px-2 text-[11px] font-bold tracking-wide uppercase">
              Favorites
            </h3>
            {favoriteTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                onClick={() => {
                  addRecent(tool.id);
                  onNavigate?.();
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium",
                  "hover:bg-accent",
                  pathname === tool.href
                    ? "bg-accent text-foreground"
                    : "text-foreground/80"
                )}
              >
                <tool.icon className="text-primary size-4 shrink-0" />
                <span className="truncate">{tool.name}</span>
                <Star className="text-primary ml-auto size-3 shrink-0 fill-current" />
              </Link>
            ))}
          </div>
        )}

        {toolCategories.map((category) => {
          const categoryTools = tools.filter(
            (tool) => tool.category === category.id
          );
          if (categoryTools.length === 0) return null;

          return (
            <div key={category.id} className="flex flex-col gap-1">
              <h3 className="text-muted-foreground px-2 text-[11px] font-bold tracking-wide uppercase">
                {category.name}
              </h3>
              {categoryTools.map((tool) =>
                tool.comingSoon ? (
                  <div
                    key={tool.id}
                    className="text-muted-foreground/60 flex items-center gap-2.5 px-2 py-2 text-sm font-medium"
                  >
                    <tool.icon className="size-4 shrink-0 opacity-40" />
                    <span className="truncate">{tool.name}</span>
                    <span className="text-muted-foreground/50 ml-auto text-[9px] font-bold tracking-wide">
                      SOON
                    </span>
                  </div>
                ) : (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={() => {
                      addRecent(tool.id);
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium",
                      "hover:bg-accent",
                      pathname === tool.href
                        ? "bg-accent text-foreground"
                        : "text-foreground/80"
                    )}
                  >
                    <tool.icon className="text-primary size-4 shrink-0" />
                    <span className="truncate">{tool.name}</span>
                  </Link>
                )
              )}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
