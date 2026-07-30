"use client";

import * as React from "react";

export function PwaRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a progressive enhancement; a failed registration
      // (e.g. an unsupported browser) shouldn't affect the rest of the app.
    });
  }, []);

  return null;
}
