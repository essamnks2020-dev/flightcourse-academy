"use client";

import { Check, Sparkles, Plane, Radio, Map, BookOpen, Award, ArrowRight, Shield, Zap } from "lucide-react";
import { useNav } from "@/lib/nav-store";

const FREE_FEATURES = [
  "First 7 ground-school modules",
  "Module quizzes with XP",
  "Cockpit explorer (3D)",
  "76-term glossary",
  "5 Cessna 172 checklists",
  "5 free Flare Trainer landings/day",
  "Progress tracking (XP + badges)",
];

const PRO_FEATURES = [
  "All 16 modules (including IFR)",
  "Unlimited Flare Trainer landings",
  "Voice AI copilot in all games",
  "5-dimension landing scoring + replay",
  "Radio Builder (all scenarios)",
  "Pattern Perfect (all airports)",
  "Printable completion certificate",
  "Daily challenge (2× XP)",
  "Weak-area diagnostics + module links",
  "Priority for new features",
];

export function PaidPlanSection() {
  const navigate = useNav((s) => s.navigate);

  return (
    <section className="border-border border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-3 text-center animate-fade-up">
          <p className="label-instrument text-primary">Pricing</p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Free forever. Pro when you&apos;re ready.
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl leading-relaxed">
            No account required to start. No credit card for the free tier.
            Upgrade only when you want the full flight-school track.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Free tier */}
          <div className="glass flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-instrument text-muted-foreground mb-1">Free</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-semibold tracking-tight">$0</p>
                  <p className="text-sm text-muted-foreground">/forever</p>
                </div>
              </div>
              <BookOpen className="text-accent size-8" aria-hidden="true" />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5 text-success" />
              No account required
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Everything you need to start. No time limit, no credit card.
            </p>

            <ul className="flex flex-col gap-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("module", 1)}
              className="fp-outline-btn mt-auto w-full px-5 py-3 text-sm"
            >
              Start free
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Pro tier — featured */}
          <div className="glass glow-primary relative flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground label-instrument rounded-full px-3 py-1 shadow-lg">
                Recommended
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="label-instrument text-primary mb-1">FlightCourse Pro</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-semibold tracking-tight">$4.99</p>
                  <p className="text-sm text-muted-foreground">one-time</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">or $2.99/mo for ongoing updates</p>
              </div>
              <Sparkles className="text-primary size-8" aria-hidden="true" />
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-success" />
                30-day refund
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-primary" />
                Instant access
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              The full flight-school track. Everything free includes, plus:
            </p>

            <ul className="flex flex-col gap-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>

            {/* Game icons row */}
            <div className="flex items-center gap-4 border-border border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Plane className="size-3.5 text-primary" aria-hidden="true" />
                Flare
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Radio className="size-3.5 text-primary" aria-hidden="true" />
                Radio
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Map className="size-3.5 text-primary" aria-hidden="true" />
                Pattern
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Award className="size-3.5 text-primary" aria-hidden="true" />
                Certificate
              </div>
            </div>

            <button
              onClick={() => navigate("module", 1)}
              className="fp-toggle-btn mt-auto w-full px-5 py-3 text-sm"
            >
              <Sparkles className="size-4" />
              Unlock the full track
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
              <span>Stripe checkout</span>
              <span aria-hidden="true">·</span>
              <span>PayPal accepted</span>
              <span aria-hidden="true">·</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Trust line */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>For simulation training only</span>
          <span aria-hidden="true">·</span>
          <span>No subscription required for free tier</span>
          <span aria-hidden="true">·</span>
          <span>30-day money-back guarantee</span>
          <span aria-hidden="true">·</span>
          <span>Built by a 17-year-old who couldn&apos;t afford $200 courses</span>
        </div>
      </div>
    </section>
  );
}
