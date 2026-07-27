"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Check, X, Ban, ArrowRight, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  buildRadioCallScenario,
  type CallPosition,
  type AirportInfo,
  POSITION_LABELS,
} from "@/lib/data/phraseology";

interface Props {
  position: CallPosition;
  airport: AirportInfo;
  callsign: string;
  altitudeFt: number;
  onResolved: (r: {
    position: CallPosition;
    correct: boolean;
    banned: boolean;
    chosenText: string;
  }) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RadioCallPanel({
  position,
  airport,
  callsign,
  altitudeFt,
  onResolved,
}: Props) {
  const scenario = useMemo(
    () => buildRadioCallScenario(position, airport, callsign, altitudeFt),
    [position, airport, callsign, altitudeFt],
  );
  const options = useMemo(() => shuffle(scenario.options), [scenario]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  const selected = options.find((o) => o.id === selectedId) ?? null;

  // Keyboard operability: number keys 1-5 select options, Enter transmits,
  // arrow keys move between options. Accessible without a mouse.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (resolved) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (selected) onResolved({ position, correct: selected.correct, banned: !!selected.banned, chosenText: selected.text });
        }
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key, 10) - 1;
        if (options[idx]) {
          setSelectedId(options[idx].id);
          e.preventDefault();
        }
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        const idx = Math.min(options.length - 1, (selectedId ? options.findIndex((o) => o.id === selectedId) : -1) + 1);
        setSelectedId(options[idx].id);
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        const idx = Math.max(0, (selectedId ? options.findIndex((o) => o.id === selectedId) : 1) - 1);
        setSelectedId(options[idx].id);
        e.preventDefault();
      } else if (e.key === "Enter" && selected) {
        setResolved(true);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, selectedId, selected, resolved, position, onResolved]);

  const transmit = () => {
    if (!selected) return;
    setResolved(true);
  };

  const continueFlight = () => {
    if (!selected) return;
    onResolved({
      position,
      correct: selected.correct,
      banned: !!selected.banned,
      chosenText: selected.text,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex items-center justify-center bg-navy-deep/80 p-4 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-strong overflow-hidden border-sky/30 p-5 shadow-2xl shadow-navy-deep/50">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                className="glass-gold flex h-10 w-10 items-center justify-center rounded-full text-gold"
              >
                <Radio className="h-5 w-5" />
              </motion.div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  CTAF {airport.ctaf} · {airport.name} traffic
                </div>
                <div className="font-display text-lg font-bold text-foreground">
                  {POSITION_LABELS[position]}
                </div>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {scenario.prompt}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => {
                const isSelected = opt.id === selectedId;
                const showState = resolved && isSelected;
                return (
                  <motion.button
                    key={opt.id}
                    disabled={resolved}
                    onClick={() => setSelectedId(opt.id)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    whileHover={resolved ? {} : { x: 4 }}
                    whileTap={resolved ? {} : { scale: 0.99 }}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                      showState
                        ? opt.correct
                          ? "border-emerald-400/60 bg-emerald-400/10"
                          : opt.banned
                            ? "border-destructive/60 bg-destructive/15"
                            : "border-destructive/50 bg-destructive/10"
                        : isSelected
                          ? "border-gold bg-gold/10 ring-glow-gold"
                          : "border-border bg-background/40 hover:border-sky/50 hover:bg-sky/5"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors ${
                        showState
                          ? opt.correct
                            ? "border-emerald-400 bg-emerald-400/20 text-emerald-400"
                            : "border-destructive bg-destructive/20 text-destructive"
                          : isSelected
                            ? "border-gold bg-gold text-navy"
                            : "border-muted-foreground/40 text-transparent"
                      }`}
                    >
                      {showState ? (
                        opt.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />
                      ) : isSelected ? (
                        "•"
                      ) : null}
                    </span>
                    <span className="flex-1 font-mono text-[13px] leading-relaxed text-foreground">
                      {opt.text}
                      {opt.banned && (
                        <Badge variant="outline" className="ml-2 gap-1 border-destructive/50 text-destructive">
                          <Ban className="mr-0.5 h-3 w-3" /> banned
                        </Badge>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {resolved && selected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div
                    className={`mt-3 rounded-xl border p-3 text-sm ${
                      selected.correct
                        ? "border-emerald-400/40 bg-emerald-400/5 text-foreground"
                        : "border-destructive/40 bg-destructive/5 text-foreground"
                    }`}
                  >
                    <span className="font-semibold">
                      {selected.correct ? (
                        "Correct. "
                      ) : selected.banned ? (
                        "Banned phrase. "
                      ) : (
                        "Incorrect. "
                      )}
                    </span>
                    {selected.explanation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Waves className="h-3 w-3" />
                Say the airport name at the start AND end
              </span>
              {!resolved ? (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button onClick={transmit} disabled={!selected} className="gap-1.5 bg-gradient-to-r from-gold to-gold-warm text-navy shadow-lg shadow-gold/30">
                    Transmit <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button onClick={continueFlight} className="gap-1.5">
                    Continue flight <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
