"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, X, Volume2, Radio, Ear } from "lucide-react";
import { SCENARIOS, SLOT_META, SLOT_ORDER, type Slot } from "@/lib/scenarios";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PhraseologyGuide({ open, onClose }: Props) {
  const speech = useSpeech();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fc-glass fc-grain rounded-2xl w-full max-w-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto fc-scroll"
      >
        <span className="fc-screw absolute top-3 left-3" />
        <span className="fc-screw absolute top-3 right-3" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white z-10"
          aria-label="Close guide"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2 text-gold text-xs font-mono tracking-widest mb-1">
          <BookOpen className="size-4" /> PHRASEOLOGY GUIDE
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
          The anatomy of a pilot radio call
        </h3>
        <p className="text-sm text-slate-300 mt-1 mb-4">
          Every call follows the same skeleton — the{" "}
          <span className="text-sky-soft font-semibold">Four W&apos;s</span>. Learn the
          slots and you can build any call, not just memorize scripts.{" "}
          <span className="text-slate-400">(AIM 4-2)</span>
        </p>

        {/* Slot anatomy */}
        <div className="space-y-2 mb-5">
          {SLOT_ORDER.filter((s) => s !== "distress").map((slot: Slot) => {
            const m = SLOT_META[slot];
            return (
              <div
                key={slot}
                className="flex items-start gap-3 rounded-lg fc-glass-soft border border-white/8 px-3 py-2.5"
              >
                <span
                  className="mt-1 h-3 w-3 rounded-full shrink-0"
                  style={{ background: m.accent, boxShadow: `0 0 8px ${m.accent}99` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {m.short}
                    </span>
                    <span className="text-xs text-slate-400">— {m.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{m.role}</p>
                </div>
              </div>
            );
          })}
          <div className="flex items-start gap-3 rounded-lg fc-glass-soft border border-red-400/20 px-3 py-2.5">
            <span
              className="mt-1 h-3 w-3 rounded-full shrink-0"
              style={{ background: SLOT_META.distress.accent, boxShadow: `0 0 8px ${SLOT_META.distress.accent}99` }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-300">MAYDAY</span>
                <span className="text-xs text-slate-400">— Distress Signal</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{SLOT_META.distress.role}</p>
            </div>
          </div>
        </div>

        {/* Quick-reference examples */}
        <div className="flex items-center gap-2 text-sky-soft text-xs font-mono tracking-wider mb-2">
          <Radio className="size-3.5" /> QUICK-REFERENCE EXAMPLES
        </div>
        <div className="space-y-2">
          {SCENARIOS.slice(0, 6).map((sc) => (
            <div
              key={sc.id}
              className="rounded-lg fc-glass-soft border border-white/8 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {sc.title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">{sc.ref}</span>
                  <button
                    onClick={() => speech.speak(sc.fullPhrase, { scenarioKey: sc.id })}
                    className="grid place-items-center h-7 w-7 rounded-md text-sky-soft hover:bg-sky/15 transition-colors"
                    aria-label={`Hear: ${sc.title}`}
                  >
                    <Volume2 className={cn("size-3.5", speech.speaking && "animate-pulse")} />
                  </button>
                </div>
              </div>
              <p className="font-mono text-xs text-emerald-200/90 leading-relaxed">
                {sc.fullPhrase}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-sky/20 bg-sky/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sky-soft text-[11px] font-mono tracking-wider mb-1">
            <Ear className="size-3.5" /> PRO TIP
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tap any <Volume2 className="inline size-3" /> icon to hear the call spoken.
            Hearing correct phraseology is how your ear trains — say each call aloud as
            you build it.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
