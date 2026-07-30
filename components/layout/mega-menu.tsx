"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { toolCategories, tools, type ToolCategoryId } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

export function MegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const addRecent = useToolsStore((state) => state.addRecent);

  const categories = React.useMemo(
    () =>
      toolCategories
        .map((category) => ({
          ...category,
          tools: tools.filter((tool) => tool.category === category.id),
        }))
        .filter((category) => category.tools.length > 0),
    []
  );

  const [activeCategory, setActiveCategory] = React.useState<ToolCategoryId>(
    () =>
      tools.find((tool) => tool.href === pathname)?.category ??
      categories[0]?.id ??
      "formatters"
  );

  const liveCount = tools.filter((tool) => !tool.comingSoon).length;
  const current =
    categories.find((category) => category.id === activeCategory) ?? categories[0];

  return (
    <div className="flex w-[380px] overflow-hidden rounded-xl sm:w-[440px]">
      <div
        role="tablist"
        aria-label="Tool categories"
        className="flex w-[132px] shrink-0 flex-col gap-0.5 border-r p-2 sm:w-[150px]"
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onMouseEnter={() => setActiveCategory(category.id)}
              onFocus={() => setActiveCategory(category.id)}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-semibold",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <category.icon
                className={cn(
                  "size-3.5 shrink-0",
                  isActive ? "text-primary" : "opacity-60"
                )}
              />
              <span className="truncate">{category.name}</span>
              <span className="ml-auto text-[10px] font-normal opacity-60">
                {category.tools.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div role="tabpanel" className="max-h-80 overflow-y-auto p-2">
          {current?.tools.map((tool) =>
            tool.comingSoon ? (
              <div
                key={tool.id}
                className="text-muted-foreground/60 flex items-center gap-2.5 rounded-lg px-2 py-1.5"
              >
                <tool.icon className="size-[15px] shrink-0 opacity-40" />
                <span className="text-[12.5px] font-medium">{tool.name}</span>
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
                  "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
                  "hover:bg-accent",
                  pathname === tool.href && "bg-accent"
                )}
              >
                <tool.icon className="text-primary size-[15px] shrink-0" />
                <span className="text-[12.5px] font-medium">{tool.name}</span>
              </Link>
            )
          )}
        </div>

        <div className="border-border mt-auto flex items-center justify-between border-t px-3 py-2.5">
          <span className="text-muted-foreground font-mono text-[11px]">
            {liveCount} TOOLS &middot; {categories.length} CATEGORIES
          </span>
          <Link
            href="/"
            onClick={() => onNavigate?.()}
            className="text-primary flex items-center gap-1.5 text-xs font-semibold"
          >
            Browse all
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
