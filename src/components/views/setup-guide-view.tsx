"use client";

import * as React from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { setupGuide, type HardwareItem } from "@/lib/data/setup-guide";
import { useNav } from "@/lib/nav-store";

const HARDWARE_TIERS: HardwareItem["tier"][] = [
  "Essential",
  "Nice-to-Have",
  "Enthusiast",
];

/* ============================================================
 * Setup guide — honest simulator + hardware advice
 * Glass Cockpit design system. No emoji, no Framer Motion.
 * ========================================================== */

export function SetupGuideView() {
  const navigate = useNav((s) => s.navigate);
  const { recommendedFirstFlight: firstFlight } = setupGuide;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="mb-12 animate-fade-up">
        <p className="label-instrument text-primary mb-3">Getting started</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Set up your simulator
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          {setupGuide.intro}
        </p>
      </header>

      {/* Platform comparison */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          Which simulator should I buy?
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {setupGuide.platforms.map((p) => (
            <div
              key={p.name}
              className="glass flex flex-col gap-3 rounded-xl p-5"
            >
              {/* Name + curve badge in a row */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold tracking-tight leading-tight">{p.name}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {p.learningCurve} curve
                </span>
              </div>
              {/* Price on its own line — long strings need room */}
              <p className="nums text-sm font-medium text-primary leading-relaxed">
                {p.price}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {p.realism}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="label-instrument text-accent mr-1.5">
                  Best for
                </span>
                {p.bestFor}
              </p>
              <ul className="flex flex-col gap-1">
                {p.pros.map((pro, j) => (
                  <li key={j} className="flex gap-2 text-sm">
                    <Check className="text-success size-3.5 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{pro}</span>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col gap-1">
                {p.cons.map((con, j) => (
                  <li key={j} className="flex gap-2 text-sm">
                    <X className="text-destructive size-3.5 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">
                      {con}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Minimum hardware callout */}
      <section className="mb-12">
        <div className="glass rounded-xl p-5">
          <p className="label-instrument text-accent mb-3">Minimum hardware</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {setupGuide.minimumHardware}
          </p>
        </div>
      </section>

      {/* Hardware ranking by tier */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          What hardware actually matters
        </h2>
        <div className="flex flex-col gap-4">
          {HARDWARE_TIERS.map((tier) => {
            const items = setupGuide.hardwareRanking.filter(
              (h) => h.tier === tier
            );
            return (
              <section key={tier} className="glass rounded-xl p-5">
                <h3 className="label-instrument text-primary mb-4">{tier}</h3>
                <ul className="flex flex-col gap-3">
                  {items.map((hw, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{hw.name}</p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {hw.description}
                        </p>
                      </div>
                      <span className="nums text-sm text-muted-foreground shrink-0">
                        {hw.approxPrice}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      {/* Graphics guidance table */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          Graphics settings to learn with
        </h2>
        <div className="glass overflow-hidden rounded-xl">
          <div className="hidden border-b border-border sm:grid sm:grid-cols-[12rem_14rem_1fr] sm:gap-4 sm:px-4 sm:py-3">
            <span className="label-instrument text-muted-foreground">
              Setting
            </span>
            <span className="label-instrument text-muted-foreground">
              Recommendation
            </span>
            <span className="label-instrument text-muted-foreground">Why</span>
          </div>
          {setupGuide.graphicsGuidance.map((g, i) => (
            <div
              key={i}
              className="border-border flex flex-col gap-1.5 border-t p-4 text-sm sm:grid sm:grid-cols-[12rem_14rem_1fr] sm:items-start sm:gap-4"
            >
              <div className="font-medium">{g.setting}</div>
              <div className="text-accent">{g.recommendation}</div>
              <div className="text-muted-foreground leading-relaxed">
                {g.why}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended first flight */}
      <section className="mb-4">
        <div className="glass glow-primary flex flex-col gap-4 rounded-2xl p-6">
          <p className="label-instrument text-primary">Your first flight</p>
          <h3 className="text-xl font-semibold tracking-tight">
            {firstFlight.aircraft} at {firstFlight.airport} ({firstFlight.icao})
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            {firstFlight.reason}
          </p>
          <ol className="marker:text-primary flex list-decimal flex-col gap-2 pl-5 text-sm marker:font-mono">
            {firstFlight.steps.map((step, i) => (
              <li key={i} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
          <button
            onClick={() => navigate("module", 1)}
            className="fp-toggle-btn mt-2 self-start px-5 py-2.5 text-sm"
          >
            Start module 1
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
