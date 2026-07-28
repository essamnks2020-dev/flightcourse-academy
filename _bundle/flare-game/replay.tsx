'use client'

import * as React from 'react'
import { GameCanvas, type GameCanvasHandle } from './game-canvas'
import { InstrumentCluster } from '@/components/cockpit/instrument-cluster'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import type { Attempt, FlightState, GameEnv, TelemetryFrame } from '@/lib/aviation'
import { QUALITY_LABELS, QUALITY_COLORS } from '@/lib/aviation'
import { track } from '@/lib/funnel'
import { cn } from '@/lib/utils'

function frameToState(f: TelemetryFrame): FlightState {
  return {
    altitude: f.altitude,
    airspeed: f.airspeed,
    vsi: f.vsi,
    pitch: f.pitch,
    distance: f.distance,
    lateral: f.lateral,
    crab: f.crab,
    onGround: f.onGround,
    stalled: f.stalled,
    bounces: f.bounces,
    airborne: !f.onGround,
    ended: f.onGround,
    elapsed: f.t,
    flareHold: 0,
    flareHeld: f.flare,
    flareFirstAlt: null,
    result: null,
  }
}

export function Replay({ attempt }: { attempt: Attempt }) {
  const canvasRef = React.useRef<GameCanvasHandle>(null)
  const [idx, setIdx] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const playingRef = React.useRef(false)
  const idxRef = React.useRef(0)
  const startReal = React.useRef(0)
  const startT = React.useRef(0)
  const scrubbed = React.useRef(false)

  const tel = attempt.telemetry
  const env: GameEnv = React.useMemo(
    () => ({
      crosswind: attempt.crosswind ? 10 : 0,
      gust: 0,
      headwind: 3,
      daylight: 0.92,
      rain: 0,
      fog: 0,
      turbulence: 0,
      runwayHeading: '27',
      runwayLength: 4000,
      surface: 'paved' as const,
    }),
    [attempt.crosswind],
  )

  const renderAt = React.useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(tel.length - 1, i))
      idxRef.current = clamped
      setIdx(clamped)
      const f = tel[clamped]
      if (f) canvasRef.current?.renderFrame(frameToState(f), env)
    },
    [tel, env],
  )

  // initial render
  React.useEffect(() => {
    renderAt(0)
  }, [renderAt])

  // play loop
  React.useEffect(() => {
    if (!playing) return
    playingRef.current = true
    startReal.current = performance.now()
    startT.current = tel[idxRef.current]?.t ?? 0
    let raf = 0
    const tick = () => {
      if (!playingRef.current) return
      const elapsed = startT.current + (performance.now() - startReal.current)
      // find frame with t closest to elapsed
      let lo = 0
      let hi = tel.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (tel[mid].t < elapsed) lo = mid + 1
        else hi = mid
      }
      if (lo >= tel.length - 1 || tel[lo].t >= tel[tel.length - 1].t) {
        renderAt(tel.length - 1)
        setPlaying(false)
        playingRef.current = false
        return
      }
      renderAt(lo)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      playingRef.current = false
      cancelAnimationFrame(raf)
    }
  }, [playing, tel, renderAt])

  const onScrub = (v: number[]) => {
    scrubbed.current = true
    setPlaying(false)
    renderAt(v[0])
    track.replayScrubbed(attempt.quality)
  }

  const cur = tel[idx]
  const qualityColor = QUALITY_COLORS[attempt.quality]

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-navy">
        <GameCanvas ref={canvasRef} className="h-full w-full" />
        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 font-jetbrains text-xs text-sky backdrop-blur">
          REPLAY · T+{((cur?.t ?? 0) / 1000).toFixed(1)}s
        </div>
        <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1 font-jetbrains text-xs backdrop-blur" style={{ color: qualityColor }}>
          {QUALITY_LABELS[attempt.quality]}
        </div>
      </div>

      <InstrumentCluster
        altitude={cur?.altitude}
        airspeed={cur?.airspeed}
        vsi={cur?.vsi}
        compact
        className="rounded-xl bg-black/20 p-2"
      />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onScrub([Math.max(0, idx - 5)])}
          aria-label="Back 5 frames"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant={playing ? 'secondary' : 'default'}
          onClick={() => {
            if (idx >= tel.length - 1) renderAt(0)
            setPlaying((p) => !p)
          }}
          className="min-w-[96px]"
        >
          {playing ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
          {playing ? 'Pause' : idx >= tel.length - 1 ? 'Replay' : 'Play'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onScrub([Math.min(tel.length - 1, idx + 5)])}
          aria-label="Forward 5 frames"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Slider
          value={[idx]}
          min={0}
          max={Math.max(0, tel.length - 1)}
          step={1}
          onValueChange={onScrub}
          className="flex-1"
          aria-label="Scrub replay timeline"
        />
        <span className="w-16 text-right font-jetbrains text-xs text-muted-foreground">
          {idx + 1}/{tel.length}
        </span>
      </div>
    </div>
  )
}
