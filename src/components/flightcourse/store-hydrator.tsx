"use client";

import * as React from "react";
import { useFlightStore } from "@/lib/store";

/**
 * Manually rehydrates the Zustand persist store after mount.
 * Required because we use `skipHydration: true` to prevent SSR/client
 * hydration mismatches (the store is empty on both server and first
 * client render, then rehydrates from localStorage after mount).
 */
export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const rehydrate = useFlightStore.persist.rehydrate;
  React.useEffect(() => {
    rehydrate();
  }, [rehydrate]);
  return <>{children}</>;
}
