"use client";

import * as React from "react";
import { Plane, Github, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#060F22]/70 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Plane className="size-3.5 -rotate-45 text-sky-soft/60" />
          <span className="font-mono">
            Flight<span className="text-gold/80">Course</span> · Radio Call Builder
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-400/70" />
            FAA AIM phraseology
          </span>
          <span className="font-mono text-slate-400">
            for MSFS &amp; X-Plane students
          </span>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 hover:text-sky-soft transition-colors"
            aria-label="Source"
          >
            <Github className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
