"use client";

import * as React from "react";

/**
 * Detects a coarse (touch) primary pointer — not based on screen width.
 */
export function usePointerCoarse(): boolean {
  const [coarse, setCoarse] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}

/**
 * True once the client has mounted.
 * Uses useState(false) + useEffect so the first client render matches
 * the server render (both false). The state only becomes true AFTER
 * the effect runs, which is after hydration validation — preventing
 * hydration mismatches.
 */
export function useHydrated(): boolean {
  const [h, setH] = React.useState(false);
  React.useEffect(() => setH(true), []);
  return h;
}
