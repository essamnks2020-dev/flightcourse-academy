'use client'

import * as React from 'react'
import { Plane, ArrowRight, Home, Trophy, Gauge, Wind, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * FlareTrainer — a lightweight, self-contained landing flare trainer.
 * 2.5D perspective runway, rear-view Cessna, Glass Cockpit HUD.
 * No heavy deps — loads fast, runs at 60fps.
 */

type Phase = 'start' | 'playing' | 'result'

interface FlightState {
  altitude: number      // ft AGL
  airspeed: number      // KIAS
  verticalSpeed: number // fpm
  distance: number      // ft from threshold
  pitch: number         // deg
  flareInput: boolean
  throttle: number      // 0-1
  touchedDown: boolean
  touchdownVS: number
  touchdownPoint: number
  crashed: boolean
}

const APPROACH_SPEED = 65
const STALL_SPEED = 40
const FLARE_ALT = 15

export function FlareTrainer() {
  const [phase, setPhase] = React.useState<Phase>('start')
  const [score, setScore] = React.useState(0)
  const [quality, setQuality] = React.useState<'greaser' | 'good' | 'firm' | 'hard' | 'crash'>('good')
  const stateRef = React.useRef<FlightState>({
    altitude: 300, airspeed: 65, verticalSpeed: -500, distance: 5000,
    pitch: 0, flareInput: false, throttle: 0.5, touchedDown: false,
    touchdownVS: 0, touchdownPoint: 0, crashed: false,
  })

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const keysRef = React.useRef<Set<string>>(new Set())
  const playingRef = React.useRef(false)

  // Keyboard
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
      if (e.key === ' ') { e.preventDefault(); stateRef.current.flareInput = true }
    }
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
      if (e.key === ' ') stateRef.current.flareInput = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  function beginFlight() {
    stateRef.current = {
      altitude: 300, airspeed: 65, verticalSpeed: -500, distance: 5000,
      pitch: 0, flareInput: false, throttle: 0.5, touchedDown: false,
      touchdownVS: 0, touchdownPoint: 0, crashed: false,
    }
    setPhase('playing')
    playingRef.current = true
    lastTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(gameLoop)
  }

  const lastTimeRef = React.useRef(0)

  function gameLoop(now: number) {
    const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000)
    lastTimeRef.current = now
    const s = stateRef.current

    if (!s.touchedDown && !s.crashed) {
      // Physics
      const flare = s.flareInput ? 1 : 0
      s.pitch += (flare * 8 - s.pitch) * 0.1

      // Throttle
      if (keysRef.current.has('shift')) s.throttle = Math.min(1, s.throttle + 0.02)
      if (keysRef.current.has('control')) s.throttle = Math.max(0, s.throttle - 0.02)

      // Airspeed: flare adds drag, throttle adds speed
      const targetSpeed = APPROACH_SPEED - flare * 5 + (s.throttle - 0.5) * 20
      s.airspeed += (targetSpeed - s.airspeed) * 0.02

      // Vertical speed: flare reduces descent, ground effect below 10ft
      const groundEffect = s.altitude < 10 ? 0.5 : 1
      const targetVS = -500 + flare * 400 + (s.airspeed - 65) * 10
      s.verticalSpeed += (targetVS * groundEffect - s.verticalSpeed) * 0.05

      // Altitude
      s.altitude += s.verticalSpeed * dt / 60

      // Distance
      s.distance -= s.airspeed * 1.688 * dt // kt to ft/s

      // Touchdown
      if (s.altitude <= 0) {
        s.altitude = 0
        s.touchedDown = true
        s.touchdownVS = s.verticalSpeed
        s.touchdownPoint = 5000 - s.distance

        // Score
        const vs = Math.abs(s.verticalSpeed)
        if (vs < 200) { setQuality('greaser'); setScore(90 + Math.floor((200 - vs) / 10)) }
        else if (vs < 400) { setQuality('good'); setScore(75 + Math.floor((400 - vs) / 15)) }
        else if (vs < 600) { setQuality('firm'); setScore(55 + Math.floor((600 - vs) / 20)) }
        else if (vs < 800) { setQuality('hard'); setScore(35 + Math.floor((800 - vs) / 25)) }
        else { setQuality('crash'); setScore(Math.max(0, 20 - Math.floor((vs - 800) / 20))); s.crashed = true }

        setTimeout(() => { playingRef.current = false; setPhase('result'); }, 500)
      }

      // Stall
      if (s.airspeed < STALL_SPEED && s.altitude > 5) {
        s.verticalSpeed -= 200 * dt
        s.airspeed = STALL_SPEED
      }
    }

    // Draw
    drawScene()

    if (playingRef.current) {
      rafRef.current = requestAnimationFrame(gameLoop)
    }
  }

  function drawScene() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const s = stateRef.current

    const horizonY = h * 0.35
    const groundY = h * 0.82
    const vanishX = w * 0.5

    // Sky — cinematic golden hour
    const sky = ctx.createLinearGradient(0, 0, 0, groundY)
    sky.addColorStop(0, '#070d1f')
    sky.addColorStop(0.3, '#1a2d52')
    sky.addColorStop(0.6, '#3d5a85')
    sky.addColorStop(0.85, '#F2B134')
    sky.addColorStop(1, '#e8b865')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, groundY)

    // Sun glow
    const sunX = w * 0.7
    const sunY = horizonY - h * 0.05
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, h * 0.3)
    sunGrad.addColorStop(0, 'rgba(255, 220, 140, 0.6)')
    sunGrad.addColorStop(0.5, 'rgba(255, 180, 80, 0.2)')
    sunGrad.addColorStop(1, 'rgba(255, 180, 80, 0)')
    ctx.fillStyle = sunGrad
    ctx.fillRect(0, 0, w, groundY)

    // Ground
    const ground = ctx.createLinearGradient(0, horizonY, 0, h)
    ground.addColorStop(0, '#1a2a1a')
    ground.addColorStop(0.5, '#1f3018')
    ground.addColorStop(1, '#121a0e')
    ctx.fillStyle = ground
    ctx.fillRect(0, horizonY, w, h - horizonY)

    // Runway — perspective trapezoid
    const farLeft = vanishX - w * 0.03
    const farRight = vanishX + w * 0.03
    const nearLeft = w * 0.5 - w * 0.4
    const nearRight = w * 0.5 + w * 0.4

    // Grass
    ctx.fillStyle = '#1f3a1c'
    ctx.fillRect(0, horizonY, w, h - horizonY)

    // Asphalt
    const rwGrad = ctx.createLinearGradient(0, horizonY, 0, h)
    rwGrad.addColorStop(0, '#2a2e35')
    rwGrad.addColorStop(0.5, '#33373f')
    rwGrad.addColorStop(1, '#3a3e47')
    ctx.fillStyle = rwGrad
    ctx.beginPath()
    ctx.moveTo(farLeft, horizonY)
    ctx.lineTo(farRight, horizonY)
    ctx.lineTo(nearRight, h)
    ctx.lineTo(nearLeft, h)
    ctx.closePath()
    ctx.fill()

    // Centerline dashes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 2
    for (let i = 0; i < 20; i++) {
      const t1 = i / 20
      const t2 = (i + 0.5) / 20
      const y1 = horizonY + (h - horizonY) * t1
      const y2 = horizonY + (h - horizonY) * t2
      const x1 = vanishX
      const x2 = vanishX
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineWidth = 2 + t1 * 3
      ctx.stroke()
    }

    // Edge stripes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(farLeft, horizonY)
    ctx.lineTo(nearLeft, h)
    ctx.moveTo(farRight, horizonY)
    ctx.lineTo(nearRight, h)
    ctx.stroke()

    // PAPI lights (left side)
    const papiX = nearLeft + w * 0.05
    const papiY = h - 40
    const onPath = s.altitude > 0 && s.altitude < 50
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = onPath ? (i < 2 ? '#ff4444' : '#ffffff') : (i < 2 ? '#ffffff' : '#ff4444')
      ctx.beginPath()
      ctx.arc(papiX + i * 12, papiY, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // Plane position — based on altitude (higher = smaller, higher in view)
    const altRatio = Math.min(1, s.altitude / 300)
    const planeY = groundY - altRatio * (groundY - horizonY) * 0.7 - 30
    const planeX = vanishX
    const planeScale = 0.5 + (1 - altRatio) * 0.5

    // Plane shadow on runway
    const shadowAlpha = 0.3 * (1 - altRatio * 0.7)
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`
    ctx.beginPath()
    ctx.ellipse(planeX, groundY - 5, 40 * planeScale, 6 * planeScale, 0, 0, Math.PI * 2)
    ctx.fill()

    // Draw the Cessna (simple rear view)
    ctx.save()
    ctx.translate(planeX, planeY)
    ctx.scale(planeScale, planeScale)
    ctx.rotate(s.pitch * Math.PI / 180)

    // Fuselage
    ctx.fillStyle = '#f0f4f8'
    ctx.strokeStyle = '#0a1424'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // High wing
    ctx.fillStyle = '#3E92CC'
    ctx.beginPath()
    ctx.moveTo(-45, -8)
    ctx.lineTo(45, -8)
    ctx.lineTo(48, -4)
    ctx.lineTo(-48, -4)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Wing highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(-40, -8, 80, 1)

    // Nav lights
    ctx.fillStyle = '#e0584f'
    ctx.beginPath()
    ctx.arc(-47, -6, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#5fcf6a'
    ctx.beginPath()
    ctx.arc(47, -6, 2, 0, Math.PI * 2)
    ctx.fill()

    // Tail fin
    ctx.fillStyle = '#3E92CC'
    ctx.beginPath()
    ctx.moveTo(-3, -8)
    ctx.lineTo(0, -22)
    ctx.lineTo(3, -8)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Prop disc
    ctx.fillStyle = 'rgba(200, 220, 240, 0.2)'
    ctx.beginPath()
    ctx.arc(0, 2, 15, 0, Math.PI * 2)
    ctx.fill()

    // Prop blades (spinning)
    const propAngle = (performance.now() / 30) % (Math.PI * 2)
    ctx.strokeStyle = 'rgba(20, 30, 50, 0.5)'
    ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      const a = propAngle + (i * Math.PI * 2 / 3)
      ctx.beginPath()
      ctx.moveTo(0, 2)
      ctx.lineTo(Math.cos(a) * 15, 2 + Math.sin(a) * 15)
      ctx.stroke()
    }

    // Hub
    ctx.fillStyle = '#F2B134'
    ctx.beginPath()
    ctx.arc(0, 2, 3, 0, Math.PI * 2)
    ctx.fill()

    // Gear
    ctx.strokeStyle = '#0a1424'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-12, 8); ctx.lineTo(-14, 16)
    ctx.moveTo(0, 10); ctx.lineTo(0, 18)
    ctx.moveTo(12, 8); ctx.lineTo(14, 16)
    ctx.stroke()

    // Wheels
    ctx.fillStyle = '#1a2740'
    ctx.beginPath()
    ctx.arc(-14, 17, 3, 0, Math.PI * 2)
    ctx.arc(0, 19, 3, 0, Math.PI * 2)
    ctx.arc(14, 17, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8)
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)')
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, w, h)
  }

  // Resize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [phase])

  // Cleanup
  React.useEffect(() => () => {
    playingRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  // ====== START SCREEN ======
  if (phase === 'start') {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <p className="label-instrument text-primary mb-3">Training sim</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Flare Trainer</h1>
        <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
          Learn the hardest part of flying — the landing flare. You&apos;re on short final
          in a Cessna 172. Your job: time the flare so the plane settles gently onto the
          runway. Too early and you float. Too late and you slam in.
        </p>

        {/* What you'll learn */}
        <div className="glass glow-primary mt-8 rounded-xl p-5">
          <p className="label-instrument text-primary mb-3">What this teaches</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In a real Cessna 172, you start the flare at about 10-15 feet above the runway.
            You smoothly pull back on the yoke to level the nose and arrest your descent.
            The goal is to touch down on the main wheels at a gentle rate — under 200 feet
            per minute is a &quot;greaser.&quot; This trainer builds the muscle memory of
            timing that flare. Hold SPACE to simulate pulling back on the yoke.
          </p>
        </div>

        {/* How to play — step by step */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight mb-4">How to play</h2>
          <div className="flex flex-col gap-3">
            <Step number={1} title="You start on final approach" desc="Altitude 300 ft, airspeed 65 kt, descending at 500 fpm. You're about 1 mile from the runway." />
            <Step number={2} title="Let it descend" desc="Don't flare yet. Let the plane descend toward the runway. Watch the altitude readout drop." />
            <Step number={3} title="Flare at 15 ft" desc="When altitude reads ~15 ft, HOLD SPACE. This raises the nose and arrests your descent. The runway will appear to 'zoom' — that's your cue." />
            <Step number={4} title="Hold the flare" desc="Keep holding SPACE. The plane will level off and slowly settle. If you're too fast, you'll float — release briefly to let it sink." />
            <Step number={5} title="Touch down" desc="The goal is a touchdown under 200 fpm (feet per minute). That's a greaser. Over 800 fpm is a crash." />
          </div>
        </div>

        {/* Controls */}
        <div className="glass mt-8 rounded-xl p-5">
          <p className="label-instrument text-primary mb-3">Controls</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Control keys="SPACE" action="Hold to flare (pull back on yoke)" />
            <Control keys="Shift" action="Add throttle (climb)" />
            <Control keys="Ctrl" action="Reduce throttle (descend)" />
            <Control keys="Click + Hold" action="Same as SPACE (touch/mouse)" />
          </div>
        </div>

        {/* What you're looking at */}
        <div className="glass mt-6 rounded-xl p-5">
          <p className="label-instrument text-accent mb-3">Reading the instruments</p>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><span className="text-foreground font-medium nums">ALT</span> — your height above the ground in feet. Flare at 15.</li>
            <li><span className="text-foreground font-medium nums">IAS</span> — indicated airspeed in knots. 65 is ideal on approach.</li>
            <li><span className="text-foreground font-medium nums">VS</span> — vertical speed in feet per minute. Negative = descending. Aim for under -200 at touchdown.</li>
            <li><span className="text-foreground font-medium nums">DIST</span> — distance to the runway threshold in feet.</li>
          </ul>
        </div>

        {/* Scoring */}
        <div className="glass mt-6 rounded-xl p-5">
          <p className="label-instrument text-primary mb-3">Scoring</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ScoreTier color="#5fcf6a" label="Greaser" range="under 200 fpm" points="90-100" />
            <ScoreTier color="#3E92CC" label="Good" range="200-400 fpm" points="75-89" />
            <ScoreTier color="#F2B134" label="Firm" range="400-600 fpm" points="55-74" />
            <ScoreTier color="#E89B2C" label="Hard" range="600-800 fpm" points="35-54" />
            <ScoreTier color="#e0584f" label="Crash" range="over 800 fpm" points="0-20" />
          </div>
        </div>

        <button onClick={beginFlight} className="fp-toggle-btn mt-8 w-full px-5 py-3.5 text-base sm:w-auto sm:px-8">
          <Plane className="size-5" /> Start approach
          <ArrowRight className="size-4" />
        </button>
        <p className="mt-4 text-xs text-muted-foreground">
          Tip: the PAPI lights (4 lights on the left) show if you&apos;re on the correct
          glideslope. 2 red + 2 white = perfect.
        </p>
      </div>
    )
  }

  // ====== PLAYING ======
  if (phase === 'playing') {
    const s = stateRef.current
    // Real-time coaching message based on flight state
    let coaching = ""
    let coachingColor = "text-muted-foreground"
    if (s.altitude > 50) {
      coaching = "Let it descend — you're on final approach"
      coachingColor = "text-muted-foreground"
    } else if (s.altitude <= 50 && s.altitude > 20) {
      coaching = "Get ready to flare..."
      coachingColor = "text-accent"
    } else if (s.altitude <= 20 && s.altitude > 5 && !s.flareInput) {
      coaching = "FLARE NOW — hold SPACE!"
      coachingColor = "text-primary"
    } else if (s.altitude <= 20 && s.altitude > 0 && s.flareInput) {
      coaching = "Hold it off... let it settle..."
      coachingColor = "text-primary"
    } else if (s.airspeed > 75 && s.altitude > 5) {
      coaching = "You're too fast — you'll float"
      coachingColor = "text-destructive"
    } else if (s.airspeed < 45 && s.altitude > 5) {
      coaching = "Too slow — add power!"
      coachingColor = "text-destructive"
    }

    return (
      <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* HUD overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
          {/* Top bar — instruments */}
          <div className="flex items-start justify-between">
            <div className="glass flex gap-4 rounded-xl p-3">
              <Readout label="ALT" value={Math.round(s.altitude)} unit="ft" />
              <Readout label="IAS" value={Math.round(s.airspeed)} unit="kt" />
              <Readout label="VS" value={Math.round(s.verticalSpeed)} unit="fpm" />
              <Readout label="DIST" value={Math.round(s.distance)} unit="ft" />
            </div>
            <div className="glass flex items-center gap-2 rounded-xl px-3 py-2">
              <Wind className="size-4 text-accent" />
              <span className="label-instrument text-muted-foreground">CALM</span>
            </div>
          </div>

          {/* Center — real-time coaching */}
          {coaching && (
            <div className="flex justify-center">
              <div className={`glass rounded-full px-5 py-2.5 ${coaching === "FLARE NOW — hold SPACE!" ? "glow-primary animate-pulse-ring" : ""}`}>
                <span className={`label-instrument text-sm ${coachingColor}`}>{coaching}</span>
              </div>
            </div>
          )}

          {/* Bottom — altitude bar + flare indicator */}
          <div className="flex flex-col items-center gap-2">
            {/* Altitude bar */}
            <div className="glass flex w-full max-w-xs items-center gap-2 rounded-full px-4 py-2">
              <span className="label-instrument text-muted-foreground text-[9px]">ALT</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (s.altitude / 300) * 100)}%`,
                    background: s.altitude < 20 ? "var(--primary)" : s.altitude < 50 ? "var(--accent)" : "var(--muted-foreground)",
                  }}
                />
              </div>
              <span className="nums text-xs font-semibold tabular-nums">{Math.round(s.altitude)} ft</span>
            </div>
            {s.flareInput && (
              <div className="glass glow-primary rounded-full px-4 py-1.5">
                <span className="label-instrument text-primary text-xs">FLARING</span>
              </div>
            )}
          </div>
        </div>

        {/* Touch/click area for flare */}
        <div
          className="absolute inset-0"
          onPointerDown={() => { stateRef.current.flareInput = true }}
          onPointerUp={() => { stateRef.current.flareInput = false }}
          onPointerLeave={() => { stateRef.current.flareInput = false }}
        />
      </div>
    )
  }

  // ====== RESULT ======
  const qualityColor = {
    greaser: '#5fcf6a', good: '#3E92CC', firm: '#F2B134', hard: '#E89B2C', crash: '#e0584f',
  }[quality]

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="glass glow-primary relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `radial-gradient(60% 60% at 50% 50%, ${qualityColor}33, transparent 70%)` }} />
        <div className="relative flex flex-col items-center gap-4 p-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1 font-bold text-sm" style={{ background: `${qualityColor}22`, color: qualityColor, border: `1px solid ${qualityColor}66` }}>
            {quality.toUpperCase()}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="nums text-7xl font-extrabold tabular-nums" style={{ color: qualityColor }}>{score}</span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            {quality === 'greaser' && 'Butter. That\'s a greaser — under 200 fpm touchdown.'}
            {quality === 'good' && 'Solid landing. Repeat that every time.'}
            {quality === 'firm' && 'Firm but safe. Work on the flare timing.'}
            {quality === 'hard' && 'Hard landing. Flare earlier, hold it off longer.'}
            {quality === 'crash' && 'That\'s a crash. Let\'s try again — flare at 15 ft.'}
          </p>
          {stateRef.current.touchdownVS !== 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="label-instrument text-muted-foreground">Touchdown VS</p>
                <p className="nums font-semibold" style={{ color: qualityColor }}>{Math.round(stateRef.current.touchdownVS)} fpm</p>
              </div>
              <div>
                <p className="label-instrument text-muted-foreground">Touchdown point</p>
                <p className="nums font-semibold">{Math.round(stateRef.current.touchdownPoint)} ft</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={beginFlight} className="fp-toggle-btn flex-1 px-5 py-3 text-sm">
          <RotateCcw className="size-4" /> Fly again
          <ArrowRight className="size-4" />
        </button>
        <button onClick={() => setPhase('start')} className="fp-outline-btn flex-1 px-5 py-3 text-sm">
          <Home className="size-4" /> Back to start
        </button>
      </div>
    </div>
  )
}

function Readout({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="label-instrument text-muted-foreground text-[9px]">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="nums text-base font-semibold tabular-nums">{value}</span>
        <span className="text-[9px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function Step({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="glass flex items-start gap-3 rounded-xl p-4">
      <span className="nums flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-bold ring-1 ring-primary/20">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function Control({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center gap-3">
      <kbd className="nums rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold">{keys}</kbd>
      <span className="text-xs text-muted-foreground">{action}</span>
    </div>
  )
}

function ScoreTier({ color, label, range, points }: { color: string; label: string; range: string; points: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-2.5" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground">{range}</p>
      </div>
      <span className="nums text-xs text-muted-foreground">{points} pts</span>
    </div>
  )
}
