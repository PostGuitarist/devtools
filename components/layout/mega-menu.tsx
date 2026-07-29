"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { toolCategories, tools } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

export function MegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const addRecent = useToolsStore((state) => state.addRecent);

  const liveCount = tools.filter((tool) => !tool.comingSoon).length;

  return (
    <div className="w-[min(90vw,880px)] p-5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
        {toolCategories.map((category) => {
          const categoryTools = tools.filter(
            (tool) => tool.category === category.id
          );
          if (categoryTools.length === 0) return null;

          return (
            <div key={category.id}>
              <div className="mb-2 flex items-center gap-2">
                <span className="bg-primary size-1.5 rounded-full" />
                <span className="text-foreground/90 text-[11px] font-bold tracking-wide uppercase">
                  {category.name}
                </span>
              </div>
              <div className="flex flex-col">
                {categoryTools.map((tool) =>
                  tool.comingSoon ? (
                    <div
                      key={tool.id}
                      className="text-muted-foreground/60 -mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5"
                    >
                      <tool.icon className="size-[15px] shrink-0 opacity-40" />
                      <span className="text-[12.5px] font-medium">
                        {tool.name}
                      </span>
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
                        "-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5",
                        "hover:bg-accent",
                        pathname === tool.href && "bg-accent"
                      )}
                    >
                      <tool.icon className="text-primary size-[15px] shrink-0" />
                      <span className="text-[12.5px] font-medium">
                        {tool.name}
                      </span>
                    </Link>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground font-mono text-[11px]">
          {liveCount} TOOLS &middot; {toolCategories.length} CATEGORIES
        </span>
        <Link
          href="/"
          onClick={() => onNavigate?.()}
          className="text-primary flex items-center gap-1.5 text-xs font-semibold"
        >
          Browse all tools
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
