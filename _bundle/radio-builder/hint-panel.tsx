"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Layers, KeyRound, Sparkles } from "lucide-react";
import type { Slot } from "@/lib/scenarios";
import { SLOT_META } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

export interface TieredHintInfo {
  tier: 1 | 2 | 3;
  /** Slot the next block belongs to (tier 1). */
  slot?: Slot;
  /** The block text (tier 2/3). */
  text?: string;
  /** Teaching reason. */
  why: string;
}

interface Props {
  hint: TieredHintInfo | null;
  hintsUsed: number;
  maxHints: number;
  onHint: () => void;
  disabled?: boolean;
}

const TIER_META = [
  { tier: 1 as const, label: "Structure", icon: Layers, color: "#3E92CC" },
  { tier: 2 as const, label: "Block", icon: KeyRound, color: "#F2B134" },
  { tier: 3 as const, label: "Place", icon: Sparkles, color: "#5BFF9B" },
];

export function HintPanel({ hint, hintsUsed, maxHints, onHint, disabled }: Props) {
  const nextTier = (Math.min(hintsUsed, maxHints - 1) + 1) as 1 | 2 | 3;
  const tierMeta = TIER_META[nextTier - 1];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onHint}
          disabled={disabled || hintsUsed >= maxHints}
          className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold hover:bg-gold/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Lightbulb className="size-4" />
          {hintsUsed >= maxHints
            ? "No hints left"
            : `Hint · ${tierMeta.label}`}
          {!disabled && hintsUsed < maxHints && (
            <span
              className="inline-flex items-center justify-center"
              title={`Tier ${nextTier}`}
            >
              <tierMeta.icon className="size-3.5" style={{ color: tierMeta.color }} />
            </span>
          )}
        </button>
        <div className="flex items-center gap-1" title={`${hintsUsed}/${maxHints} hints used`}>
          {Array.from({ length: maxHints }).map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 w-5 rounded-full transition-colors " +
                (i < hintsUsed ? "bg-gold" : "bg-white/10")
              }
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {hint && (
          <motion.div
            key={hint.tier + ":" + (hint.text ?? "") + hintsUsed}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5"
          >
            <div className="flex items-center gap-2 text-gold text-[11px] font-mono tracking-wider mb-1">
              <Lightbulb className="size-3.5" /> HINT · TIER {hint.tier} · {TIER_META[hint.tier - 1].label.toUpperCase()}
            </div>

            {hint.tier === 1 && hint.slot ? (
              <p className="text-sm text-amber-50 leading-relaxed">
                The next block fills the{" "}
                <span
                  className="font-mono font-semibold"
                  style={{ color: SLOT_META[hint.slot].accent }}
                >
                  {SLOT_META[hint.slot].label}
                </span>{" "}
                slot.
                <span className="block text-xs text-amber-100/70 mt-1">
                  {hint.why}
                </span>
              </p>
            ) : (
              <p className="text-sm text-amber-50 leading-relaxed">
                <span className="font-mono text-gold">
                  &ldquo;{hint.text}&rdquo;
                </span>{" "}
                comes next.
                <span className="block text-xs text-amber-100/70 mt-1">
                  {hint.why}
                </span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
