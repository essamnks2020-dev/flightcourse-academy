"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Compass, Radio, HelpCircle, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GLOSSARY, PROCEDURE_WHY, LEG_REFERENCE } from "@/lib/data/ground-school";

type Tab = "legs" | "why" | "glossary";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "legs", label: "Pattern legs", icon: <Compass className="h-4 w-4" /> },
  { id: "why", label: "Why it's done", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "glossary", label: "Glossary", icon: <BookOpen className="h-4 w-4" /> },
];

export function ReferencePanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("legs");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, y: 10 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="glass-strong max-h-[85vh] overflow-hidden border-sky/30">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <div className="glass-gold flex h-9 w-9 items-center justify-center rounded-full text-gold">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-foreground">Ground School</div>
                <div className="text-xs text-muted-foreground">Pattern operations · FAA AC 90-66C & AIM 4-1-9</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border p-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === t.id
                    ? "bg-gold/15 text-gold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Content (scrollable) */}
          <div className="max-h-[60vh] overflow-y-auto scroll-thin p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab === "legs" && (
                  <div className="flex flex-col gap-3">
                    {/* Labeled pattern diagram (procedural, matches the live game style) */}
                    <PatternDiagram />
                    {LEG_REFERENCE.map((leg) => (
                      <div key={leg.leg} className="rounded-lg border border-border bg-background/40 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm font-bold text-foreground">{leg.leg}</span>
                          <Badge variant="outline" className="font-mono text-xs text-sky">{leg.altitude}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{leg.description}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-gold">
                          <Radio className="h-3 w-3" />
                          <span className="font-mono">Call: "{leg.call}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "why" && (
                  <div className="flex flex-col gap-3">
                    {PROCEDURE_WHY.map((p) => (
                      <div key={p.topic} className="rounded-lg border border-border bg-background/40 p-3">
                        <h4 className="font-display text-sm font-bold text-foreground">{p.topic}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.why}</p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span className="font-mono">{p.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "glossary" && (
                  <div className="flex flex-col gap-2">
                    {GLOSSARY.map((g) => (
                      <div key={g.term} className="rounded-lg border border-border bg-background/40 p-3">
                        <div className="font-display text-sm font-bold text-sky">{g.term}</div>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.definition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/** Small SVG pattern diagram rendered in the same visual language as the game. */
function PatternDiagram() {
  return (
    <div className="rounded-lg border border-border bg-navy-deep/60 p-4">
      <svg viewBox="0 0 200 140" className="w-full">
        {/* Runway */}
        <line x1="60" y1="120" x2="140" y2="120" stroke="#eaf2fb" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        <text x="58" y="118" fill="#eaf2fb" fontSize="7" textAnchor="end">27</text>
        {/* Guide path (dashed gold) */}
        <path
          d="M 30 30 L 50 50 L 150 50 Q 160 50 160 60 L 160 90 Q 160 100 150 100 L 50 100"
          fill="none"
          stroke="#f2b134"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.7"
        />
        {/* Leg labels */}
        <text x="35" y="25" fill="#3e92cc" fontSize="6">Entry 45°</text>
        <text x="95" y="45" fill="#3e92cc" fontSize="6">Downwind</text>
        <text x="165" y="75" fill="#f2b134" fontSize="6">Base</text>
        <text x="95" y="115" fill="#f2b134" fontSize="6">Final</text>
        {/* Direction arrows */}
        <polygon points="150,50 146,47 146,53" fill="#f2b134" />
        <polygon points="160,90 157,94 163,94" fill="#f2b134" />
        <polygon points="50,100 54,97 54,103" fill="#f2b134" />
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Standard left-hand pattern · 1,000 ft AGL · enter at 45° to downwind
      </p>
    </div>
  );
}
