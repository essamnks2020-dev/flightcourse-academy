"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";
import type { AIRadioCall } from "@/lib/pattern/types";

interface Props {
  transcript: AIRadioCall[];
  playerCallsign: string;
}

/**
 * Live CTAF transcript — surfaces every transmission (player + AI traffic) as
 * readable text, so the experience is complete even when muted. Newest at the
 * bottom; auto-limited to the last ~12 calls.
 */
export function CtacTranscript({ transcript, playerCallsign }: Props) {
  if (transcript.length === 0) return null;
  return (
    <div className="pointer-events-none absolute right-3 top-32 z-10 w-64 max-w-[55vw]">
      <div className="glass-strong rounded-lg border border-sky/25 p-2 backdrop-blur-md">
        <div className="mb-1 flex items-center gap-1.5 border-b border-border/50 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3 w-3 text-sky" /> CTAF · live
        </div>
        <div className="flex max-h-40 flex-col gap-1 overflow-y-auto scroll-thin pr-1">
          <AnimatePresence initial={false}>
            {transcript.map((c, i) => {
              const isPlayer = c.actorId === "player" || c.callsign === playerCallsign;
              return (
                <motion.div
                  key={`${c.actorId}-${c.position}-${i}`}
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded px-1.5 py-1 text-[11px] leading-tight ${
                    isPlayer
                      ? "bg-gold/10 border-l-2 border-gold"
                      : c.hasError
                        ? "bg-destructive/10 border-l-2 border-destructive"
                        : "bg-sky/5 border-l-2 border-sky/50"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className={`font-mono font-semibold ${isPlayer ? "text-gold" : c.hasError ? "text-destructive" : "text-sky"}`}>
                      {isPlayer ? "YOU" : c.callsign.split(" ").slice(-1)[0]}
                    </span>
                    {c.hasError && (
                      <span className="text-[9px] uppercase tracking-wide text-destructive">err</span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{c.text}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
