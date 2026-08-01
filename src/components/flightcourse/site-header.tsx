"use client";

import * as React from "react";
import { Plane, Radio } from "lucide-react";
import { SignalBars as Sig } from "@/components/flightcourse/instruments";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0B1D3A]/70 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative grid place-items-center h-10 w-10 rounded-xl fc-bezel">
            <Plane className="size-5 -rotate-45 text-sky-soft" />
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
          </span>
          <div className="leading-none">
            <div className="font-display font-bold text-white text-lg tracking-tight">
              Flight<span className="text-gold">Course</span>
            </div>
            <div className="text-[10px] font-mono text-sky-soft/70 tracking-[0.2em] mt-0.5">
              CESSNA 172 · BEGINNER TRAINING
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 rounded-full fc-glass-soft px-3 py-1.5">
            <Sig idle />
            <span className="text-[11px] font-mono text-slate-300 tracking-wider">
              COM1 · 122.725
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-gold tracking-wider">
            <Radio className="size-3.5" />
            <span className="hidden sm:inline">RADIO CALL BUILDER</span>
            <span className="sm:hidden">RADIO</span>
          </span>
        </div>
      </div>
    </header>
  );
}
