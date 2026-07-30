"use client";

import * as React from "react";

import { decodeStateFromParam, encodeStateToParam } from "@/lib/share-state";

/**
 * Restores tool state from a `location.hash` share link on mount (client-only,
 * since `location` isn't available during SSR), and exposes a helper to build
 * a share URL for the tool's current state.
 */
export function useShareableState<T>(onRestore: (state: T) => void) {
  const restoredRef = React.useRef(false);

  React.useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    try {
      const state = decodeStateFromParam<T>(hash);
      onRestore(state);
    } catch {
      // Malformed or foreign hash fragment; ignore and keep default state.
    }
    // Intentionally runs once on mount only — onRestore identity churn from
    // the caller shouldn't re-trigger hash restoration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildShareUrl = React.useCallback((state: T) => {
    const url = new URL(window.location.href);
    url.hash = encodeStateToParam(state);
    return url;
  }, []);

  return { buildShareUrl };
}
