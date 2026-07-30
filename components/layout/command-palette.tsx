"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getToolById, toolCategories, tools } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const favoriteIds = useToolsStore((state) => state.favoriteIds);
  const recentIds = useToolsStore((state) => state.getRecentIds());
  const addRecent = useToolsStore((state) => state.addRecent);

  const favoriteTools = favoriteIds
    .map((id) => getToolById(id))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined)
    .filter((tool) => !tool.comingSoon);

  const recentTools = recentIds
    .map((id) => getToolById(id))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined)
    .filter((tool) => !tool.comingSoon);

  const runTool = React.useCallback(
    (href: string, toolId: string) => {
      addRecent(toolId);
      onOpenChange(false);
      router.push(href);
    },
    [addRecent, onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search tools"
      description="Search for a developer tool by name or keyword."
    >
      <CommandInput placeholder="Search tools..." />
      <CommandList>
        <CommandEmpty>No tools found.</CommandEmpty>

        {favoriteTools.length > 0 && (
          <>
            <CommandGroup heading="Favorites">
              {favoriteTools.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={`favorite-${tool.name}`}
                  onSelect={() => runTool(tool.href, tool.id)}
                >
                  <tool.icon />
                  <span>{tool.name}</span>
                  <Star className="text-primary ml-auto size-3.5 fill-current" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {recentTools.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentTools.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={`recent-${tool.name}`}
                  onSelect={() => runTool(tool.href, tool.id)}
                >
                  <tool.icon />
                  <span>{tool.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {toolCategories.map((category) => {
          const categoryTools = tools.filter(
            (tool) => tool.category === category.id
          );
          if (categoryTools.length === 0) return null;

          return (
            <CommandGroup key={category.id} heading={category.name}>
              {categoryTools.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={`${tool.name} ${tool.keywords?.join(" ") ?? ""}`}
                  disabled={tool.comingSoon}
                  onSelect={() => !tool.comingSoon && runTool(tool.href, tool.id)}
                >
                  <tool.icon />
                  <span>{tool.name}</span>
                  {tool.comingSoon && (
                    <span className="text-muted-foreground ml-auto text-[10px] font-bold tracking-wide">
                      SOON
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
