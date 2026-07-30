"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [open, setOpen] = useState(false);

  const targets = tools.filter(
    (tool) => tool.id !== fromToolId && !tool.comingSoon
  );

  function handleSelect(href: string) {
    setTransfer(fromToolId, value);
    setOpen(false);
    router.push(href);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search tools..." />
          <CommandList className="max-h-80">
            <CommandEmpty>No tools found.</CommandEmpty>
            <CommandGroup heading="Send output to">
              {targets.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={`${tool.name} ${tool.keywords?.join(" ") ?? ""}`}
                  onSelect={() => handleSelect(tool.href)}
                >
                  <tool.icon />
                  {tool.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
