"use client";

import * as React from "react";
import { Check, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { encodeStateToParam, SHARE_URL_LENGTH_WARNING } from "@/lib/share-state";

interface ShareButtonProps {
  /** The tool's current input/state to encode into the share link. */
  state: unknown;
  className?: string;
}

export function ShareButton({ state, className }: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  const param = React.useMemo(() => encodeStateToParam(state), [state]);
  const isLong = param.length > SHARE_URL_LENGTH_WARNING;

  function handleShare() {
    const url = new URL(window.location.href);
    url.hash = param;
    window.history.replaceState(null, "", url);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(className)}
          onClick={handleShare}
        >
          {copied ? <Check className="text-green-600" /> : <Share2 />}
          Share
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isLong
          ? "Copy a shareable link (this one is long — consider trimming your input)"
          : "Copy a shareable link with your current input"}
      </TooltipContent>
    </Tooltip>
  );
}
