"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * ThemeFX — adds the portfolio's atmospheric effects to the site:
 * - Aurora: drifting blurred gradient orbs in the background
 * - Grain: film grain overlay for texture
 * - Theme wipe: circular reveal transition when toggling theme
 *
 * All effects respect prefers-reduced-motion.
 */
export function ThemeFX() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Expose a global theme toggle function that uses the circular wipe
  React.useEffect(() => {
    if (!mounted) return;

    (window as any).toggleThemeWithWipe = (x: number, y: number) => {
      const currentTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
      const next = currentTheme === "dark" ? "light" : "dark";

      // Check for reduced motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setTheme(next);
        return;
      }

      // Create the wipe overlay
      const wipe = document.createElement("div");
      wipe.className = "theme-wipe";
      const bg = next === "dark" ? "#0b1220" : "#F6F3EB";
      wipe.style.background = bg;

      const r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      wipe.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      document.body.appendChild(wipe);

      // Animate the wipe
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wipe.style.clipPath = `circle(${r}px at ${x}px ${y}px)`;
        });
      });

      // Switch the theme at the midpoint
      setTimeout(() => {
        setTheme(next);
      }, 210);

      // Remove the wipe after the transition
      setTimeout(() => {
        wipe.remove();
      }, 500);
    };
  }, [mounted, setTheme]);

  return (
    <>
      <div className="aurora" aria-hidden="true">
        <i></i>
        <i></i>
      </div>
      <div className="grain" aria-hidden="true"></div>
    </>
  );
}
