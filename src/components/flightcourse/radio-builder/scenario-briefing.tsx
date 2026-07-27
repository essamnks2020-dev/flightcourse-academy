"use client";

import * as React from "react";
import { ArrowRight, MapPin, Navigation, Flag, Radio, Ear, Volume2 } from "lucide-react";
import type { Scenario } from "@/lib/scenarios";
import { PatternSketch } from "@/components/flightcourse/pattern-sketch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface Props {
  scenario: Scenario;
  onStart: () => void;
}

export function ScenarioBriefing({ scenario, onStart }: Props) {
  const isReadback = scenario.type === "readback";
  const speech = useSpeech();
  return (
    <div className="fc-glass fc-grain rounded-2xl p-4 sm:p-6 relative animate-rise">
      <span className="fc-screw absolute top-3 left-3" />
      <span className="fc-screw absolute top-3 right-3" />
      <span className="fc-screw absolute bottom-3 left-3" />
      <span className="fc-screw absolute bottom-3 right-3" />
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge className="bg-navy-600 border-sky/40 text-sky-soft font-mono">
          Scenario {scenario.index} / 12
        </Badge>
        <Badge
          className={
            isReadback
              ? "bg-gold/15 border-gold/50 text-gold font-mono"
              : "bg-sky/15 border-sky/50 text-sky-soft font-mono"
          }
        >
          {isReadback ? (
            <>
              <Ear className="size-3" /> READBACK CHALLENGE
            </>
          ) : (
            <>
              <Radio className="size-3" /> INITIAL CALL
            </>
          )}
        </Badge>
        <Badge variant="outline" className="border-white/15 text-slate-300 font-mono">
          {scenario.ref}
        </Badge>
      </div>

      <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
        {scenario.title}
      </h3>
      <p className="text-sm text-sky-soft/80 mb-4">{scenario.subtitle}</p>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {scenario.brief.situation}
          </p>

          {isReadback && scenario.atcInstruction && (
            <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-gold text-xs font-mono tracking-wider">
                  <Radio className="size-3.5" /> ATC TRANSMITS
                </div>
                <button
                  onClick={() => speech.speak(scenario.atcInstruction!, { scenarioKey: scenario.id + "-atc" })}
                  className="grid place-items-center h-7 w-7 rounded-md text-gold hover:bg-gold/15 transition-colors"
                  aria-label="Hear the ATC instruction"
                >
                  <Volume2 className={cn("size-3.5", speech.speaking && "animate-pulse")} />
                </button>
              </div>
              <p className="font-mono text-sm sm:text-base text-amber-50 leading-relaxed">
                &ldquo;{scenario.atcInstruction}&rdquo;
              </p>
              <p className="text-xs text-amber-200/70 mt-2">
                Listen, then read this back correctly below.
              </p>
            </div>
          )}

          <ul className="space-y-1.5 text-sm">
            <li className="flex items-start gap-2 text-slate-300">
              <MapPin className="size-4 text-sky mt-0.5 shrink-0" />
              <span><span className="text-slate-400">Position:</span> {scenario.brief.position}</span>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <Navigation className="size-4 text-sky mt-0.5 shrink-0" />
              <span><span className="text-slate-400">Intention:</span> {scenario.brief.intention}</span>
            </li>
            {scenario.brief.notes && (
              <li className="flex items-start gap-2 text-slate-300">
                <Flag className="size-4 text-gold mt-0.5 shrink-0" />
                <span><span className="text-slate-400">Note:</span> {scenario.brief.notes}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-xl overflow-hidden border border-sky/20 bg-navy-700/40">
          <PatternSketch kind={scenario.mapKind} runway={scenario.runway} className="w-full h-auto" />
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gold text-navy hover:bg-gold/90 font-semibold h-12 px-6"
        >
          Begin scenario <ArrowRight className="size-4" />
        </Button>
        <p className="text-xs text-slate-400">
          {isReadback
            ? "Assemble the correct readback, then Transmit."
            : "Build the transmission, then Transmit."}
        </p>
      </div>
    </div>
  );
}
