'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { Debrief, DebriefInsight, RadarCallout } from '@/lib/coaching'
import type { FlightState } from '@/lib/aviation'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, XCircle } from 'lucide-react'

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
        <div className="rounded-md bg-black/50 px-2.5 py-1 font-jetbrains text-xs text-sky backdrop-blur ring-1 ring-sky/20">
          RADAR&nbsp;
          <span className={cn('font-bold', radarAlt < 20 ? 'text-horizon-gold' : 'text-sky')}>
            {radarAlt}
          </span>
          <span className="text-muted-foreground"> ft</span>
        </div>
      )}

      {/* flare-zone indicator */}
      {inFlareWindow && (
        <div className="rounded-full border border-horizon-gold/60 bg-horizon-gold/15 px-4 py-1.5 font-sora text-xs font-bold text-horizon-gold backdrop-blur fc-pulse-gold">
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
                'rounded-md px-3 py-1 font-jetbrains text-sm font-bold backdrop-blur transition-all',
                i === callouts.length - 1 ? 'bg-horizon-gold/25 text-horizon-gold ring-1 ring-horizon-gold/50' : 'bg-black/30 text-muted-foreground',
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
        <div className="rounded-full border border-white/15 bg-black/60 px-4 py-1.5 font-sora text-xs text-foreground backdrop-blur shadow-lg">
          {hint}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DEBRIFF CARD
// ---------------------------------------------------------------------------
export function DebriefCard({ debrief }: { debrief: Debrief }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md shadow-lg ring-1 ring-white/5">
      {/* headline */}
      <div className="mb-3 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-horizon-gold/15 text-horizon-gold ring-1 ring-horizon-gold/30">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-sora text-base font-bold text-foreground">{debrief.headline}</h3>
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
          <div className="mb-1 flex items-center gap-1.5 font-sora text-xs font-bold uppercase tracking-wider text-destructive">
            <AlertTriangle className="h-3 w-3" /> What happened
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{debrief.cause}</p>
        </div>
        <div className="rounded-lg border border-horizon-gold/30 bg-horizon-gold/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 font-sora text-xs font-bold uppercase tracking-wider text-horizon-gold">
            <CheckCircle2 className="h-3 w-3" /> The fix
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{debrief.fix}</p>
        </div>
      </div>

      {/* pro tip */}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-sky/20 bg-sky/5 p-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky" />
        <p className="text-xs leading-relaxed text-foreground/80">
          <span className="font-semibold text-sky">Pro tip: </span>
          {debrief.tip}
        </p>
      </div>
    </div>
  )
}

function InsightRow({ ins }: { ins: DebriefInsight }) {
  const cfg = {
    good: { icon: CheckCircle2, color: 'text-horizon-gold', border: 'border-horizon-gold/30', bg: 'bg-horizon-gold/5' },
    warn: { icon: AlertTriangle, color: 'text-e0a04a', border: 'border-white/15', bg: 'bg-white/[0.03]' },
    bad: { icon: XCircle, color: 'text-destructive', border: 'border-destructive/30', bg: 'bg-destructive/5' },
  }[ins.verdict]
  const Icon = cfg.icon
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border p-2', cfg.border, cfg.bg)}>
      <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-jetbrains text-[10px] uppercase tracking-wider text-muted-foreground">
            {ins.metric}
          </span>
          <span className={cn('font-jetbrains text-sm font-bold tabular-nums', cfg.color)}>
            {ins.value}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-tight text-foreground/70">{ins.note}</p>
      </div>
    </div>
  )
}
