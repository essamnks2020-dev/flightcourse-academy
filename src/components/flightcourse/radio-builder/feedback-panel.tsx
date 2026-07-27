"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";
import type { AttemptDiagnosis, Slot } from "@/lib/scenarios";
import { SLOT_META } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface Props {
  diagnosis: AttemptDiagnosis | null;
  scenarioTokens: { id: string; slot: Slot; text: string }[];
}

/**
 * Smart wrong-answer feedback. Instead of a bare shake, this panel:
 *  - names the first slot that diverged and what role it expected
 *  - lists any still-missing blocks by their role
 *  - explains WHY that role matters at that position
 * (Faded immediate feedback per learning science: highlight the
 *  first-divergence, name the role, explain why — don't just reveal.)
 */
export function FeedbackPanel({ diagnosis, scenarioTokens }: Props) {
  const show = diagnosis && !diagnosis.correct;
  return (
    <AnimatePresence>
      {show && diagnosis && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-red-400/40 bg-red-500/8 px-3.5 py-3 mt-1">
            <div className="flex items-center gap-2 text-red-300 text-[11px] font-mono tracking-wider mb-1.5">
              <AlertTriangle className="size-3.5" /> TRANSMISSION NOT ACCEPTED — SAY AGAIN
            </div>

            {diagnosis.firstDivergence !== null &&
            diagnosis.firstDivergence < scenarioTokens.length ? (
              <FeedbackFirstDiv
                diagnosis={diagnosis}
                scenarioTokens={scenarioTokens}
              />
            ) : diagnosis.placedCount < diagnosis.expectedCount ? (
              <p className="text-sm text-red-100/90 leading-relaxed">
                Your call is incomplete — you&apos;re missing{" "}
                <span className="font-mono text-red-200">
                  {diagnosis.expectedCount - diagnosis.placedCount}
                </span>{" "}
                block
                {diagnosis.expectedCount - diagnosis.placedCount > 1 ? "s" : ""}.
                Keep going.
              </p>
            ) : (
              <p className="text-sm text-red-100/90 leading-relaxed">
                Something&apos;s off with the order. Re-read your transmission and
                check the slot each block fills.
              </p>
            )}

            {diagnosis.missing.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {diagnosis.missing.map((m) => (
                  <span
                    key={m.tokenId}
                    className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-200"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: SLOT_META[m.slot].accent }}
                    />
                    {SLOT_META[m.slot].short}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 ml-1">
                  still to place
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeedbackFirstDiv({
  diagnosis,
  scenarioTokens,
}: {
  diagnosis: AttemptDiagnosis;
  scenarioTokens: { id: string; slot: Slot; text: string }[];
}) {
  const idx = diagnosis.firstDivergence!;
  const expectedTok = scenarioTokens[idx];
  if (!expectedTok) return null;
  const meta = SLOT_META[expectedTok.slot];
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-red-100/95 leading-relaxed">
        Position{" "}
        <span className="font-mono text-red-200">#{idx + 1}</span> should be the{" "}
        <span
          className="font-mono font-semibold"
          style={{ color: meta.accent }}
        >
          {meta.label}
        </span>{" "}
        slot. Right now you have a different block there.
      </p>
      <p className="text-xs text-slate-300/90 leading-relaxed flex items-start gap-1.5">
        <Info className="size-3.5 mt-0.5 shrink-0 text-sky-soft/70" />
        <span>{meta.role}</span>
      </p>
    </div>
  );
}

/** Compact slot legend shown above the pool so learners learn the anatomy. */
export function SlotLegend({
  slots,
  className,
}: {
  slots: Slot[];
  className?: string;
}) {
  const unique = Array.from(new Set(slots));
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      {unique.map((s) => {
        const m = SLOT_META[s];
        return (
          <span
            key={s}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400"
            title={m.role}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: m.accent, boxShadow: `0 0 6px ${m.accent}99` }}
            />
            {m.short}
          </span>
        );
      })}
    </div>
  );
}
