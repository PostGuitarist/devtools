"use client";

import { ArrowRightLeft, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getToolById } from "@/lib/tools-registry";
import { useToolsStore } from "@/lib/store/use-tools-store";

interface IncomingTransferBannerProps {
  /** The current tool's id, so a tool never offers to apply its own outgoing transfer. */
  toolId: string;
  onApply: (value: string) => void;
}

export function IncomingTransferBanner({
  toolId,
  onApply,
}: IncomingTransferBannerProps) {
  const transfer = useToolsStore((state) => state.transfer);
  const clearTransfer = useToolsStore((state) => state.clearTransfer);

  if (!transfer || transfer.fromToolId === toolId) return null;

  const fromTool = getToolById(transfer.fromToolId);

  return (
    <Alert>
      <ArrowRightLeft />
      <AlertTitle>
        Incoming data from {fromTool?.name ?? "another tool"}
      </AlertTitle>
      <AlertDescription>
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply(transfer.value);
              clearTransfer();
            }}
          >
            Apply
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={clearTransfer}>
            <X />
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
