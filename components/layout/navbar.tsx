"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getCategoryById, tools } from "@/lib/tools-registry";

interface NavbarProps {
  onSearchClick: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const breadcrumbs = getBreadcrumbs(pathname);
  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <header className="bg-background sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-3">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>DevTools</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu />
        </Button>
      </Sheet>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && (
              <ChevronRight className="text-muted-foreground size-3.5 shrink-0" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="truncate font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground truncate"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSearchClick}
          className="text-muted-foreground w-40 justify-between font-normal sm:w-56"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4" />
            Search tools...
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

interface Breadcrumb {
  href: string;
  label: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ href: "/", label: "Home" }];

  const tool = tools.find((t) => t.href === pathname);
  if (!tool) return crumbs;

  const category = getCategoryById(tool.category);
  if (category) {
    crumbs.push({ href: "/", label: category.name });
  }
  crumbs.push({ href: tool.href, label: tool.name });

  return crumbs;
}
