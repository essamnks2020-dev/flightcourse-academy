'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { Debrief, DebriefInsight, RadarCallout } from '@/lib/coaching'
import type { FlightState } from '@/lib/aviation'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, Sparkles, XCircle } from 'lucide-react'

/**
 * CoachingHud — the real-time coaching overlay shown during Guided play.
 * Renders: radar-altitude callouts (50/40/30/20/10 + FLARE), a live hint bar,
 * and a subtle flare-zone indicator that pulses when in the ideal flare window.
 *
 * All values are read imperatively from refs (no per-frame React re-render) —
 * a 60fps interval writes to local state only when something changes.
 */
export function CoachingHud({
  stateRef,
  calloutsRef,
  hintRef,
}: {
  stateRef: React.RefObject<FlightState>
  calloutsRef: React.RefObject<RadarCallout[]>
  hintRef: React.RefObject<string | null>
}) {
  const [callouts, setCallouts] = React.useState<RadarCallout[]>([])
  const [hint, setHint] = React.useState<string | null>(null)
  const [inFlareWindow, setInFlareWindow] = React.useState(false)
  const [radarAlt, setRadarAlt] = React.useState<number | null>(null)

  React.useEffect(() => {
    let lastCalloutCount = 0
    let lastHint: string | null = null
    let lastWindow = false
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      // radar alt readout (when below 100ft)
      setRadarAlt(s.altitude < 100 ? Math.max(0, Math.round(s.altitude)) : null)
      // flare window indicator
      const inWindow = s.altitude <= 20 && s.altitude > 4 && s.flareFirstAlt === null
      if (inWindow !== lastWindow) {
        lastWindow = inWindow
        setInFlareWindow(inWindow)
      }
      // callouts
      const cs = calloutsRef.current
      if (cs.length !== lastCalloutCount) {
        lastCalloutCount = cs.length
        setCallouts(cs.slice(-3))
      }
      // hint
      const h = hintRef.current
      if (h !== lastHint) {
        lastHint = h
        setHint(h)
      }
    }, 80)
    return () => clearInterval(id)
  }, [stateRef, calloutsRef, hintRef])

  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 flex flex-col items-center gap-2 px-4">
      {/* radar altitude readout */}
      {radarAlt !== null && (
        <div className="rounded-md bg-black/50 px-2.5 py-1 font-mono text-xs text-accent backdrop-blur ring-1 ring-accent/20">
          RADAR&nbsp;
          <span className={cn('font-bold', radarAlt < 20 ? 'text-primary' : 'text-accent')}>
            {radarAlt}
          </span>
          <span className="text-muted-foreground"> ft</span>
        </div>
      )}

      {/* flare-zone indicator */}
      {inFlareWindow && (
        <div className="rounded-full border border-primary/60 bg-primary/15 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur animate-pulse-ring">
          FLARE WINDOW — round out now
        </div>
      )}

      {/* radar callouts (last few) */}
      {callouts.length > 0 && (
        <div className="flex flex-col-reverse items-center gap-1">
          {callouts.map((c, i) => (
            <div
              key={c.ts}
              className={cn(
                'rounded-md px-3 py-1 font-mono text-sm font-bold backdrop-blur transition-all',
                i === callouts.length - 1 ? 'bg-primary/25 text-primary ring-1 ring-primary/50' : 'bg-black/30 text-muted-foreground',
              )}
              style={{ opacity: 1 - i * 0.3 }}
            >
              {c.text}
            </div>
          ))}
        </div>
      )}

      {/* live hint */}
      {hint && (
        <div className="rounded-full border border-white/15 bg-black/60 px-4 py-1.5 text-xs text-foreground backdrop-blur shadow-lg">
          {hint}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DEBRIFF CARD
// ---------------------------------------------------------------------------
export function DebriefCard({ debrief, score }: { debrief: Debrief; score?: number }) {
  // Derive landing quality from the debrief headline / summary to drive the
  // XP-earned banner. The coaching `Debrief` type doesn't carry an explicit
  // `quality` field, so we infer it from the score (passed by the parent) and
  // the headline wording as a fallback.
  const quality = inferQuality(debrief, score)
  const xpGain =
    quality === 'greaser' ? 5 : quality === 'good' ? 3 : quality === 'firm' ? 2 : 0
  return (
    <div className="glass rounded-2xl p-4 shadow-lg">
      {/* headline */}
      <div className="mb-3 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-base text-foreground">{debrief.headline}</h3>
          <p className="text-xs text-muted-foreground">{debrief.summary}</p>
        </div>
      </div>

      {/* insights grid */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {debrief.insights.map((ins, i) => (
          <InsightRow key={i} ins={ins} />
        ))}
      </div>

      {/* cause → fix */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-destructive">
            <AlertTriangle className="h-3 w-3" /> What happened
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{debrief.cause}</p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <CheckCircle2 className="h-3 w-3" /> The fix
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{debrief.fix}</p>
        </div>
      </div>

      {/* pro tip */}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent/20 bg-accent/5 p-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <p className="text-xs leading-relaxed text-foreground/80">
          <span className="font-semibold text-accent">Pro tip: </span>
          {debrief.tip}
        </p>
      </div>

      {/* XP earned toward license tier (good landings only) */}
      {xpGain > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <Sparkles className="size-3.5 shrink-0 text-primary" />
          <p className="text-xs text-foreground/80">
            <span className="font-semibold text-primary">+{xpGain} XP</span> logged toward your next rating.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Infer the landing quality for the XP banner. The coaching `Debrief` doesn't
 * carry an explicit quality, so we read it from the headline (canonical
 * strings from `headlineFor` in coaching.ts) with the score as a fallback.
 */
function inferQuality(debrief: Debrief, score?: number): 'greaser' | 'good' | 'firm' | 'other' {
  if (debrief.headline.startsWith('Outstanding')) return 'greaser'
  if (debrief.headline.startsWith('Nice work')) return 'good'
  if (debrief.headline.startsWith('Acceptable')) return 'firm'
  // Fallback: a score of 70+ maps to firm-or-better territory.
  if (typeof score === 'number' && score >= 90) return 'greaser'
  if (typeof score === 'number' && score >= 75) return 'good'
  if (typeof score === 'number' && score >= 60) return 'firm'
  return 'other'
}

function InsightRow({ ins }: { ins: DebriefInsight }) {
  const cfg = {
    good: { icon: CheckCircle2, color: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/5' },
    warn: { icon: AlertTriangle, color: 'text-primary', border: 'border-white/15', bg: 'bg-white/[0.03]' },
    bad: { icon: XCircle, color: 'text-destructive', border: 'border-destructive/30', bg: 'bg-destructive/5' },
  }[ins.verdict]
  const Icon = cfg.icon
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border p-2', cfg.border, cfg.bg)}>
      <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {ins.metric}
          </span>
          <span className={cn('font-mono text-sm font-bold tabular-nums', cfg.color)}>
            {ins.value}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-tight text-foreground/70">{ins.note}</p>
      </div>
    </div>
  )
}
