import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "You're offline — DevTools",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <WifiOff className="text-muted-foreground size-10" />
      <h1 className="text-xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="text-muted-foreground text-sm">
        This page hasn&apos;t been cached yet. Tools you&apos;ve already opened
        will keep working offline.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
