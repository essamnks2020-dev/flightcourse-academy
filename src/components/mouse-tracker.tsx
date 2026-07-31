"use client";

import * as React from "react";

/**
 * Mouse tracker — a smooth spring-physics follow dot.
 * Uses requestAnimationFrame for 60fps tracking. Grows when hovering
 * interactive elements. Hidden on touch devices and reduced-motion.
 */
export function MouseTracker() {
  const dotRef = React.useRef<HTMLDivElement | null>(null);
  const targetRef = React.useRef({ x: 0, y: 0 });
  const currentRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    let raf = 0;
    let started = false;

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!started) {
        started = true;
        currentRef.current = { ...targetRef.current };
        animate();
      }
    };

    const animate = () => {
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;
      currentRef.current.x += dx * 0.18;
      currentRef.current.y += dy * 0.18;

      dot.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px) translate(-50%, -50%)`;

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        raf = requestAnimationFrame(animate);
      } else {
        started = false;
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role='button'], input, [data-hover]")) {
        dot.classList.add("hovering");
      }
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role='button'], input, [data-hover]")) {
        dot.classList.remove("hovering");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={dotRef} className="mouse-tracker" aria-hidden="true" />;
}
