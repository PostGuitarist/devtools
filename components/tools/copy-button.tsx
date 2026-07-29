"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  value: string;
  className?: string;
  label?: string;
}

export function CopyButton({ value, className, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      aria-label={label}
      disabled={!value}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
      }}
    >
      {copied ? <Check className="text-green-600" /> : <Copy />}
    </Button>
  );
}
