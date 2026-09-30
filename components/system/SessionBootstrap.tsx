"use client";

import { useEffect } from "react";
import { useStudioStore } from "@/lib/store/studio-store";

const REFRESH_INTERVAL_MS = 12 * 60 * 1000; // access token is a 15 min JWT (§4)

/**
 * Restores a session from the httpOnly refresh cookie on first load (the
 * access token itself is in-memory only — see `StudioState.accessToken` —
 * so a page reload always starts without one), then keeps it alive with a
 * periodic silent refresh for as long as the tab stays open and signed in.
 */
export function SessionBootstrap() {
  useEffect(() => {
    void useStudioStore.getState().refreshSession();

    const interval = window.setInterval(() => {
      if (useStudioStore.getState().signedIn) {
        void useStudioStore.getState().refreshSession();
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
