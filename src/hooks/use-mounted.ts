"use client";

import * as React from "react";

/**
 * True after the first client-side frame. Use to gate browser-only UI
 * (theme toggles, window-dependent rendering) without hydration mismatches.
 * rAF-scheduled so no setState runs synchronously inside the effect.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return mounted;
}
