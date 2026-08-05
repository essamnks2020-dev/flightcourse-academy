"use client";

import * as React from "react";

/**
 * Scroll-reveal: observes `.reveal` descendants of the attached container and
 * adds `.reveal-visible` (once) as they enter the viewport, with a per-item
 * stagger. No-ops gracefully to fully visible when IntersectionObserver is
 * unavailable or the user prefers reduced motion (CSS forces .reveal visible).
 */
export function useRevealChildren<T extends HTMLElement = HTMLDivElement>(
  staggerMs = 60,
) {
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (!items.length) return;

    if (typeof IntersectionObserver === "undefined") {
      items.forEach((el) => el.classList.add("reveal-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    items.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 6) * staggerMs}ms`;
      io.observe(el);
    });

    return () => io.disconnect();
  }, [staggerMs]);

  return ref;
}
