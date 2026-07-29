"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav } from "@/components/layout/sidebar-nav";

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground hidden shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 font-semibold",
            collapsed && "justify-center"
          )}
        >
          <Wrench className="size-5 shrink-0" />
          {!collapsed && <span>DevTools</span>}
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <SidebarNav collapsed={collapsed} />
      </ScrollArea>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </Button>
      </div>
    </aside>
  );
}
