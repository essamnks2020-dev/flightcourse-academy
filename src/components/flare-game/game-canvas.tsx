'use client'
// flare-trainer canvas renderer (v3 — 5-bug fix pass)

import * as React from 'react'
import { CessnaSvg, type CessnaHandle } from './cessna-svg'
import type { FlightState, GameEnv } from '@/lib/aviation'
import { cn } from '@/lib/utils'

export interface GameCanvasHandle {
  renderFrame: (state: FlightState, env: GameEnv) => void
  burst: (type: 'smoke' | 'dust', intensity: number) => void
  shake: (intensity: number) => void
  reset: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  grow: number
  color: string
  rise: number
  rot: number
  vrot: number
  kind: 'smoke' | 'dust' | 'exhaust'
}

const NAVY = '#0B1D3A'
const SKY = '#3E92CC'
const GOLD = '#F2B134'

// deterministic pseudo-random for stable fields
function mulberry(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const GameCanvas = React.forwardRef<GameCanvasHandle, { className?: string }>(
  function GameCanvas({ className }, ref) {
    const wrapRef = React.useRef<HTMLDivElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const aircraftRef = React.useRef<HTMLDivElement>(null)
    const cessnaRef = React.useRef<CessnaHandle>(null)
    const sizeRef = React.useRef({ w: 0, h: 0, dpr: 1 })
    const particles = React.useRef<Particle[]>([])
    const shake = React.useRef(0)
    const lastProj = React.useRef({ x: 0, y: 0, scale: 1, groundY: 0 })
    const elevatorEase = React.useRef(0)
    const rudderEase = React.useRef(0)
    const aileronEase = React.useRef(0)
    const exhaustTimer = React.useRef(0)
    const stateRef = React.useRef<FlightState | null>(null)
    const startTime = React.useRef(performance.now())

    // --- stable decorative fields ---
    const stars = React.useMemo(() => {
      const r = mulberry(7)
      return Array.from({ length: 120 }, () => ({
        x: r(),
        y: r() * 0.4,
        s: 0.4 + r() * 1.6,
        tw: r() * Math.PI * 2,
        bright: r() > 0.85,
      }))
    }, [])
    const shootingStars = React.useMemo(() => {
      const r = mulberry(91)
      return Array.from({ length: 3 }, () => ({
        x: 0.1 + r() * 0.7,
        y: 0.05 + r() * 0.2,
        phase: r() * 8,
        dur: 0.8 + r() * 0.6,
      }))
    }, [])
    const clouds = React.useMemo(() => {
      const r = mulberry(21)
      return Array.from({ length: 7 }, () => {
        const puffCount = 3 + Math.floor(r() * 3)
        const puffs = Array.from({ length: puffCount }, () => ({
          // per-puff variation so no two puffs (or clouds) look duplicated
          dx: (r() - 0.5) * 1.0, // horizontal placement jitter
          dy: (r() - 0.5) * 0.35, // vertical placement jitter
          sx: 0.55 + r() * 0.65, // width scale
          sy: 0.55 + r() * 0.7, // height (eccentricity) scale
          rot: (r() - 0.5) * 0.5, // rotation radians
        }))
        return {
          x: r(),
          y: 0.06 + r() * 0.26,
          s: 0.5 + r() * 1.0,
          speed: 0.003 + r() * 0.01,
          puffs,
        }
      })
    }, [])
    const ridges = React.useMemo(() => {
      const make = (count: number, seed: number, minH: number, maxH: number) => {
        const r = mulberry(seed)
        return Array.from({ length: count + 2 }, () => {
          const roll = r()
          // Three distinct peak types so the skyline is unmistakably varied:
          //  - 'spire'  : pointed, asymmetric rise/fall
          //  - 'mesa'   : flat-topped (rises, runs flat, drops)
          //  - 'roll'   : low rounded dome
          const kind = roll < 0.4 ? 'spire' : roll < 0.7 ? 'mesa' : 'roll'
          return {
            h: kind === 'roll' ? minH + r() * (maxH - minH) * 0.4 : minH + r() * (maxH - minH),
            kind: kind as 'spire' | 'mesa' | 'roll',
            peakX: 0.2 + r() * 0.6,
            rise: 0.3 + r() * 1.4,
            fall: 0.3 + r() * 1.4,
            sharp: kind === 'spire' ? 0.15 + r() * 0.25 : kind === 'mesa' ? 1.0 + r() * 0.3 : 0.8 + r() * 0.5,
            snow: r() > 0.55,
          }
        })
      }
      // Fewer, larger peaks on the far layer so the varied shapes read clearly
      // instead of compressing into a fine sawtooth.
      return [make(14, 3, 18, 48), make(20, 9, 9, 24), make(16, 17, 5, 14)]
    }, [])
    const cityLights = React.useMemo(() => {
      const r = mulberry(44)
      return Array.from({ length: 40 }, () => ({
        x: 0.2 + r() * 0.6,
        tw: r() * Math.PI * 2,
        warm: r() > 0.5,
      }))
    }, [])
    const birds = React.useMemo(() => {
      const r = mulberry(77)
      return Array.from({ length: 5 }, () => ({
        x: r(),
        y: 0.2 + r() * 0.15,
        speed: 0.008 + r() * 0.012,
        flap: r() * Math.PI * 2,
        size: 4 + r() * 4,
      }))
    }, [])

    // --- canvas sizing ---
    React.useEffect(() => {
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      if (!canvas || !wrap) return
      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        const w = wrap.clientWidth
        const h = wrap.clientHeight
        sizeRef.current = { w, h, dpr }
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        canvas.style.width = w + 'px'
        canvas.style.height = h + 'px'
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(wrap)
      return () => ro.disconnect()
    }, [])

    const burst = React.useCallback((type: 'smoke' | 'dust', intensity: number) => {
      const { x, y, groundY } = lastProj.current
      const count = type === 'smoke' ? 12 + Math.round(intensity * 14) : 22 + Math.round(intensity * 20)
      for (let i = 0; i < count; i++) {
        const ang = type === 'smoke' ? -Math.PI / 2 + (Math.random() - 0.5) * 1.4 : Math.random() * Math.PI * 2
        const spd = type === 'smoke' ? 30 + Math.random() * 70 : 80 + Math.random() * 180
        particles.current.push({
          x: x + (Math.random() - 0.5) * 26,
          y: type === 'smoke' ? groundY - 4 : y,
          vx: Math.cos(ang) * spd + (Math.random() - 0.5) * 30,
          vy: Math.sin(ang) * spd - (type === 'smoke' ? 40 : 55),
          life: 0,
          max: type === 'smoke' ? 1.3 + Math.random() * 0.8 : 0.8 + Math.random() * 0.6,
          size: type === 'smoke' ? 12 + Math.random() * 12 : 5 + Math.random() * 8,
          grow: type === 'smoke' ? 52 : 26,
          color: type === 'smoke' ? '232,236,242' : '184,160,120',
          rise: type === 'smoke' ? -34 : 75,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 2,
          kind: type,
        })
      }
    }, [])

    const triggerShake = React.useCallback((m: number) => {
      shake.current = Math.max(shake.current, m)
    }, [])

    const reset = React.useCallback(() => {
      particles.current = []
      shake.current = 0
      elevatorEase.current = 0
      rudderEase.current = 0
      aileronEase.current = 0
    }, [])

    const renderFrame = React.useCallback((state: FlightState, env: GameEnv) => {
      stateRef.current = state
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const { w, h } = sizeRef.current
      if (w === 0) return

      const now = (performance.now() - startTime.current) / 1000
      const horizonY = h * 0.4
      const groundY = h * 0.82
      const vanishX = w * 0.5
      const REF_DEPTH = 340
      const project = (wd: number) => {
        const rel = wd - state.distance
        const t = REF_DEPTH / (rel + REF_DEPTH)
        const y = horizonY + (groundY - horizonY) * t
        const half = w * 0.025 + w * 0.42 * t
        return { y, half, t }
      }
      // --- Bug 1 fix: couple the aircraft's altitude-to-pixel scale to the
      // threshold's perspective depth, so the aircraft rides a converging
      // glidepath toward the runway instead of a flat linear altitude mapping
      // that ignores distance. Far away (threshold near horizon) → less px/ft,
      // so 115ft reads as just below the horizon, not up in the clouds. ---
      const thrRel = Math.max(0, -state.distance) // ft ahead to threshold (≥0)
      const thrT = REF_DEPTH / (thrRel + REF_DEPTH) // 1 at/past threshold → 0 far
      const pxPerFtV = ((groundY - horizonY) / 80) * thrT

      // camera shake
      let sx = 0
      let sy = 0
      if (shake.current > 0.2) {
        sx = (Math.random() - 0.5) * shake.current
        sy = (Math.random() - 0.5) * shake.current
        shake.current *= 0.88
      } else shake.current = 0

      ctx.save()
      ctx.translate(sx, sy)

      // === SKY — coherent golden-hour dusk, lit warm at the horizon ===
      const sky = ctx.createLinearGradient(0, 0, 0, groundY)
      sky.addColorStop(0, '#0a1428')
      sky.addColorStop(0.28, '#142446')
      sky.addColorStop(0.52, '#2a4566')
      sky.addColorStop(0.72, '#6a6a5a')
      sky.addColorStop(0.88, GOLD)
      sky.addColorStop(1, '#f0c478')
      ctx.fillStyle = sky
      ctx.fillRect(-40, -40, w + 80, groundY + 40)

      // === Bug 2 fix: a single daylight value gates sun vs moon + stars ===
      // daylight 1 = full sun (day), 0 = full night (moon + stars). Only one
      // celestial body is ever fully visible; stars fade out as the sun rises.
      const daylight = env.daylight ?? 0.92
      const nightAmt = 1 - daylight // 0 by day, 1 by night
      const renderSun = daylight > 0.5
      const renderMoon = !renderSun

      // === STARS (twinkle, with a few bright ones) — fade with daylight ===
      // Stars only become visible as night takes over; fully invisible while
      // the sun is up so they never read alongside a bright low sun.
      const starAlpha = nightAmt < 0.5 ? 0 : (nightAmt - 0.5) * 2
      if (starAlpha > 0.01) {
        ctx.save()
        for (const s of stars) {
          const sx2 = s.x * w
          const sy2 = s.y * h
          const twinkle = (0.3 + 0.5 * Math.sin(now * 1.6 + s.tw)) * (1 - s.y * 2.3)
          const a = Math.max(0, twinkle) * starAlpha
          if (a < 0.01) continue
          ctx.globalAlpha = a
          ctx.fillStyle = s.bright ? '#fff4d8' : '#dfeaff'
          if (s.bright) {
            ctx.shadowColor = 'rgba(255,244,216,0.8)'
            ctx.shadowBlur = 3
          } else {
            ctx.shadowBlur = 0
          }
          ctx.fillRect(sx2, sy2, s.s, s.s)
          if (s.bright) {
            ctx.globalAlpha = a * 0.5
            ctx.fillRect(sx2 - 2, sy2 + s.s / 2 - 0.3, s.s + 4, 0.6)
            ctx.fillRect(sx2 + s.s / 2 - 0.3, sy2 - 2, 0.6, s.s + 4)
          }
        }
        ctx.restore()
      }

      // === SHOOTING STARS (only at night) ===
      if (nightAmt > 0.4) {
        ctx.save()
        for (const ss of shootingStars) {
          const cyc = (now + ss.phase) % 9
          if (cyc < ss.dur) {
            const p = cyc / ss.dur
            const px = ss.x * w + p * 220
            const py = ss.y * h + p * 80
            const a = Math.sin(p * Math.PI) * 0.9 * nightAmt
            ctx.globalAlpha = a
            const grad = ctx.createLinearGradient(px - 60, py - 22, px, py)
            grad.addColorStop(0, 'rgba(255,255,255,0)')
            grad.addColorStop(1, 'rgba(255,255,255,0.95)')
            ctx.strokeStyle = grad
            ctx.lineWidth = 1.6
            ctx.beginPath()
            ctx.moveTo(px - 60, py - 22)
            ctx.lineTo(px, py)
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      // === MOON (upper-left, glowing crescent) — only when night-dominant ===
      if (renderMoon) {
        const moonX = w * 0.18
        const moonY = h * 0.12
        const moonR = h * 0.035
        const moonA = nightAmt
        ctx.save()
        ctx.globalAlpha = moonA
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 1, moonX, moonY, moonR * 4)
        moonGlow.addColorStop(0, 'rgba(220,232,255,0.35)')
        moonGlow.addColorStop(0.4, 'rgba(180,200,240,0.1)')
        moonGlow.addColorStop(1, 'rgba(180,200,240,0)')
        ctx.fillStyle = moonGlow
        ctx.fillRect(moonX - moonR * 4, moonY - moonR * 4, moonR * 8, moonR * 8)
        ctx.fillStyle = '#e8f0ff'
        ctx.shadowColor = 'rgba(220,232,255,0.8)'
        ctx.shadowBlur = 16
        ctx.beginPath()
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = 'rgba(8,16,32,0.7)'
        ctx.beginPath()
        ctx.arc(moonX - moonR * 0.35, moonY - moonR * 0.15, moonR * 0.92, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // === SUN (disc + corona + lens streak) — only when day-dominant ===
      // sunX/sunY hoisted so any later sun-anchored effect (lake glint) can
      // reference them without a scoping/TDZ issue in the bundled output.
      const sunX = w * 0.66
      const sunY = horizonY - h * 0.05
      if (renderSun) {
        const sunA = daylight
        const corona = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, h * 0.6)
        corona.addColorStop(0, `rgba(255,221,150,${0.6 * sunA})`)
        corona.addColorStop(0.15, `rgba(242,177,52,${0.35 * sunA})`)
        corona.addColorStop(0.45, `rgba(242,177,52,${0.12 * sunA})`)
        corona.addColorStop(1, 'rgba(242,177,52,0)')
        ctx.fillStyle = corona
        ctx.fillRect(0, 0, w, groundY)
        // god rays (volumetric light shafts)
        ctx.save()
        ctx.globalAlpha = 0.12 * sunA
        ctx.translate(sunX, sunY)
        for (let i = 0; i < 7; i++) {
          const ang = (-0.5 + i * 0.16) + Math.sin(now * 0.2 + i) * 0.03
          ctx.rotate(ang - (i > 0 ? -0.5 + (i - 1) * 0.16 : 0))
          const rayGrad = ctx.createLinearGradient(0, 0, 0, -h * 0.5)
          rayGrad.addColorStop(0, 'rgba(255,221,150,0.5)')
          rayGrad.addColorStop(1, 'rgba(255,221,150,0)')
          ctx.fillStyle = rayGrad
          ctx.beginPath()
          ctx.moveTo(-8, 0)
          ctx.lineTo(8, 0)
          ctx.lineTo(22, -h * 0.5)
          ctx.lineTo(-22, -h * 0.5)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
        // lens streak
        const streak = ctx.createLinearGradient(0, sunY, w, sunY)
        streak.addColorStop(0, 'rgba(255,221,150,0)')
        streak.addColorStop(0.5, `rgba(255,221,150,${0.22 * sunA})`)
        streak.addColorStop(1, 'rgba(255,221,150,0)')
        ctx.fillStyle = streak
        ctx.fillRect(0, sunY - 1.5, w, 3)
        // sun disc
        ctx.save()
        ctx.globalAlpha = sunA
        ctx.shadowColor = 'rgba(255,221,150,0.95)'
        ctx.shadowBlur = 28
        ctx.beginPath()
        ctx.arc(sunX, sunY, h * 0.052, 0, Math.PI * 2)
        const sunDisc = ctx.createRadialGradient(sunX - 3, sunY - 3, 1, sunX, sunY, h * 0.052)
        sunDisc.addColorStop(0, '#fffaf0')
        sunDisc.addColorStop(0.55, '#ffe9b0')
        sunDisc.addColorStop(1, '#f2b134')
        ctx.fillStyle = sunDisc
        ctx.fill()
        ctx.restore()
      }

      // === CLOUDS (volumetric, multi-puff, lit edges, varied puffs) ===
      ctx.save()
      for (const c of clouds) {
        let cx = ((c.x + state.distance * c.speed * 0.01) % 1.2) - 0.1
        if (cx < -0.1) cx += 1.2
        const px = cx * w
        const py = c.y * h
        const cw = 130 * c.s
        const ch = 24 * c.s
        const puffN = c.puffs.length
        const cloudA = 0.6 + 0.3 * (daylight) // clouds read brighter by day
        // sun-lit warm edge (back) — per-puff varied
        ctx.globalAlpha = 0.45 * cloudA
        ctx.fillStyle = 'rgba(255,200,140,0.6)'
        for (let p = 0; p < puffN; p++) {
          const pf = c.puffs[p]
          const dx = (p - puffN / 2) * cw * 0.35 + pf.dx * cw * 0.3
          const dy = pf.dy * ch
          ctx.beginPath()
          ctx.ellipse(px + dx + 4, py + ch * 0.4 + dy, cw * 0.42 * pf.sx, ch * 0.7 * pf.sy, pf.rot, 0, Math.PI * 2)
          ctx.fill()
        }
        // body — per-puff varied size/eccentricity/rotation
        ctx.globalAlpha = 0.75 * cloudA
        ctx.fillStyle = 'rgba(200,216,236,0.85)'
        for (let p = 0; p < puffN; p++) {
          const pf = c.puffs[p]
          const dx = (p - puffN / 2) * cw * 0.32 + pf.dx * cw * 0.3
          const dy = pf.dy * ch
          ctx.beginPath()
          ctx.ellipse(px + dx, py + dy, cw * 0.4 * pf.sx, ch * pf.sy, pf.rot, 0, Math.PI * 2)
          ctx.fill()
        }
        // top highlight (cool, from above) — per-puff varied
        ctx.globalAlpha = 0.4 * cloudA
        ctx.fillStyle = 'rgba(240,248,255,0.7)'
        for (let p = 0; p < puffN; p++) {
          const pf = c.puffs[p]
          const dx = (p - puffN / 2) * cw * 0.32 + pf.dx * cw * 0.3
          const dy = pf.dy * ch
          ctx.beginPath()
          ctx.ellipse(px + dx, py - ch * 0.3 + dy, cw * 0.3 * pf.sx, ch * 0.5 * pf.sy, pf.rot, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()

      // === BIRDS (tiny V silhouettes drifting, flapping) ===
      ctx.save()
      ctx.fillStyle = 'rgba(20,30,50,0.7)'
      for (const b of birds) {
        let bx = ((b.x + state.distance * b.speed * 0.02 + now * b.speed * 0.1) % 1.2) - 0.1
        if (bx < -0.1) bx += 1.2
        const px = bx * w
        const py = b.y * h + Math.sin(now * 0.5 + b.flap) * 4
        const flap = Math.sin(now * 4 + b.flap) * 0.4
        const s = b.size
        ctx.beginPath()
        ctx.moveTo(px - s, py + flap * s)
        ctx.quadraticCurveTo(px - s * 0.4, py - s * 0.5 + flap * s, px, py)
        ctx.quadraticCurveTo(px + s * 0.4, py - s * 0.5 + flap * s, px + s, py + flap * s)
        ctx.stroke()
      }
      ctx.restore()

      // === ATMOSPHERIC HAZE band at horizon ===
      const haze = ctx.createLinearGradient(0, horizonY - 24, 0, horizonY + 24)
      haze.addColorStop(0, 'rgba(242,177,52,0)')
      haze.addColorStop(0.5, 'rgba(210,170,90,0.4)')
      haze.addColorStop(1, 'rgba(210,170,90,0)')
      ctx.fillStyle = haze
      ctx.fillRect(0, horizonY - 24, w, 48)

      // === MOUNTAINS (3 ridgelines, depth haze, snow caps, valley mist) ===
      // Bug 3 fix: each peak is a quadratic-curve silhouette with varied peak
      // position, asymmetric rise/fall slopes, and varied sharpness — an organic
      // ridge, not a row of identical stamped triangles.
      const drawRidge = (layer: number, ridge: typeof ridges[0], color: string, parallax: number, baseY: number, heightMul: number) => {
        const step = w / (ridge.length - 2)
        const off = (state.distance * parallax) % step
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(-off, baseY + 4)
        for (let i = 0; i < ridge.length; i++) {
          const px = i * step - off
          const pk = ridge[i]
          const ph = pk.h * heightMul
          const peakX = px + step * pk.peakX
          const peakY = baseY - ph
          if (pk.kind === 'mesa') {
            // flat-topped: rise via quadratic, run flat (wide), drop via quadratic
            const riseCx = px + step * pk.peakX * 0.5
            const riseCy = baseY - ph * Math.min(1.05, pk.sharp * pk.rise)
            ctx.quadraticCurveTo(riseCx, riseCy, peakX, peakY)
            const flatEnd = peakX + step * (1 - pk.peakX) * 0.6
            ctx.lineTo(flatEnd, peakY) // wide flat top
            const fallCx = flatEnd + step * (1 - pk.peakX) * 0.15
            const fallCy = baseY - ph * Math.min(1.05, pk.sharp * pk.fall)
            ctx.quadraticCurveTo(fallCx, fallCy, px + step, baseY + 4)
          } else {
            // spire (pointed) or roll (rounded dome): single apex via quadratic
            const riseCx = px + step * pk.peakX * 0.5
            const riseCy = baseY - ph * Math.min(1.1, pk.sharp * pk.rise)
            ctx.quadraticCurveTo(riseCx, riseCy, peakX, peakY)
            const fallCx = peakX + step * (1 - pk.peakX) * 0.5
            const fallCy = baseY - ph * Math.min(1.1, pk.sharp * pk.fall)
            ctx.quadraticCurveTo(fallCx, fallCy, px + step, baseY + 4)
          }
        }
        ctx.lineTo(w + off, baseY + 4)
        ctx.closePath()
        ctx.fill()
        // snow caps on far layer — placed at the actual (varied) peak position
        if (layer === 0) {
          ctx.fillStyle = 'rgba(230,238,250,0.4)'
          for (let i = 0; i < ridge.length; i++) {
            if (!ridge[i].snow) continue
            const px = i * step - off
            const ph = ridge[i].h * heightMul
            const capX = px + step * ridge[i].peakX
            ctx.beginPath()
            ctx.moveTo(capX, baseY - ph)
            ctx.lineTo(capX + step * 0.07, baseY - ph + 6)
            ctx.lineTo(capX - step * 0.07, baseY - ph + 6)
            ctx.closePath()
            ctx.fill()
          }
        }
        // valley mist on far + mid layer
        if (layer <= 1) {
          ctx.save()
          ctx.globalAlpha = 0.18
          ctx.fillStyle = '#9fb6d4'
          for (let i = 0; i < ridge.length - 1; i++) {
            const px = i * step - off
            const ph = ridge[i].h * heightMul
            ctx.beginPath()
            ctx.ellipse(px + step * 0.5, baseY + 2, step * 0.4, Math.min(8, ph * 0.3), 0, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
        }
      }
      drawRidge(0, ridges[0], '#0c1f38', 0.012, horizonY + 2, 1.0)
      drawRidge(1, ridges[1], '#0a1729', 0.024, horizonY + 10, 0.9)
      drawRidge(2, ridges[2], '#08111f', 0.04, horizonY + 16, 0.8)

      // === DISTANT CITY LIGHTS (twinkling on the horizon) ===
      ctx.save()
      for (const c of cityLights) {
        const px = c.x * w
        const py = horizonY + 6 + Math.sin(c.x * 30) * 2
        const a = 0.4 + 0.5 * Math.sin(now * 2 + c.tw)
        ctx.globalAlpha = a
        ctx.fillStyle = c.warm ? 'rgba(255,200,120,0.9)' : 'rgba(180,220,255,0.9)'
        ctx.shadowColor = c.warm ? 'rgba(255,200,120,0.9)' : 'rgba(180,220,255,0.9)'
        ctx.shadowBlur = 4
        ctx.fillRect(px, py, 1.4, 1.4)
      }
      ctx.restore()

      // === LAKE REFLECTION (mirrored sun shimmer on a water strip) ===
      // Only render the sun-glint shimmer when the sun is up; use the same
      // horizontal anchor the sun uses so the reflection lines up with it.
      if (renderSun) {
        ctx.save()
        const lakeY = horizonY + 30
        const lakeGrad = ctx.createLinearGradient(0, lakeY, 0, lakeY + 18)
        lakeGrad.addColorStop(0, 'rgba(120,150,180,0.18)')
        lakeGrad.addColorStop(1, 'rgba(120,150,180,0)')
        ctx.fillStyle = lakeGrad
        ctx.fillRect(w * 0.3, lakeY, w * 0.4, 18)
        // shimmer streaks anchored to the sun's x
        ctx.globalAlpha = 0.5 * daylight
        ctx.fillStyle = 'rgba(255,221,150,0.5)'
        for (let i = 0; i < 5; i++) {
          const shim = Math.sin(now * 2 + i) * 3
          ctx.fillRect(sunX - 30 + i * 14 + shim, lakeY + i * 2, 60 - i * 8, 1)
        }
        ctx.restore()
      }

      // === TREE LINE (varied) ===
      const pxMid = (state.distance * 0.07) % 30
      ctx.fillStyle = '#06111f'
      ctx.beginPath()
      ctx.moveTo(-pxMid, horizonY + 22)
      for (let i = -1; i < w / 30 + 2; i++) {
        const baseX = i * 30 - pxMid
        const hh = 10 + ((i * 41) % 16)
        ctx.lineTo(baseX, horizonY + 22)
        ctx.lineTo(baseX + 7, horizonY + 22 - hh * 0.6)
        ctx.lineTo(baseX + 15, horizonY + 22 - hh)
        ctx.lineTo(baseX + 23, horizonY + 22 - hh * 0.7)
        ctx.lineTo(baseX + 30, horizonY + 22)
      }
      ctx.lineTo(w + pxMid, horizonY + 22)
      ctx.closePath()
      ctx.fill()

      // === GROUND ===
      const ground = ctx.createLinearGradient(0, horizonY + 22, 0, h)
      ground.addColorStop(0, '#0c1830')
      ground.addColorStop(0.3, '#0e1c34')
      ground.addColorStop(0.7, '#0a1424')
      ground.addColorStop(1, '#070f1d')
      ctx.fillStyle = ground
      ctx.fillRect(-40, horizonY + 22, w + 80, h - horizonY)
      // ground texture bands
      ctx.save()
      ctx.globalAlpha = 0.06
      for (let yy = horizonY + 30; yy < h; yy += 8) {
        ctx.fillStyle = (yy / 8) % 2 === 0 ? '#3E92CC' : '#F2B134'
        ctx.fillRect(0, yy, w, 1)
      }
      ctx.restore()

      // === RUNWAY ===
      const farLeft = vanishX - w * 0.025
      const farRight = vanishX + w * 0.025
      const nearLeft = w * 0.5 - w * 0.46
      const nearRight = w * 0.5 + w * 0.46
      // grass shoulders
      ctx.fillStyle = '#0e2415'
      ctx.fillRect(-40, horizonY + 18, w + 80, h - horizonY)
      // asphalt
      const runwayGrad = ctx.createLinearGradient(0, horizonY + 18, 0, h)
      runwayGrad.addColorStop(0, '#1a2433')
      runwayGrad.addColorStop(0.4, '#222c3c')
      runwayGrad.addColorStop(1, '#2a3548')
      ctx.fillStyle = runwayGrad
      ctx.beginPath()
      ctx.moveTo(farLeft, horizonY + 18)
      ctx.lineTo(farRight, horizonY + 18)
      ctx.lineTo(nearRight, h + 20)
      ctx.lineTo(nearLeft, h + 20)
      ctx.closePath()
      ctx.fill()
      // grass edge stripes
      ctx.fillStyle = 'rgba(40,90,55,0.35)'
      ctx.beginPath()
      ctx.moveTo(farLeft - 6, horizonY + 18)
      ctx.lineTo(farLeft, horizonY + 18)
      ctx.lineTo(nearLeft, h + 20)
      ctx.lineTo(nearLeft - 14, h + 20)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(farRight + 6, horizonY + 18)
      ctx.lineTo(farRight, horizonY + 18)
      ctx.lineTo(nearRight, h + 20)
      ctx.lineTo(nearRight + 14, h + 20)
      ctx.closePath()
      ctx.fill()
      // edge stripes
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(farLeft, horizonY + 18)
      ctx.lineTo(nearLeft, h + 20)
      ctx.moveTo(farRight, horizonY + 18)
      ctx.lineTo(nearRight, h + 20)
      ctx.stroke()
      // asphalt cracks
      ctx.save()
      ctx.globalAlpha = 0.12
      ctx.strokeStyle = '#0a1424'
      ctx.lineWidth = 0.6
      for (let rel = 100; rel < 2400; rel += 240) {
        const p = project(state.distance + rel)
        if (p.t <= 0.1 || p.t > 1.1) continue
        ctx.beginPath()
        ctx.moveTo(vanishX - p.half * 0.7, p.y)
        ctx.lineTo(vanishX + p.half * 0.5, p.y + 3)
        ctx.stroke()
      }
      ctx.restore()

      // === RECEDING LIGHT POLES (left side, with warm lamps) ===
      ctx.save()
      for (let rel = 200; rel < 2400; rel += 300) {
        const wd = state.distance + rel
        const p = project(wd)
        if (p.t <= 0.08 || p.t > 1.05) continue
        const poleX = vanishX - p.half - 22 * p.t
        const poleH = Math.max(10, 40 * p.t)
        ctx.strokeStyle = 'rgba(40,55,75,0.8)'
        ctx.lineWidth = Math.max(0.8, 1.6 * p.t)
        ctx.beginPath()
        ctx.moveTo(poleX, p.y)
        ctx.lineTo(poleX, p.y - poleH)
        ctx.stroke()
        // lamp
        ctx.fillStyle = 'rgba(255,210,120,0.95)'
        ctx.shadowColor = 'rgba(255,200,110,0.9)'
        ctx.shadowBlur = 8 * p.t
        ctx.beginPath()
        ctx.arc(poleX, p.y - poleH, Math.max(1, 2 * p.t), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        // light pool on ground
        ctx.globalAlpha = 0.15 * p.t
        ctx.fillStyle = 'rgba(255,210,120,1)'
        ctx.beginPath()
        ctx.ellipse(poleX, p.y + 2, 14 * p.t, 4 * p.t, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      ctx.restore()

      // === WINDSOCK (left of threshold, sways with wind) ===
      if (state.distance < 400) {
        const ws = project(0)
        const wsX = vanishX - ws.half - 30 * Math.max(0.3, ws.t)
        const wsY = ws.y - Math.max(20, 46 * ws.t)
        const sway = Math.sin(now * 1.2) * (env.crosswind > 0 ? 0.5 : 0.15)
        ctx.save()
        ctx.strokeStyle = 'rgba(60,75,95,0.9)'
        ctx.lineWidth = Math.max(0.8, 1.4 * ws.t)
        ctx.beginPath()
        ctx.moveTo(wsX, ws.y)
        ctx.lineTo(wsX, wsY)
        ctx.stroke()
        // sock cone
        ctx.translate(wsX, wsY)
        ctx.rotate(sway)
        ctx.fillStyle = env.crosswind > 0 ? '#F2B134' : '#3E92CC'
        ctx.globalAlpha = 0.9
        const sockLen = Math.max(8, 20 * ws.t)
        ctx.beginPath()
        ctx.moveTo(0, -2 * ws.t)
        ctx.lineTo(sockLen, -1 * ws.t)
        ctx.lineTo(sockLen, 1 * ws.t)
        ctx.lineTo(0, 2 * ws.t)
        ctx.closePath()
        ctx.fill()
        // stripes
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        for (let i = 0; i < 3; i++) {
          ctx.fillRect((sockLen / 4) + (i * sockLen / 3), -1.5 * ws.t, sockLen / 10, 3 * ws.t)
        }
        ctx.restore()
      }

      // === APPROACH LIGHTING SYSTEM ===
      if (state.distance < 1200) {
        for (let rel = -1000; rel < 0; rel += 120) {
          const p = project(rel)
          if (p.t <= 0.04 || p.t > 0.9) continue
          const barW = p.half * 0.5
          ctx.save()
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.shadowColor = 'rgba(255,240,180,0.9)'
          ctx.shadowBlur = 7 * p.t
          ctx.fillRect(vanishX - barW / 2, p.y - 1.5 * p.t, barW, Math.max(1.2, 3 * p.t))
          ctx.restore()
        }
      }

      // === CENTERLINE dashes (with bloom) ===
      ctx.save()
      for (let rel = -120; rel < 2600; rel += 130) {
        const { y, half, t } = project(state.distance + rel)
        if (t <= 0.02 || t > 1.15) continue
        const dashW = Math.max(1, half * 0.05)
        const dashH = Math.max(2, 16 * t)
        ctx.globalAlpha = Math.min(1, t * 1.4)
        ctx.shadowColor = 'rgba(255,255,255,0.5)'
        ctx.shadowBlur = 3 * t
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.fillRect(vanishX - dashW / 2, y - dashH / 2, dashW, dashH)
      }
      ctx.restore()

      // === CENTERLINE embedded lights ===
      ctx.save()
      for (let rel = -120; rel < 2600; rel += 65) {
        const { y, t } = project(state.distance + rel)
        if (t <= 0.08 || t > 1.1) continue
        ctx.globalAlpha = Math.min(1, t * 1.5)
        ctx.fillStyle = 'rgba(255,220,140,0.9)'
        ctx.shadowColor = 'rgba(255,210,120,0.9)'
        ctx.shadowBlur = 5 * t
        ctx.beginPath()
        ctx.arc(vanishX, y, Math.max(0.5, 1.2 * t), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // === THRESHOLD piano keys + number + bar ===
      const thr = project(0)
      if (thr.t > 0.02 && thr.t < 1.2) {
        ctx.save()
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.shadowColor = 'rgba(255,255,255,0.4)'
        ctx.shadowBlur = 4 * thr.t
        const keys = 8
        const kw = (thr.half * 1.6) / keys
        for (let i = 0; i < keys; i++) {
          const kx = vanishX - thr.half * 0.8 + i * kw + kw * 0.15
          ctx.fillRect(kx, thr.y - Math.max(2, 10 * thr.t), kw * 0.7, Math.max(3, 12 * thr.t))
        }
        ctx.restore()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = `700 ${Math.max(8, 18 * thr.t)}px var(--font-jetbrains), monospace`
        ctx.textAlign = 'center'
        ctx.fillText(env.runwayHeading || '27', vanishX, thr.y + Math.max(12, 24 * thr.t))
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillRect(vanishX - thr.half, thr.y - Math.max(1, 2 * thr.t), thr.half * 2, Math.max(1, 2 * thr.t))
      }

      // === TOUCHDOWN ZONE markers ===
      for (const td of [500, 1000]) {
        const aim = project(td)
        if (aim.t > 0.04 && aim.t < 1.15) {
          ctx.fillStyle = 'rgba(255,255,255,0.85)'
          const bw = aim.half * 0.2
          ctx.fillRect(vanishX - aim.half * 0.72, aim.y - 2, bw, Math.max(2, 6 * aim.t))
          ctx.fillRect(vanishX + aim.half * 0.72 - bw, aim.y - 2, bw, Math.max(2, 6 * aim.t))
        }
      }

      // === PAPI lights (with bloom) ===
      if (state.distance < 250) {
        const papi = project(0)
        const baseY = papi.y
        const baseX = vanishX - papi.half - 16 * Math.max(0.3, papi.t)
        const distToThr = -state.distance
        const idealAlt = distToThr > 0 ? 0.0524 * distToThr : 0
        let whites = 4
        if (idealAlt > 0) {
          const ratio = state.altitude / idealAlt
          whites = ratio >= 1.15 ? 4 : ratio >= 1.0 ? 3 : ratio >= 0.85 ? 2 : ratio >= 0.7 ? 1 : 0
        }
        const papiT = Math.max(0.4, papi.t)
        for (let i = 0; i < 4; i++) {
          const isWhite = i >= 4 - whites
          const col = isWhite ? '#fff6d8' : '#ff5b4f'
          ctx.save()
          ctx.shadowColor = isWhite ? 'rgba(255,246,216,1)' : 'rgba(255,91,79,1)'
          ctx.shadowBlur = 16 * papiT
          ctx.fillStyle = col
          ctx.beginPath()
          ctx.arc(baseX - i * 7 * papiT, baseY, Math.max(1.6, 3.2 * papiT), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(baseX - i * 7 * papiT, baseY, Math.max(0.6, 1.3 * papiT), 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      // === RUNWAY EDGE lights ===
      ctx.save()
      for (let rel = -100; rel < 2400; rel += 90) {
        const { y, half, t } = project(state.distance + rel)
        if (t <= 0.05 || t > 1.1) continue
        ctx.fillStyle = 'rgba(255,210,120,0.95)'
        ctx.shadowColor = 'rgba(255,200,110,0.9)'
        ctx.shadowBlur = 6 * t
        ctx.beginPath()
        ctx.arc(vanishX - half, y, Math.max(0.9, 1.8 * t), 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(vanishX + half, y, Math.max(0.9, 1.8 * t), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // --- aircraft position (Bug 1: rides the converging glidepath) ---
      const ax = vanishX + state.lateral * 1.1
      const idleBob = state.airborne && state.altitude > 6 ? Math.sin(now * 2.4) * 1.4 : 0
      // pxPerFtV is already perspective-coupled to the threshold depth (above),
      // so the aircraft's altitude and distance converge together toward the
      // runway. Clamp so it can never render above the horizon band regardless.
      const ay = Math.max(horizonY + h * 0.03, groundY - state.altitude * pxPerFtV + idleBob)
      const scale = 0.5 + 0.5 * (1 - Math.min(1, state.altitude / 80))
      const shadowAlpha = 0.45 * (1 - Math.min(1, state.altitude / 80))
      ctx.save()
      ctx.globalAlpha = shadowAlpha
      ctx.fillStyle = '#000000'
      ctx.filter = 'blur(3px)'
      ctx.beginPath()
      ctx.ellipse(ax, groundY + 2, 48 * scale, 7 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      ctx.filter = 'none'

      // === EXHAUST TRAIL (spawn puffs behind the plane while running) ===
      exhaustTimer.current += 1 / 60
      if (state.airborne && exhaustTimer.current > 0.06) {
        exhaustTimer.current = 0
        const ex = ax - w * 0.12 * scale
        const ey = ay + h * 0.015 * scale
        particles.current.push({
          x: ex + (Math.random() - 0.5) * 4,
          y: ey,
          vx: -40 - Math.random() * 30,
          vy: 6 + Math.random() * 10,
          life: 0,
          max: 0.7 + Math.random() * 0.4,
          size: 1.5 + Math.random() * 2,
          grow: 6,
          color: '120,130,140',
          rise: -8,
          rot: 0,
          vrot: 0,
          kind: 'exhaust',
        })
      }

      // === PARTICLES (smoke/dust/exhaust, soft, lit) ===
      const alive: Particle[] = []
      for (const p of particles.current) {
        p.life += 1 / 60
        if (p.life >= p.max) continue
        p.x += p.vx / 60
        p.y += p.vy / 60
        p.vy += p.rise / 60
        p.vx *= 0.96
        p.rot += p.vrot / 60
        const k = p.life / p.max
        const r = p.size + p.grow * k
        const baseA = p.kind === 'exhaust' ? 0.4 : p.kind === 'dust' ? 0.85 : 0.62
        const a = (1 - k) * baseA
        ctx.save()
        ctx.globalAlpha = a
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        pg.addColorStop(0, `rgba(${p.color},0.95)`)
        pg.addColorStop(0.6, `rgba(${p.color},0.5)`)
        pg.addColorStop(1, `rgba(${p.color},0)`)
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        alive.push(p)
      }
      particles.current = alive

      ctx.restore()

      // --- aircraft overlay (DOM, crisp SVG) ---
      lastProj.current = { x: ax, y: ay, scale, groundY }

      // control surfaces (eased)
      const targetElev = state.flareHeld ? 24 : 0
      elevatorEase.current += (targetElev - elevatorEase.current) * 0.25
      // rudder deflects opposite to crab for de-crab; eases back when flaring near ground
      const targetRudder = state.crab * -0.6
      rudderEase.current += (targetRudder - rudderEase.current) * 0.15
      // aileron subtle: into any bank (here derived from lateral drift sign)
      const targetAil = Math.sign(state.lateral) * 6
      aileronEase.current += (targetAil - aileronEase.current) * 0.1

      cessnaRef.current?.setElevator(elevatorEase.current)
      cessnaRef.current?.setRudder(rudderEase.current)
      cessnaRef.current?.setAileron(aileronEase.current)
      // §1.2/§2.2: wire setBank for real — bank into the crosswind correction
      // (wing-low technique). A C172 crosswind correction is a shallow bank,
      // not aerobatic. Bank is derived from the lateral drift correction.
      const targetBank = state.crab > 0 ? -3 : state.crab < 0 ? 3 : 0
      cessnaRef.current?.setBank(targetBank)

      const ac = aircraftRef.current
      if (ac) {
        const aw = w * 0.3 * scale
        ac.style.width = aw + 'px'
        ac.style.transform = `translate(${ax + sx}px, ${ay + sy}px) translate(-50%,-55%) scale(${scale}) rotate(${(-state.pitch).toFixed(2)}deg) rotate(${(state.crab * 0.4).toFixed(2)}deg)`
      }
    }, [])

    React.useImperativeHandle(ref, () => ({
      renderFrame,
      burst,
      shake: triggerShake,
      reset,
    }), [renderFrame, burst, triggerShake, reset])

    // stalled / onGround / gearCompress toggles — rare, cheap re-render.
    const [stalled, setStalled] = React.useState(false)
    const [onGround, setOnGround] = React.useState(false)
    const [gearCompress, setGearCompress] = React.useState(0)
    const stalledRef = React.useRef(false)
    const groundRef = React.useRef(false)
    React.useEffect(() => {
      const id = setInterval(() => {
        const s = stateRef.current
        const st = s?.stalled ?? false
        const og = s?.onGround ?? false
        // §1.2/§2.2: gearCompress from touchdown severity (0 = no squash,
        // 1 = max squash). Fades back to 0 as the rollout progresses.
        const sev = og && s?.result ? Math.min(1, Math.abs(s.result.touchdownVSI) / 500) : 0
        if (st !== stalledRef.current) {
          stalledRef.current = st
          setStalled(st)
        }
        if (og !== groundRef.current) {
          groundRef.current = og
          setOnGround(og)
        }
        setGearCompress((prev) => {
          // ease toward target
          const target = og ? sev : 0
          return prev + (target - prev) * 0.15
        })
      }, 120)
      return () => clearInterval(id)
    }, [])

    return (
      <div ref={wrapRef} className={cn('relative h-full w-full overflow-hidden', className)}>
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div
          ref={aircraftRef}
          className="pointer-events-none absolute left-0 top-0"
          style={{ transformOrigin: '50% 55%' }}
        >
          <CessnaSvg ref={cessnaRef} stalled={stalled} onGround={onGround} gearCompress={gearCompress} className="w-full" />
        </div>
        <div className="pointer-events-none absolute inset-0 fc-vignette" />
      </div>
    )
  },
)
