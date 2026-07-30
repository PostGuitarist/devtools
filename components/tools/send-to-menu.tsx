"use client";

import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tools } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

interface SendToMenuProps {
  fromToolId: string;
  value: string;
  className?: string;
}

export function SendToMenu({ fromToolId, value, className }: SendToMenuProps) {
  const router = useRouter();
  const setTransfer = useToolsStore((state) => state.setTransfer);

  const targets = tools.filter(
    (tool) => tool.id !== fromToolId && !tool.comingSoon
  );

  function handleSelect(href: string) {
    setTransfer(fromToolId, value);
    router.push(href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(className)}
          disabled={!value}
        >
          <ArrowRightLeft />
          Send to...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        <DropdownMenuLabel>Send output to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {targets.map((tool) => (
          <DropdownMenuItem
            key={tool.id}
            onSelect={() => handleSelect(tool.href)}
          >
            <tool.icon />
            {tool.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
