"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Settings, Monitor, Gamepad2, Cpu, Plane, Check, ChevronRight, DollarSign, TrendingUp, Eye } from "lucide-react";
import { setupGuide } from "@/lib/data/setup-guide";
import { cn } from "@/lib/utils";

export function SetupGuideView() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky mb-2">
          <Settings className="w-4 h-4" />
          Honest · Beginner-First
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Simulator Setup Guide
        </h1>
        <p className="text-muted-foreground max-w-2xl">{setupGuide.intro}</p>
      </div>

      {/* Minimum hardware */}
      <div className="fp-bezel bg-gradient-to-br from-sky/5 to-transparent border-sky/30 p-5 sm:p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-sky" />
          <h2 className="font-heading font-bold text-lg">Minimum Hardware</h2>
        </div>
        <p className="text-base leading-relaxed">{setupGuide.minimumHardware}</p>
      </div>

      {/* Platform comparison */}
      <section className="mb-10">
        <h2 className="font-heading font-bold text-2xl mb-1">Which Simulator?</h2>
        <p className="text-sm text-muted-foreground mb-5">Honest comparison — no favorites, just facts.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {setupGuide.platforms.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="fp-bezel bg-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading font-bold text-lg">{p.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-gold/15 text-gold-dark dark:text-gold-light flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />{p.price}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Learning Curve:</span>
                  <span className="ml-1 font-medium">{p.learningCurve}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Realism:</span>
                  <span className="ml-1 font-medium">{p.realism}</span>
                </div>
              </div>
              <div className="text-xs font-mono text-sky mb-2">Best for: {p.bestFor}</div>
              <div className="space-y-1.5 text-sm">
                <div>
                  <span className="text-green-600 font-mono text-xs">PROS</span>
                  <ul className="space-y-0.5 mt-1">
                    {p.pros.map((pro, j) => (
                      <li key={j} className="flex gap-1.5 text-muted-foreground">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <span className="text-red-500 font-mono text-xs">CONS</span>
                  <ul className="space-y-0.5 mt-1">
                    {p.cons.map((con, j) => (
                      <li key={j} className="flex gap-1.5 text-muted-foreground">
                        <span className="text-red-400 flex-shrink-0 mt-0.5">−</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hardware ranking */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 className="w-5 h-5 text-gold" />
          <h2 className="font-heading font-bold text-2xl">Hardware Ranking</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">From "you already have it" to "nice cockpit."</p>
        <div className="space-y-3">
          {setupGuide.hardwareRanking.map((hw, i) => (
            <div key={i} className="fp-bezel bg-card p-4 flex items-start gap-4">
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 flex items-center justify-center font-mono font-bold text-sm border",
                  hw.tier === "Essential" && "border-green-500/40 bg-green-500/10 text-green-600",
                  hw.tier === "Nice-to-Have" && "border-sky/40 bg-sky/10 text-sky",
                  hw.tier === "Enthusiast" && "border-gold/40 bg-gold/10 text-gold-dark dark:text-gold-light"
                )}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <h3 className="font-heading font-semibold text-sm">{hw.name}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5",
                        hw.tier === "Essential" && "bg-green-500/15 text-green-600",
                        hw.tier === "Nice-to-Have" && "bg-sky/15 text-sky",
                        hw.tier === "Enthusiast" && "bg-gold/15 text-gold-dark dark:text-gold-light"
                      )}
                    >
                      {hw.tier}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{hw.approxPrice}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{hw.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Graphics guidance */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="w-5 h-5 text-sky" />
          <h2 className="font-heading font-bold text-2xl">Graphics Settings for First-Timers</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Prioritize frames over fancy. You're learning to fly, not admiring sunsets.</p>
        <div className="fp-bezel bg-card divide-y divide-border">
          {setupGuide.graphicsGuidance.map((g, i) => (
            <div key={i} className="p-4 flex items-start gap-3">
              <div className="flex-1">
                <div className="font-heading font-semibold text-sm mb-0.5">{g.setting}</div>
                <div className="text-sm text-muted-foreground mb-1">{g.recommendation}</div>
                <div className="text-xs text-muted-foreground/70 italic">{g.why}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended first flight */}
      <section className="mb-10">
        <div className="fp-bezel bg-gradient-to-br from-gold/5 to-transparent border-gold/30 p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-6 h-6 text-gold" />
            <h2 className="font-heading font-bold text-xl">Your First Flight</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{setupGuide.recommendedFirstFlight.reason}</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="fp-bezel bg-card p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Aircraft</div>
              <div className="font-heading font-bold text-base">{setupGuide.recommendedFirstFlight.aircraft}</div>
            </div>
            <div className="fp-bezel bg-card p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Airport</div>
              <div className="font-heading font-bold text-base">{setupGuide.recommendedFirstFlight.airport} ({setupGuide.recommendedFirstFlight.icao})</div>
            </div>
          </div>
          <h3 className="font-heading font-semibold text-sm mb-3">Step by step:</h3>
          <ol className="space-y-2.5">
            {setupGuide.recommendedFirstFlight.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gold/20 text-gold-dark dark:text-gold-light font-mono font-bold text-xs">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
