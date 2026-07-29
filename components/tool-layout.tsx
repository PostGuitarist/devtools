"use client";

import * as React from "react";
import { Copy, Download, Star, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToolsStore } from "@/lib/store/use-tools-store";

interface ToolLayoutProps {
  toolId: string;
  title: string;
  description: string;
  /** Clears the tool's input/output state. Omit to hide the Clear action. */
  onClear?: () => void;
  /** Copies the tool's primary output to the clipboard. Omit to hide the Copy action. */
  onCopy?: () => void;
  /** Downloads the tool's primary output as a file. Omit to hide the Download action. */
  onDownload?: () => void;
  /** Extra actions rendered before the standard action bar. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ToolLayout({
  toolId,
  title,
  description,
  onClear,
  onCopy,
  onDownload,
  actions,
  children,
  className,
}: ToolLayoutProps) {
  const isFavorite = useToolsStore((state) => state.isFavorite(toolId));
  const toggleFavorite = useToolsStore((state) => state.toggleFavorite);
  const addRecent = useToolsStore((state) => state.addRecent);

  React.useEffect(() => {
    addRecent(toolId);
  }, [toolId, addRecent]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mt-0.5 shrink-0"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFavorite(toolId)}
              >
                <Star
                  className={cn(
                    "size-4",
                    isFavorite && "text-primary fill-current"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFavorite ? "Remove from favorites" : "Add to favorites"}
            </TooltipContent>
          </Tooltip>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {onClear && (
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 />
              Clear
            </Button>
          )}
          {onCopy && (
            <Button variant="outline" size="sm" onClick={onCopy}>
              <Copy />
              Copy
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download />
              Download
            </Button>
          )}
        </div>
      </div>

      <Separator className="sm:hidden" />

      <div className={cn("flex flex-1 flex-col p-6", className)}>
        {children}
      </div>
    </div>
  );
}
