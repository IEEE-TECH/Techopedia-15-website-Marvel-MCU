"use client";

import { useEffect, useState } from "react";

/**
 * Tracks browser connectivity via the online/offline events, seeded from
 * `navigator.onLine`. Starts `true` during SSR/first paint (no `window`
 * yet) so nothing flashes an offline banner before hydration can check.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
