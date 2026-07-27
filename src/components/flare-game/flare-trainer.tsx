'use client'

import * as React from 'react'
import { GameCanvas, type GameCanvasHandle } from './game-canvas'
import { CockpitCanvas, type CockpitCanvasHandle } from './cockpit-canvas'
import { InstrumentCluster, type InstrumentClusterHandle } from '@/components/cockpit/instrument-cluster'
import { Replay } from './replay'
import { ShareCard } from './share-card'
import { PaywallDialog } from './paywall-dialog'
import { ProgressDashboard } from '@/components/dashboard/progress-dashboard'
import { CoachingHud, DebriefCard } from './coaching-ui'
import { TelemetryChart } from './telemetry-chart'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge as UiBadge } from '@/components/ui/badge'
import { Wind, Space, Hand, Trophy, RotateCcw, Home, Plane, Zap, GraduationCap, Gauge, Power, Volume2, VolumeX, Eye } from 'lucide-react'
import { getAudio } from '@/lib/audio'
import {
  createInitialState,
  createEnv,
  stepFlight,
  frameFromState,
  getScenario,
  SCENARIOS,
  QUALITY_LABELS,
  QUALITY_COLORS,
  APPROACH_SPEED,
  type FlightState,
  type GameEnv,
  type Attempt,
  type LandingQuality,
  type ScenarioId,
} from '@/lib/aviation'
import { liveHint, checkRadarCallout, buildDebrief, type RadarCallout } from '@/lib/coaching'
import { useProgressStore } from '@/stores/progress-store'
import { track } from '@/lib/funnel'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Phase = 'start' | 'playing' | 'result'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// --- Bug 5: bezel-metal styling borrowed from InstrumentFrame so the HUD
// overlay reads as part of the same instrument panel as the gauges, not a
// generic web widget. The gradient + bevel match instrument-frame.tsx's
// `ring` and `bevel` defs; the top highlight is emphasized so the metal
// reads clearly even at small pill size. ---
const METAL_GRADIENT =
  'linear-gradient(180deg, #8a9cb4 0%, #4a5b78 18%, #1a2740 55%, #0c1626 85%, #445468 100%)'
const bezelPillStyle: React.CSSProperties = {
  background: METAL_GRADIENT,
  boxShadow:
    'inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 1px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)',
  border: '1px solid rgba(0,0,0,0.55)',
  borderTopColor: 'rgba(180,200,225,0.4)',
}
const bezelButtonStyle: React.CSSProperties = {
  background: METAL_GRADIENT,
  boxShadow:
    'inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.55), 0 2px 5px rgba(0,0,0,0.5)',
  border: '1px solid rgba(0,0,0,0.6)',
  borderTopColor: 'rgba(180,200,225,0.35)',
}

export interface FlareTrainerProps {
  className?: string
}

export function FlareTrainer({ className }: FlareTrainerProps) {
  const [phase, setPhase] = React.useState<Phase>('start')
  const phaseRef = React.useRef<Phase>('start')
  const [paywallOpen, setPaywallOpen] = React.useState(false)
  const [lastAttempt, setLastAttempt] = React.useState<Attempt | null>(null)
  const [newBadges, setNewBadges] = React.useState<string[]>([])
  const [bonusGranted, setBonusGranted] = React.useState(false)
  const [guided, setGuided] = React.useState(true)
  const guidedRef = React.useRef(true)
  const [view, setView] = React.useState<'external' | 'cockpit'>('cockpit')
  const viewRef = React.useRef<'external' | 'cockpit'>('cockpit')

  const canvasRef = React.useRef<GameCanvasHandle>(null)
  const cockpitRef = React.useRef<CockpitCanvasHandle>(null)
  const clusterRef = React.useRef<InstrumentClusterHandle>(null)
  const audio = React.useMemo(() => getAudio(), [])

  // live game refs (scenarioObj is set after store selectors below)
  const flareRef = React.useRef(false)
  const rafRef = React.useRef(0)
  const lastTime = React.useRef(0)
  const lastSample = React.useRef(0)
  const telemetryRef = React.useRef<ReturnType<typeof frameFromState>[]>([])
  const endedAt = React.useRef<number | null>(null)
  const touchdownAtRef = React.useRef<number | null>(null)
  const recordedRef = React.useRef(false)
  const lastCalloutRef = React.useRef(999)
  const calloutsRef = React.useRef<RadarCallout[]>([])
  const currentHintRef = React.useRef<string | null>(null)
  const stable500Checked = React.useRef(false)
  const stable500Result = React.useRef<boolean | null>(null)

  // store selectors
  const freePlays = useProgressStore((s) => s.freePlays)
  const unlimited = useProgressStore((s) => s.unlimitedUnlocked)
  const scenario = useProgressStore((s) => s.scenario)
  const setScenario = useProgressStore((s) => s.setScenario)
  const soundOn = useProgressStore((s) => s.soundOn)
  const setSound = useProgressStore((s) => s.setSound)
  const voiceCallouts = useProgressStore((s) => s.voiceCallouts)
  const reducedMotion = useProgressStore((s) => s.reducedMotion)
  const colorblindMode = useProgressStore((s) => s.colorblindMode)
  const bestScore = useProgressStore((s) => s.bestScore)
  const consumePlay = useProgressStore((s) => s.consumePlay)
  const recordAttempt = useProgressStore((s) => s.recordAttempt)

  // scenario object (depends on `scenario` from the store above)
  const scenarioObj = React.useMemo(() => getScenario(scenario), [scenario])
  const stateRef = React.useRef<FlightState>(createInitialState(scenarioObj))
  const envRef = React.useRef<GameEnv>(createEnv(scenarioObj))

  // keep refs in sync
  const soundOnRef = React.useRef(soundOn)
  const voiceCalloutsRef = React.useRef(voiceCallouts)
  const reducedMotionRef = React.useRef(reducedMotion)
  React.useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  React.useEffect(() => {
    guidedRef.current = guided
  }, [guided])
  React.useEffect(() => {
    viewRef.current = view
  }, [view])
  React.useEffect(() => {
    soundOnRef.current = soundOn
    audio.setMuted(!soundOn)
  }, [soundOn, audio])
  React.useEffect(() => {
    voiceCalloutsRef.current = voiceCallouts
  }, [voiceCallouts])
  React.useEffect(() => {
    reducedMotionRef.current = reducedMotion
  }, [reducedMotion])

  // --- render a frozen hero frame on start ---
  React.useEffect(() => {
    if (phase === 'start') {
      const sc = getScenario(scenario)
      const s = createInitialState(sc)
      const e = createEnv(sc)
      stateRef.current = s
      envRef.current = e
      const id = requestAnimationFrame(() => {
        canvasRef.current?.renderFrame(s, e)
        cockpitRef.current?.renderFrame(s, e)
      })
      return () => cancelAnimationFrame(id)
    }
  }, [phase, scenario])

  // --- main game loop ---
  const startLoop = React.useCallback(() => {
    lastTime.current = performance.now()
    lastSample.current = 0
    telemetryRef.current = []
    endedAt.current = null
    recordedRef.current = false
    lastCalloutRef.current = 999
    calloutsRef.current = []
    currentHintRef.current = null
    stable500Checked.current = false
    stable500Result.current = null
    touchdownAtRef.current = null
    const loop = (now: number) => {
      if (phaseRef.current !== 'playing') return
      const dt = Math.min(0.05, (now - lastTime.current) / 1000)
      lastTime.current = now

      const s = stepFlight(stateRef.current, flareRef.current, dt, envRef.current)
      s.lastCalloutAlt = lastCalloutRef.current
      stateRef.current = s
      // render to whichever view is active (both kept in sync for instant toggle)
      canvasRef.current?.renderFrame(s, envRef.current)
      cockpitRef.current?.renderFrame(s, envRef.current)
      clusterRef.current?.setAll({
        altitude: s.altitude,
        airspeed: s.airspeed,
        vsi: s.vsi,
      })

      // --- audio: continuous engine + wind ---
      audio.updateEngine(s.airspeed)
      audio.setStallHorn(s.stallHorn && s.altitude < 30 && !s.onGround)

      // --- coaching: radar callouts (guided only) ---
      if (guidedRef.current) {
        const callout = checkRadarCallout(s)
        if (callout) {
          lastCalloutRef.current = callout.alt
          calloutsRef.current.push(callout)
          if (!soundOnRef.current) {
            // still beep if sound is on; voice handled below
          }
          audio.calloutBeep()
          // Voice callouts via speechSynthesis (§2.4) — zero dependency
          if (voiceCalloutsRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel() // never queue — always speak the latest
            const u = new SpeechSynthesisUtterance(callout.text.replace(' — FLARE', ''))
            u.rate = 1.3
            u.volume = 0.7
            u.pitch = 1.0
            window.speechSynthesis.speak(u)
          }
        }
        const hint = liveHint(s)
        currentHintRef.current = hint?.text ?? null
      }

      // --- stable-approach check at 500ft ---
      if (!stable500Checked.current && s.altitude <= 500 && s.altitude > 480) {
        stable500Checked.current = true
        const onSpeed = Math.abs(s.airspeed - APPROACH_SPEED) < 10
        const sinkOk = Math.abs(s.vsi) < 1000
        stable500Result.current = onSpeed && sinkOk
      }

      // sample telemetry ~20Hz
      if (now - lastSample.current > 50) {
        telemetryRef.current.push(frameFromState(s))
        lastSample.current = now
      }

      // touchdown effects — fire when wheels first touch (s.onGround && s.result),
      // NOT when s.ended (which now includes the rollout phase)
      if (s.onGround && s.result && touchdownAtRef.current === null) {
        touchdownAtRef.current = now
        const sev = Math.abs(s.result.touchdownVSI)
        const q = s.result.quality
        if (!reducedMotionRef.current) {
          if (q === 'greaser' || q === 'good' || q === 'firm') {
            canvasRef.current?.burst('smoke', Math.min(1.4, sev / 240 + 0.4))
          } else {
            canvasRef.current?.burst('dust', Math.min(1.8, sev / 220 + 0.6))
          }
          canvasRef.current?.shake(Math.min(20, sev / 34))
        }
        audio.touchdown(Math.min(1, sev / 500))
        audio.setStallHorn(false)
        // Greaser chime (§1.5) — a distinct positive cue for the best outcome
        if (q === 'greaser') {
          audio.sfx('chime')
        }
      }

      // The flight ends after rollout completes (s.ended). Give a beat for
      // particles + the rollout to settle, then finalize.
      if (s.ended && endedAt.current === null) {
        endedAt.current = now
      }
      if (s.ended && now - (endedAt.current ?? now) > 600 && !recordedRef.current) {
        recordedRef.current = true
        finalizeRef.current?.()
        return
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const finalizeAttempt = React.useCallback(() => {
    const s = stateRef.current
    const result = s.result
    if (!result) {
      setPhase('start')
      return
    }
    const attempt: Attempt = {
      id: uid(),
      timestamp: Date.now(),
      score: result.score,
      quality: result.quality,
      touchdownVSI: result.touchdownVSI,
      touchdownAirspeed: result.touchdownAirspeed,
      touchdownDistance: result.touchdownDistance,
      touchdownLateral: result.touchdownLateral,
      touchdownCrab: result.touchdownCrab,
      touchdownPitch: result.touchdownPitch,
      flareAltitude: result.flareAltitude,
      flareTiming: result.flareTiming,
      bounces: result.bounces,
      stalled: result.stalled,
      crosswind: result.crosswind,
      duration: result.duration,
      stableAt500: stable500Result.current,
      maxBalloon: result.maxBalloon,
      scenarioId: scenario,
      telemetry: telemetryRef.current,
    }
    const res = recordAttempt(attempt)
    setLastAttempt(attempt)
    setNewBadges(res.newBadges)
    setBonusGranted(res.bonusGranted)
    if (res.newBadges.length > 0) {
      toast.success(`Achievement unlocked: ${res.newBadges.length} new!`)
    }
    setPhase('result')
  }, [recordAttempt])

  const finalizeRef = React.useRef(finalizeAttempt)
  React.useEffect(() => {
    finalizeRef.current = finalizeAttempt
  }, [finalizeAttempt])

  // --- controls ---
  const beginFlight = React.useCallback(() => {
    const ok = consumePlay()
    if (!ok) {
      setPaywallOpen(true)
      return
    }
    // init audio on this user gesture (autoplay policy)
    audio.init()
    audio.setMuted(!soundOn)
    audio.startEngine()
    audio.sfx('click')
    const sc = getScenario(scenario)
    const s = createInitialState(sc)
    const e = createEnv(sc)
    stateRef.current = s
    envRef.current = e
    flareRef.current = false
    canvasRef.current?.reset()
    cockpitRef.current?.reset()
    setPhase('playing')
    requestAnimationFrame(() => startLoop())
  }, [consumePlay, scenario, startLoop, audio])

  // §2.1: "Go around" = the taught procedure — power up, climb away, good
  // decision coaching toast. No landing recorded.
  const goAround = React.useCallback(() => {
    phaseRef.current = 'start'
    cancelAnimationFrame(rafRef.current)
    audio.setStallHorn(false)
    audio.sfx('chime') // power-up cue
    toast.info('Go around — good decision. The landing is never mandatory.')
    setPhase('start')
  }, [audio])

  // §2.1: "Abandon" = instant restart with no scoring, no fanfare.
  const abandon = React.useCallback(() => {
    phaseRef.current = 'start'
    cancelAnimationFrame(rafRef.current)
    audio.setStallHorn(false)
    setPhase('start')
  }, [])

  const flyAgain = React.useCallback(() => {
    const ok = consumePlay()
    if (!ok) {
      setPaywallOpen(true)
      return
    }
    audio.init()
    audio.setMuted(!soundOn)
    audio.startEngine()
    audio.sfx('click')
    const sc = getScenario(scenario)
    const s = createInitialState(sc)
    const e = createEnv(sc)
    stateRef.current = s
    envRef.current = e
    flareRef.current = false
    canvasRef.current?.reset()
    cockpitRef.current?.reset()
    setNewBadges([])
    setBonusGranted(false)
    setPhase('playing')
    requestAnimationFrame(() => startLoop())
  }, [consumePlay, scenario, startLoop, audio])

  const shareToEarnFromPaywall = React.useCallback(() => {
    if (lastAttempt) setPhase('result')
    else toast.info('Complete a landing, then share it to earn a bonus play.')
  }, [lastAttempt])

  // --- input handlers ---
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault()
        if (phaseRef.current === 'playing') flareRef.current = true
        else if (phaseRef.current === 'start') beginFlight()
      }
      if ((e.key === 'g' || e.key === 'G') && phaseRef.current === 'playing') {
        goAround()
      }
      if (e.key === 'Escape' && phaseRef.current === 'playing') {
        abandon()
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault()
        flareRef.current = false
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [beginFlight, goAround, abandon])

  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const onPointerDown = () => {
    if (phaseRef.current === 'playing') flareRef.current = true
  }
  const onPointerUp = () => {
    flareRef.current = false
  }

  return (
    <div className={cn('flex min-h-screen flex-col bg-background', className)}>
      {/* top brand bar */}
      <header className="z-20 flex items-center justify-between border-b border-white/10 bg-navy/70 px-4 py-2 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-horizon-gold/15 ring-1 ring-horizon-gold/30">
            <Plane className="h-4 w-4 text-horizon-gold" />
          </div>
          <span className="font-sora text-sm font-bold tracking-tight text-foreground sm:text-base">
            Flight<span className="text-horizon-gold">Course</span>
          </span>
          <span className="hidden font-jetbrains text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            · Landing Flare Trainer
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unlimited ? (
            <UiBadge className="border-horizon-gold/40 bg-horizon-gold/15 text-horizon-gold">
              <Zap className="mr-1 h-3 w-3" /> Unlimited
            </UiBadge>
          ) : (
            <span className="font-jetbrains text-xs text-muted-foreground">
              <span className={cn('font-bold', freePlays > 0 ? 'text-sky' : 'text-destructive')}>
                {freePlays}
              </span>{' '}
              free plays
            </span>
          )}
          {/* mute toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSound(!soundOn)}
            aria-label={soundOn ? 'Mute' : 'Unmute'}
            title={soundOn ? 'Mute audio' : 'Unmute audio'}
          >
            {!soundOn ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* main stage — min-height ensures content never sits under the footer */}
      <main className="relative flex min-h-[calc(100vh-7.5rem)] flex-1 flex-col">
        {/* both renderers always mounted; toggle visibility for instant switching */}
        <div className={cn('absolute inset-0', view === 'external' ? 'z-0' : 'z-0 opacity-0 pointer-events-none')}>
          <GameCanvas ref={canvasRef} className="h-full w-full" />
        </div>
        <div className={cn('absolute inset-0', view === 'cockpit' ? 'z-0' : 'z-0 opacity-0 pointer-events-none')}>
          <CockpitCanvas ref={cockpitRef} className="h-full w-full" />
        </div>

        {phase === 'start' && (
          <StartScreen
            onBegin={beginFlight}
            scenario={scenario}
            onScenario={setScenario}
            freePlays={freePlays}
            unlimited={unlimited}
            guided={guided}
            onGuided={setGuided}
            view={view}
            onView={setView}
            onOpenPaywall={() => setPaywallOpen(true)}
          />
        )}

        {phase === 'playing' && (
          <PlayingHud
            clusterRef={clusterRef}
            freePlays={freePlays}
            unlimited={unlimited}
            crosswind={envRef.current.crosswind > 0}
            guided={guided}
            view={view}
            onView={setView}
            stateRef={stateRef}
            calloutsRef={calloutsRef}
            hintRef={currentHintRef}
            onGoAround={goAround}
            onAbandon={abandon}
            runwayHeading={envRef.current.runwayHeading}
            colorblindMode={colorblindMode}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          />
        )}

        {phase === 'result' && lastAttempt && (
          <ResultScreen
            attempt={lastAttempt}
            bestScore={bestScore}
            newBadges={newBadges}
            bonusGranted={bonusGranted}
            freePlays={freePlays}
            unlimited={unlimited}
            onFlyAgain={flyAgain}
            onHome={() => setPhase('start')}
            onOpenPaywall={() => setPaywallOpen(true)}
          />
        )}
      </main>

      {/* sticky footer */}
      <footer className="z-20 mt-auto border-t border-white/10 bg-navy/70 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-1 text-center sm:flex-row sm:text-left">
          <p className="font-jetbrains text-[11px] text-muted-foreground">
            FlightCourse · Cessna 172 flare practice · Not for real-world flight training
          </p>
          <p className="font-jetbrains text-[11px] text-muted-foreground">
            <span className="text-horizon-gold/80">flightcourse.io</span>/flare
          </p>
        </div>
      </footer>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        onShareToEarn={shareToEarnFromPaywall}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// START SCREEN
// ---------------------------------------------------------------------------
function StartScreen({
  onBegin,
  scenario,
  onScenario,
  freePlays,
  unlimited,
  guided,
  onGuided,
  view,
  onView,
  onOpenPaywall,
}: {
  onBegin: () => void
  scenario: ScenarioId
  onScenario: (v: ScenarioId) => void
  freePlays: number
  unlimited: boolean
  guided: boolean
  onGuided: (v: boolean) => void
  view: 'external' | 'cockpit'
  onView: (v: 'external' | 'cockpit') => void
  onOpenPaywall: () => void
}) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto fc-scroll bg-gradient-to-b from-navy/60 via-navy/30 to-navy/75">
      <div className="mx-auto grid min-h-full max-w-5xl grid-cols-1 items-center gap-6 p-4 sm:p-6 lg:grid-cols-2">
        {/* hero */}
        <div className="space-y-5">
          <div>
            <UiBadge className="border-sky/40 bg-sky/10 text-sky">Cessna 172 · Short Final</UiBadge>
            <h1 className="mt-3 font-sora text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              Stick the <span className="text-horizon-gold">greaser.</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              Read the PAPI, time your flare, and settle the Cessna onto the runway.
              Real flare physics with a coaching debrief after every landing — so each
              attempt actually teaches you something.
            </p>
          </div>

          {/* instructions */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md shadow-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-horizon-gold/15 text-horizon-gold ring-1 ring-horizon-gold/20">
                <Space className="h-4 w-4" />
              </div>
              <div>
                <div className="font-sora text-sm font-semibold">Hold to flare</div>
                <div className="text-xs text-muted-foreground">SPACE / hold-click / tap</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md shadow-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky/15 text-sky ring-1 ring-sky/20">
                <Hand className="h-4 w-4" />
              </div>
              <div>
                <div className="font-sora text-sm font-semibold">Round out at ~15 ft</div>
                <div className="text-xs text-muted-foreground">When the runway "zooms"</div>
              </div>
            </div>
          </div>

          {/* guided mode toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-horizon-gold" />
              <div>
                <div className="font-sora text-sm font-semibold">Guided mode</div>
                <div className="text-xs text-muted-foreground">Radar callouts (50-40-30-20-10), flare cues & live hints</div>
              </div>
            </div>
            <Switch checked={guided} onCheckedChange={onGuided} />
          </div>

          {/* view toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-sky" />
              <div>
                <div className="font-sora text-sm font-semibold">Camera view</div>
                <div className="text-xs text-muted-foreground">Cockpit = the real pilot sight picture</div>
              </div>
            </div>
            <div className="flex rounded-lg border border-white/10 bg-black/30 p-0.5">
              <button
                onClick={() => onView('external')}
                className={cn('rounded-md px-3 py-1 font-jetbrains text-xs transition', view === 'external' ? 'bg-horizon-gold text-navy' : 'text-muted-foreground hover:text-foreground')}
              >
                External
              </button>
              <button
                onClick={() => onView('cockpit')}
                className={cn('rounded-md px-3 py-1 font-jetbrains text-xs transition', view === 'cockpit' ? 'bg-horizon-gold text-navy' : 'text-muted-foreground hover:text-foreground')}
              >
                Cockpit
              </button>
            </div>
          </div>

          {/* scenario selector (§1.1) — compact horizontal scroll strip */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <Wind className="h-4 w-4 text-sky" />
              <span className="font-sora text-sm font-semibold">Scenario</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto fc-scroll pb-1">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => onScenario(sc.id)}
                  disabled={!sc.unlockedByDefault}
                  className={cn(
                    'shrink-0 rounded-lg px-2.5 py-1.5 font-jetbrains text-[11px] whitespace-nowrap transition',
                    scenario === sc.id
                      ? 'bg-horizon-gold text-navy'
                      : sc.unlockedByDefault
                        ? 'bg-black/30 text-muted-foreground hover:text-foreground'
                        : 'bg-black/20 text-muted-foreground/40',
                  )}
                  title={sc.description}
                >
                  {sc.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
              {SCENARIOS.find((s) => s.id === scenario)?.description}
            </p>
          </div>

          {/* start button + plays */}
          <div className="space-y-2">
            <Button
              onClick={onBegin}
              size="lg"
              className="w-full bg-horizon-gold text-navy hover:bg-horizon-gold/90 fc-pulse-gold"
            >
              <Plane className="mr-2 h-5 w-5" /> {unlimited ? 'Start approach' : `Start approach — ${freePlays} free plays`}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {unlimited
                ? 'Unlimited practice unlocked.'
                : 'Share a result for +1 bonus play · first landing grants +2'}
            </p>
            {!unlimited && (
              <button
                onClick={onOpenPaywall}
                className="mx-auto block font-jetbrains text-xs text-muted-foreground underline-offset-2 hover:text-horizon-gold hover:underline"
              >
                Unlock unlimited — $4.99
              </button>
            )}
          </div>
        </div>

        {/* dashboard */}
        <div className="lg:pl-4">
          <ProgressDashboard variant="full" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PLAYING HUD
// ---------------------------------------------------------------------------
function PlayingHud({
  clusterRef,
  freePlays,
  unlimited,
  crosswind,
  guided,
  view,
  onView,
  stateRef,
  calloutsRef,
  hintRef,
  onGoAround,
  onAbandon,
  runwayHeading,
  colorblindMode,
  onPointerDown,
  onPointerUp,
}: {
  clusterRef: React.RefObject<InstrumentClusterHandle | null>
  freePlays: number
  unlimited: boolean
  crosswind: boolean
  guided: boolean
  view: 'external' | 'cockpit'
  onView: (v: 'external' | 'cockpit') => void
  stateRef: React.RefObject<FlightState>
  calloutsRef: React.RefObject<RadarCallout[]>
  hintRef: React.RefObject<string | null>
  onGoAround: () => void
  onAbandon: () => void
  runwayHeading: string
  colorblindMode: boolean
  onPointerDown: () => void
  onPointerUp: () => void
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex touch-none select-none flex-col justify-between"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* top HUD — bezel-metal language matching the InstrumentFrame gauges */}
      <div className="flex items-start justify-between p-3">
        <div className="flex items-center gap-2">
          <div
            className="rounded-md px-3 py-1.5 font-jetbrains text-xs text-sky"
            style={bezelPillStyle}
          >
            {crosswind ? 'CROSSWIND · DE-CRAB ON FLARE' : `CALM · RWY ${runwayHeading}`}
          </div>
          <div
            className="rounded-md px-3 py-1.5 font-jetbrains text-xs text-muted-foreground"
            style={bezelPillStyle}
          >
            {unlimited ? (
              <span className="text-horizon-gold">Unlimited</span>
            ) : (
              <>
                <span className={freePlays > 0 ? 'text-sky' : 'text-destructive'}>{freePlays}</span> plays
              </>
            )}
          </div>
          {guided && (
            <div
              className="rounded-md px-3 py-1.5 font-jetbrains text-xs text-horizon-gold"
              style={{
                ...bezelPillStyle,
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 10px rgba(242,177,52,0.35)',
                border: '1px solid rgba(242,177,52,0.4)',
              }}
            >
              GUIDED
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* view toggle — bezel housing */}
          <div
            className="flex rounded-lg p-0.5"
            style={bezelPillStyle}
          >
            <button
              onClick={() => onView('external')}
              className={cn(
                'rounded-md px-2.5 py-1 font-jetbrains text-[11px] transition',
                view === 'external'
                  ? 'text-navy'
                  : 'text-sky/80 hover:text-sky',
              )}
              style={
                view === 'external'
                  ? { background: 'linear-gradient(180deg,#ffe9a0,#F2B134)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }
                  : undefined
              }
            >
              Ext
            </button>
            <button
              onClick={() => onView('cockpit')}
              className={cn(
                'rounded-md px-2.5 py-1 font-jetbrains text-[11px] transition',
                view === 'cockpit'
                  ? 'text-navy'
                  : 'text-sky/80 hover:text-sky',
              )}
              style={
                view === 'cockpit'
                  ? { background: 'linear-gradient(180deg,#ffe9a0,#F2B134)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }
                  : undefined
              }
            >
              Cockpit
            </button>
          </div>
          <button
            onClick={onGoAround}
            title="Go around (G)"
            className="inline-flex h-8 items-center rounded-md px-3 font-sora text-xs font-semibold text-horizon-gold transition hover:brightness-110"
            style={bezelButtonStyle}
          >
            <Power className="mr-1 h-3 w-3" /> Go around
          </button>
          <button
            onClick={onAbandon}
            title="Abandon approach (Esc)"
            className="hidden h-8 items-center rounded-md px-3 font-sora text-xs font-semibold text-foreground transition hover:brightness-110 sm:inline-flex"
            style={bezelButtonStyle}
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Abandon
          </button>
        </div>
      </div>

      {/* coaching HUD (callouts + live hint) */}
      {guided && (
        <CoachingHud
          stateRef={stateRef}
          calloutsRef={calloutsRef}
          hintRef={hintRef}
        />
      )}

      {/* instrument cluster bottom */}
      <div className="flex items-end justify-center gap-3 p-3">
        <div className="rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
          <InstrumentCluster ref={clusterRef} compact />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RESULT SCREEN
// ---------------------------------------------------------------------------
function ResultScreen({
  attempt,
  bestScore,
  newBadges,
  bonusGranted,
  freePlays,
  unlimited,
  onFlyAgain,
  onHome,
  onOpenPaywall,
}: {
  attempt: Attempt
  bestScore: number
  newBadges: string[]
  bonusGranted: boolean
  freePlays: number
  unlimited: boolean
  onFlyAgain: () => void
  onHome: () => void
  onOpenPaywall: () => void
}) {
  const color = QUALITY_COLORS[attempt.quality]
  const isBest = attempt.score >= bestScore && attempt.score > 0
  const outOfPlays = !unlimited && freePlays <= 0
  const debrief = React.useMemo(() => buildDebrief(attempt), [attempt])

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto fc-scroll bg-navy/85 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
        {/* score header */}
        <div className="relative text-center">
          <div
            className="pointer-events-none absolute inset-0 -z-0 blur-3xl"
            style={{ background: `radial-gradient(60% 50% at 50% 35%, ${color}33, transparent 70%)` }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1 font-sora text-sm font-bold shadow-lg"
              style={{ background: `${color}22`, color, border: `1px solid ${color}66`, boxShadow: `0 0 24px ${color}40` }}
            >
              {QUALITY_LABELS[attempt.quality]}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span
                className="font-sora text-7xl font-extrabold tabular-nums sm:text-8xl"
                style={{ color, textShadow: `0 0 32px ${color}66` }}
              >
                {attempt.score}
              </span>
              <span className="mb-2 font-sora text-2xl text-muted-foreground">/100</span>
            </div>
            <p className="mx-auto mt-1 max-w-md text-sm italic text-muted-foreground">
              {debrief.summary}
            </p>
            {isBest && attempt.score > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-horizon-gold/40 bg-horizon-gold/10 px-3 py-0.5 text-sm text-horizon-gold">
                <Trophy className="h-4 w-4" /> New best score!
              </div>
            )}
          </div>
        </div>

        {/* new badges */}
        {newBadges.length > 0 && (
          <div className="rounded-xl border border-horizon-gold/40 bg-horizon-gold/10 p-3">
            <div className="mb-2 font-sora text-sm text-horizon-gold">Achievements unlocked</div>
            <div className="flex flex-wrap gap-2">
              {newBadges.map((b) => (
                <UiBadge key={b} className="border-horizon-gold/50 bg-horizon-gold/15 text-horizon-gold">
                  <Trophy className="mr-1 h-3 w-3" /> {b.replace(/_/g, ' ')}
                </UiBadge>
              ))}
            </div>
          </div>
        )}

        {/* the debrief — the actual learning value */}
        <DebriefCard debrief={debrief} />

        {/* telemetry chart (§2.2) — visualize the flare, don't just report numbers */}
        <TelemetryChart attempt={attempt} />

        {/* replay */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md shadow-lg ring-1 ring-white/5">
          <div className="mb-2 flex items-center gap-2 font-sora text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" /> Replay · scrub to review your flare
          </div>
          <Replay attempt={attempt} />
        </div>

        {/* share + paywall (alongside, never instead of) */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-sky/30 bg-sky/[0.06] p-3 backdrop-blur-md shadow-lg ring-1 ring-sky/10">
            <div className="mb-2 font-sora text-sm text-sky">Share your landing</div>
            <ShareCard attempt={attempt} bestScore={bestScore} />
          </div>
          {outOfPlays ? (
            <div className="rounded-2xl border border-horizon-gold/40 bg-horizon-gold/[0.07] p-3 backdrop-blur-md shadow-lg ring-1 ring-horizon-gold/15">
              <div className="mb-2 font-sora text-sm text-horizon-gold">Out of free plays</div>
              <p className="mb-3 text-xs text-muted-foreground">
                Share above for +1 bonus play, or unlock unlimited practice.
              </p>
              <Button onClick={onOpenPaywall} className="w-full bg-horizon-gold text-navy hover:bg-horizon-gold/90">
                <Zap className="mr-2 h-4 w-4" /> Unlock options
              </Button>
              {bonusGranted && (
                <p className="mt-2 text-center text-xs text-sky">+1 bonus play granted for completing this landing</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md shadow-lg ring-1 ring-white/5">
              <div className="mb-2 font-sora text-sm text-muted-foreground">Next flight</div>
              <div className="space-y-2">
                <Button onClick={onFlyAgain} className="w-full bg-horizon-gold text-navy hover:bg-horizon-gold/90">
                  <Plane className="mr-2 h-4 w-4" /> Fly again
                </Button>
                <Button onClick={onHome} variant="outline" className="w-full border-white/20">
                  <Home className="mr-2 h-4 w-4" /> Back to start
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {unlimited ? 'Unlimited practice' : `${freePlays} free plays remaining`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* updated dashboard */}
        <ProgressDashboard variant="compact" />
      </div>
    </div>
  )
}
