"use client";

import * as React from "react";
import Link from "next/link";
import { History, LayoutGrid, ChevronDown, Menu, Search, Star, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getToolById } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

const MAX_PINNED = 2;

interface NavbarProps {
  onSearchClick: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const favoriteIds = useToolsStore((state) => state.favoriteIds);
  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  const pinnedTools = favoriteIds
    .map((id) => getToolById(id))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined)
    .filter((tool) => !tool.comingSoon)
    .slice(0, MAX_PINNED);

  return (
    <header className="bg-background sticky top-0 z-40 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
          <Wrench className="size-3.5" />
        </span>
        <span className="text-[15px] font-bold tracking-tight">DevTools</span>
      </Link>

      <Popover open={toolsOpen} onOpenChange={setToolsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 font-semibold sm:inline-flex"
          >
            <LayoutGrid className="text-primary size-3.5" />
            All Tools
            <ChevronDown className="text-muted-foreground size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <MegaMenu onNavigate={() => setToolsOpen(false)} />
        </PopoverContent>
      </Popover>

      {pinnedTools.length > 0 && (
        <>
          <div className="bg-border hidden h-5 w-px sm:block" />
          <div className="hidden items-center gap-1 sm:flex">
            <span className="text-muted-foreground mr-1 text-[10px] font-semibold tracking-wide uppercase">
              Pinned
            </span>
            {pinnedTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] font-medium"
              >
                <tool.icon className="text-primary size-3.5" />
                {tool.name}
                <Star className="text-primary size-2.5 fill-current" />
              </Link>
            ))}
          </div>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu />
      </Button>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>DevTools</SheetTitle>
          </SheetHeader>
          <MobileNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="History" asChild>
          <Link href="/history">
            <History />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSearchClick}
          className="text-muted-foreground w-36 justify-between font-normal sm:w-56"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4" />
            <span className="hidden sm:inline">Search tools...</span>
            <span className="sm:hidden">Search</span>
          </span>
          <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex">
            {isMac ? "⌘" : "Ctrl"}K
          </kbd>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
