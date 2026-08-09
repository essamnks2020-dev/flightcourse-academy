"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * ThemeFX — atmospheric effects + smooth circular theme wipe.
 *
 * The theme wipe uses the Web Animations API (element.animate) which is
 * more reliable than CSS transitions for dynamically-created elements.
 * The wipe expands as a circle from the click point, the theme switches
 * at the midpoint (when the circle covers half the screen), then the
 * wipe continues expanding to full coverage before being removed.
 *
 * Total duration: 600ms. Easing: ease-out-expo.
 * Works in ALL browsers. Falls back to instant for reduced-motion.
 */
export function ThemeFX() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // #region agent log
    // Strip any leftover Z.ai / design-ui watermark nodes injected into the DOM.
    const killWatermarks = () => {
      const sel = [
        '.design-ui-credit',
        '[class*="design-ui-credit"]',
        'a[href*="space-z.ai"]',
        'a[href*="chatglm.cn"]',
        'iframe[src*="space-z.ai"]',
        'iframe[src*="z.ai/"]',
      ].join(',');
      const nodes = Array.from(document.querySelectorAll(sel));
      // Also catch fixed bottom-left black circular "Z" badges without relying on class names
      const candidates = Array.from(document.querySelectorAll('a,div,button,span')).filter((el) => {
        const style = window.getComputedStyle(el);
        if (style.position !== 'fixed') return false;
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.width > 72 || r.height < 20 || r.height > 72) return false;
        if (r.bottom < window.innerHeight - 96 || r.left > 96) return false;
        const t = (el.textContent || '').trim();
        const href = (el as HTMLAnchorElement).href || '';
        return t === 'Z' || t === 'z' || /z\.ai|space-z|chatglm/i.test(href);
      });
      const all = [...nodes, ...candidates];
      all.forEach((n) => n.remove());
    };
    killWatermarks();
    const mo = new MutationObserver(() => killWatermarks());
    mo.observe(document.documentElement, { childList: true, subtree: true });
    return () => mo.disconnect();
    // #endregion
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    (window as any).toggleThemeWithWipe = (x: number, y: number) => {
      const isLight = document.documentElement.classList.contains("light");
      const next = isLight ? "dark" : "light";

      // Reduced motion: instant switch
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setTheme(next);
        return;
      }

      const maxR = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Create the wipe overlay
      const wipe = document.createElement("div");
      wipe.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 10000;
        pointer-events: none;
        background: ${next === "dark" ? "oklch(0.16 0.026 254)" : "oklch(0.96 0.008 75)"};
        clip-path: circle(0px at ${x}px ${y}px);
        -webkit-clip-path: circle(0px at ${x}px ${y}px);
      `;
      document.body.appendChild(wipe);

      // Force reflow so the initial clip-path is applied
      void wipe.offsetHeight;

      // Animate the circle expanding using Web Animations API
      const animation = wipe.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)`, WebkitClipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${maxR}px at ${x}px ${y}px)`, WebkitClipPath: `circle(${maxR}px at ${x}px ${y}px)` },
        ],
        {
          duration: 600,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      );

      // Switch theme at the midpoint (300ms) — when the circle covers ~70% of the screen
      setTimeout(() => {
        setTheme(next);
      }, 300);

      // Remove the wipe after the animation completes
      animation.onfinish = () => {
        wipe.remove();
      };
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
