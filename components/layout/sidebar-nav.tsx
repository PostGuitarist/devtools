"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { getToolById, toolCategories, tools } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const favoriteIds = useToolsStore((state) => state.favoriteIds);
  const favoriteTools = favoriteIds
    .map((id) => getToolById(id))
    .filter((tool) => tool !== undefined);

  return (
    <nav className="flex flex-col gap-4 px-2 py-4">
      {favoriteTools.length > 0 && (
        <div className="flex flex-col gap-1">
          {!collapsed && (
            <h3 className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
              Favorites
            </h3>
          )}
          {favoriteTools.map((tool) => (
            <SidebarLink
              key={tool.id}
              href={tool.href}
              icon={<tool.icon className="size-4 shrink-0" />}
              label={tool.name}
              active={pathname === tool.href}
              collapsed={collapsed}
              onNavigate={onNavigate}
              trailing={
                <Star className="size-3 shrink-0 fill-current text-amber-500" />
              }
            />
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
            {!collapsed && (
              <h3 className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
                {category.name}
              </h3>
            )}
            {categoryTools.map((tool) => (
              <SidebarLink
                key={tool.id}
                href={tool.href}
                icon={<tool.icon className="size-4 shrink-0" />}
                label={tool.name}
                active={pathname === tool.href}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  collapsed,
  trailing,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  trailing?: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent text-accent-foreground" : "text-foreground/80",
        collapsed && "justify-center"
      )}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && trailing}
    </Link>
  );
}
