"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Living cockpit ambience: animated gradient orbs, hairline grid,
 * vignette, film grain, and slow-floating dust motes.
 * Purely decorative — pointer-events disabled, fixed behind content.
 */
export function CockpitAmbience({ className }: { className?: string }) {
  const motes = React.useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: `${(i * 37 + 7) % 100}%`,
        delay: `${(i * 1.7) % 12}s`,
        dur: `${12 + (i % 5) * 3}s`,
        size: 1 + (i % 3),
        op: 0.18 + (i % 4) * 0.08,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* animated color orbs */}
      <div
        className="fc-orb-a absolute -top-32 -right-24 h-[34rem] w-[34rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(62,146,204,0.42), transparent 65%)" }}
      />
      <div
        className="fc-orb-b absolute top-1/3 -left-32 h-[30rem] w-[30rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(242,177,52,0.30), transparent 65%)" }}
      />
      <div
        className="fc-orb-a absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(91,255,155,0.16), transparent 65%)", animationDelay: "-6s" }}
      />

      {/* hairline grid */}
      <div className="fc-grid-bg absolute inset-0 opacity-60" />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(4,10,24,0.7) 100%)" }}
      />

      {/* film grain */}
      <div className="fc-grain absolute inset-0 opacity-70" />

      {/* floating motes — use a class so prefers-reduced-motion can disable */}
      {motes.map((m, i) => (
        <span
          key={i}
          className="fc-mote absolute bottom-0 rounded-full"
          style={{
            left: m.left,
            width: m.size,
            height: m.size,
            background: "rgba(160,200,240,0.8)",
            opacity: m.op,
            boxShadow: "0 0 6px rgba(160,200,240,0.6)",
            animationDuration: m.dur,
            animationDelay: m.delay,
          }}
        />
      ))}
    </div>
  );
}
