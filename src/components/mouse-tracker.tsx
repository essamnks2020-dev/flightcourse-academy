"use client";

import * as React from "react";

/**
 * Mouse tracker — 3-element system (dot + ring + glow) with velocity-based
 * stretching. Adapted from Essam Al Harthy's portfolio.
 *
 * - dot: follows cursor instantly, scales on press
 * - ring: follows with spring physics, stretches in movement direction
 * - glow: follows slowly, creates a trailing ambient glow
 * - hover: ring scales up on interactive elements
 * - visibility: fades out when mouse leaves the window
 */
export function MouseTracker() {
  const dotRef = React.useRef<HTMLDivElement | null>(null);
  const ringRef = React.useRef<HTMLDivElement | null>(null);
  const glowRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my, gx = mx, gy = my;
    let hoverT = 1, hoverS = 1, pressT = 1, pressS = 1;
    let vis = 1, visT = 1, lastAng = 0;
    let raf = 0;
    let cLast = performance.now();

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      visT = 1;
    };
    const onOver = (e: PointerEvent) => {
      hoverT = e.target instanceof Element && e.target.closest("a,button,[role='button'],input,summary,.glass")
        ? 1.7 : 1;
    };
    const onDown = () => { pressT = 0.72; };
    const onUp = () => { pressT = 1; };
    const onLeave = () => { visT = 0; };
    const onEnter = () => { visT = 1; };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    const loop = (now: number) => {
      const dt = Math.min((now - cLast) / 1000, 0.05);
      cLast = now;

      const kDot = 1 - Math.exp(-30 * dt);
      const kRing = 1 - Math.exp(-11 * dt);
      const kGlow = 1 - Math.exp(-4.5 * dt);

      const prx = rx, pry = ry;
      rx += (mx - rx) * kRing;
      ry += (my - ry) * kRing;
      gx += (mx - gx) * kGlow;
      gy += (my - gy) * kGlow;

      const vx = (rx - prx) / Math.max(dt, 0.001);
      const vy = (ry - pry) / Math.max(dt, 0.001);
      const sp = Math.hypot(vx, vy);
      if (sp > 40) lastAng = Math.atan2(vy, vx);
      const stretch = Math.min(sp / 2400, 0.28);

      hoverS += (hoverT - hoverS) * (1 - Math.exp(-12 * dt));
      pressS += (pressT - pressS) * (1 - Math.exp(-14 * dt));
      vis += (visT - vis) * (1 - Math.exp(-8 * dt));

      const s = hoverS * pressS;

      dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%) scale(${pressS.toFixed(3)})`;
      dot.style.opacity = vis.toFixed(3);

      ring.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0) translate(-50%,-50%) rotate(${lastAng.toFixed(3)}rad) scale(${(s * (1 + stretch)).toFixed(3)},${(s * (1 - stretch * 0.7)).toFixed(3)})`;
      ring.style.opacity = (0.55 * vis).toFixed(3);

      glow.style.transform = `translate3d(${gx.toFixed(2)}px,${gy.toFixed(2)}px,0) translate(-50%,-50%)`;
      glow.style.opacity = (0.4 * vis).toFixed(3);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
