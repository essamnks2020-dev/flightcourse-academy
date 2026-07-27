'use client'

import * as React from 'react'
import type { FlightState, GameEnv } from '@/lib/aviation'
import { cn } from '@/lib/utils'

export interface CockpitCanvasHandle {
  renderFrame: (state: FlightState, env: GameEnv) => void
  reset: () => void
}

/**
 * CockpitCanvas — the pilot's forward view.
 * -----------------------------------------------------------------------------
 * This is the view that actually teaches the flare: you see the runway over
 * the instrument panel/cowl, the horizon shifts with pitch, the runway
 * "zooms" as you descend, and the aim-point bracket stops moving down the
 * windscreen when you round out correctly. The instrument panel is drawn
 * directly into the canvas so it reads as a real cockpit, not a web overlay.
 */
export const CockpitCanvas = React.forwardRef<CockpitCanvasHandle, { className?: string }>(
  function CockpitCanvas({ className }, ref) {
    const wrapRef = React.useRef<HTMLDivElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const sizeRef = React.useRef({ w: 0, h: 0, dpr: 1 })
    const stateRef = React.useRef<FlightState | null>(null)

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

    const reset = React.useCallback(() => {}, [])

    const renderFrame = React.useCallback((state: FlightState, env: GameEnv) => {
      stateRef.current = state
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const { w, h } = sizeRef.current
      if (w === 0) return
      const now = performance.now() / 1000

      const cx = w / 2
      // horizon shifts with pitch: nose-up → horizon drops (you see more sky)
      const pitchOffset = (state.pitch - 2.5) * 6
      const horizonY = h * 0.36 + pitchOffset
      const daylight = env.daylight ?? 0.92

      // ============================================================
      // SKY — golden-hour dusk, lit from the right (sun direction)
      // ============================================================
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY + 60)
      sky.addColorStop(0, '#0a1428')
      sky.addColorStop(0.35, '#1a2f4e')
      sky.addColorStop(0.65, '#4a5f7a')
      sky.addColorStop(0.85, '#c89568')
      sky.addColorStop(1, '#F2B134')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, horizonY + 60)

      // sun (low, right) — only the disc + soft glow, no competing moon
      if (daylight > 0.3) {
        const sunX = w * 0.72
        const sunY = horizonY - h * 0.04
        const sunR = Math.max(8, h * 0.045)
        const sunA = daylight
        // corona
        const corona = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, h * 0.5)
        corona.addColorStop(0, `rgba(255,230,160,${0.5 * sunA})`)
        corona.addColorStop(0.3, `rgba(242,177,52,${0.18 * sunA})`)
        corona.addColorStop(1, 'rgba(242,177,52,0)')
        ctx.fillStyle = corona
        ctx.fillRect(0, 0, w, horizonY + 60)
        // disc
        ctx.save()
        ctx.globalAlpha = sunA
        ctx.shadowColor = 'rgba(255,230,160,0.9)'
        ctx.shadowBlur = 24
        const disc = ctx.createRadialGradient(sunX - 2, sunY - 2, 1, sunX, sunY, sunR)
        disc.addColorStop(0, '#fff8e8')
        disc.addColorStop(0.6, '#ffe0a0')
        disc.addColorStop(1, '#f2b134')
        ctx.fillStyle = disc
        ctx.beginPath()
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        // god-ray shafts through the clouds
        ctx.save()
        ctx.globalAlpha = 0.1 * sunA
        ctx.translate(sunX, sunY)
        for (let i = 0; i < 5; i++) {
          ctx.rotate(0.18)
          const rg = ctx.createLinearGradient(0, 0, 0, -h * 0.45)
          rg.addColorStop(0, 'rgba(255,230,160,0.5)')
          rg.addColorStop(1, 'rgba(255,230,160,0)')
          ctx.fillStyle = rg
          ctx.beginPath()
          ctx.moveTo(-6, 0)
          ctx.lineTo(6, 0)
          ctx.lineTo(18, -h * 0.45)
          ctx.lineTo(-18, -h * 0.45)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      }

      // ============================================================
      // CLOUDS — varied puffs, lit from the sun side
      // ============================================================
      ctx.save()
      const cloudSeed = [
        { x: 0.15, y: 0.12, s: 0.9, p: 4 },
        { x: 0.45, y: 0.08, s: 0.7, p: 3 },
        { x: 0.82, y: 0.16, s: 1.0, p: 5 },
        { x: 0.3, y: 0.22, s: 0.6, p: 3 },
      ]
      for (const c of cloudSeed) {
        const px = ((c.x + state.distance * 0.0008) % 1.1) * w
        const py = c.y * h
        const cw = 90 * c.s
        const ch = 16 * c.s
        for (let p = 0; p < c.p; p++) {
          const dx = (p - c.p / 2) * cw * 0.4 + Math.sin(p * 1.7) * 6
          const dy = Math.cos(p * 2.3) * 4
          const sx = 0.6 + ((p * 7) % 5) / 8
          const sy = 0.6 + ((p * 11) % 4) / 6
          const rot = (p * 0.3) % 0.4
          // warm underside (sun-lit)
          ctx.globalAlpha = 0.5 * daylight
          ctx.fillStyle = 'rgba(255,200,140,0.6)'
          ctx.beginPath()
          ctx.ellipse(px + dx + 3, py + dy + ch * 0.3, cw * 0.4 * sx, ch * 0.6 * sy, rot, 0, Math.PI * 2)
          ctx.fill()
          // body
          ctx.globalAlpha = 0.75 * daylight
          ctx.fillStyle = 'rgba(210,224,238,0.85)'
          ctx.beginPath()
          ctx.ellipse(px + dx, py + dy, cw * 0.38 * sx, ch * sy, rot, 0, Math.PI * 2)
          ctx.fill()
          // top highlight
          ctx.globalAlpha = 0.35 * daylight
          ctx.fillStyle = 'rgba(245,250,255,0.7)'
          ctx.beginPath()
          ctx.ellipse(px + dx, py + dy - ch * 0.25, cw * 0.28 * sx, ch * 0.45 * sy, rot, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()

      // ============================================================
      // DISTANT RIDGELINE — organic, atmospheric fade
      // ============================================================
      const rOff = (state.distance * 0.05) % 180
      ctx.fillStyle = 'rgba(18,32,52,0.85)'
      ctx.beginPath()
      ctx.moveTo(-rOff, horizonY + 2)
      const peaks = [
        { x: 0, h: 10 }, { x: 60, h: 22, flat: true }, { x: 110, h: 14 },
        { x: 160, h: 30 }, { x: 215, h: 8 }, { x: 260, h: 18, flat: true },
        { x: 315, h: 24 }, { x: 370, h: 12 }, { x: 420, h: 20 },
      ]
      let prevX = -rOff
      for (const pk of peaks) {
        const px = pk.x - rOff
        if (pk.flat) {
          ctx.quadraticCurveTo(prevX + (px - prevX) * 0.3, horizonY - pk.h, prevX + (px - prevX) * 0.4, horizonY - pk.h)
          ctx.lineTo(px - 15, horizonY - pk.h)
          ctx.quadraticCurveTo(px - 5, horizonY - pk.h, px, horizonY + 2)
        } else {
          ctx.quadraticCurveTo(prevX + (px - prevX) * 0.5, horizonY - pk.h, px, horizonY + 2)
        }
        prevX = px
      }
      ctx.lineTo(w + rOff, horizonY + 2)
      ctx.closePath()
      ctx.fill()

      // atmospheric haze at horizon
      const haze = ctx.createLinearGradient(0, horizonY - 14, 0, horizonY + 18)
      haze.addColorStop(0, 'rgba(242,177,52,0)')
      haze.addColorStop(0.5, 'rgba(200,150,90,0.35)')
      haze.addColorStop(1, 'rgba(200,150,90,0)')
      ctx.fillStyle = haze
      ctx.fillRect(0, horizonY - 14, w, 32)

      // ============================================================
      // GROUND — grass field with the runway carved out
      // ============================================================
      const ground = ctx.createLinearGradient(0, horizonY, 0, h)
      ground.addColorStop(0, '#2a3a1f')
      ground.addColorStop(0.4, '#1e2a16')
      ground.addColorStop(1, '#101808')
      ctx.fillStyle = ground
      ctx.fillRect(0, horizonY, w, h - horizonY)

      // ============================================================
      // RUNWAY — perspective, grows as you descend, converges to vanishing point
      // ============================================================
      const altFactor = 1 - Math.min(1, state.altitude / 100) // 1 at ground, 0 at 100ft
      const runwayNearY = h * 0.84
      const runwayFarY = horizonY + 4
      const runwayNearHalfW = w * (0.16 + 0.5 * altFactor)
      const runwayFarHalfW = w * 0.012
      const latOffset = -state.lateral * (0.6 + altFactor * 1.4)
      const runwayCx = cx + latOffset

      // runway asphalt with longitudinal gradient (darker far)
      const rwGrad = ctx.createLinearGradient(0, runwayFarY, 0, runwayNearY)
      rwGrad.addColorStop(0, '#1c2632')
      rwGrad.addColorStop(1, '#36424f')
      ctx.fillStyle = rwGrad
      ctx.beginPath()
      ctx.moveTo(runwayCx - runwayFarHalfW, runwayFarY)
      ctx.lineTo(runwayCx + runwayFarHalfW, runwayFarY)
      ctx.lineTo(runwayCx + runwayNearHalfW, runwayNearY)
      ctx.lineTo(runwayCx - runwayNearHalfW, runwayNearY)
      ctx.closePath()
      ctx.fill()

      // centerline dashes (perspective — bigger/closer near)
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      const dashCount = 16
      for (let i = 0; i < dashCount; i++) {
        const t = i / dashCount
        const y = runwayFarY + (runwayNearY - runwayFarY) * t
        const halfW = runwayFarHalfW + (runwayNearHalfW - runwayFarHalfW) * t
        const dashW = Math.max(1, halfW * 0.045)
        const dashH = Math.max(2, (runwayNearY - runwayFarY) / dashCount * 0.4)
        if (i % 2 === 0) {
          ctx.globalAlpha = Math.min(1, t * 1.6 + 0.2)
          ctx.fillRect(runwayCx - dashW / 2, y - dashH / 2, dashW, dashH)
        }
      }
      ctx.globalAlpha = 1

      // edge stripes
      ctx.strokeStyle = 'rgba(255,255,255,0.65)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(runwayCx - runwayFarHalfW, runwayFarY)
      ctx.lineTo(runwayCx - runwayNearHalfW, runwayNearY)
      ctx.moveTo(runwayCx + runwayFarHalfW, runwayFarY)
      ctx.lineTo(runwayCx + runwayNearHalfW, runwayNearY)
      ctx.stroke()

      // threshold piano keys
      const keys = 6
      const kw = (runwayFarHalfW * 2) / keys
      ctx.fillStyle = 'rgba(255,255,255,0.88)'
      for (let i = 0; i < keys; i++) {
        const kx = runwayCx - runwayFarHalfW + i * kw + kw * 0.18
        ctx.fillRect(kx, runwayFarY + 2, kw * 0.64, Math.max(2, 5))
      }

      // AIM-POINT bracket (gold) — the flare sight picture
      const aimT = 0.4
      const aimY = runwayFarY + (runwayNearY - runwayFarY) * aimT
      const aimHalfW = runwayFarHalfW + (runwayNearHalfW - runwayFarHalfW) * aimT
      ctx.strokeStyle = '#F2B134'
      ctx.lineWidth = 2.5
      ctx.shadowColor = 'rgba(242,177,52,0.6)'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.moveTo(runwayCx - aimHalfW * 0.35, aimY)
      ctx.lineTo(runwayCx - aimHalfW * 0.35, aimY - 9)
      ctx.moveTo(runwayCx + aimHalfW * 0.35, aimY)
      ctx.lineTo(runwayCx + aimHalfW * 0.35, aimY - 9)
      ctx.stroke()
      ctx.shadowBlur = 0

      // PAPI lights (left of threshold, when close)
      if (state.distance < 400 && state.distance > -300) {
        const distToThr = -state.distance
        const idealAlt = distToThr > 0 ? 0.0524 * distToThr : 0
        let whites = 4
        if (idealAlt > 0) {
          const ratio = state.altitude / idealAlt
          whites = ratio >= 1.15 ? 4 : ratio >= 1.0 ? 3 : ratio >= 0.85 ? 2 : ratio >= 0.7 ? 1 : 0
        }
        const papiY = runwayFarY + 3
        for (let i = 0; i < 4; i++) {
          const isWhite = i >= 4 - whites
          const px = runwayCx - runwayFarHalfW - 14 - i * 5
          ctx.save()
          ctx.shadowColor = isWhite ? 'rgba(255,246,216,1)' : 'rgba(255,91,79,1)'
          ctx.shadowBlur = 7
          ctx.fillStyle = isWhite ? '#fff6d8' : '#ff5b4f'
          ctx.beginPath()
          ctx.arc(px, papiY, 1.8, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      // ============================================================
      // FLARE-WINDOW cue — golden tint when in the 4-20ft zone, unflared
      // ============================================================
      if (state.altitude <= 20 && state.altitude > 4 && state.flareFirstAlt === null) {
        ctx.save()
        ctx.globalAlpha = 0.08 + 0.04 * Math.sin(now * 4)
        ctx.fillStyle = '#F2B134'
        ctx.fillRect(0, 0, w, horizonY + 40)
        ctx.restore()
      }

      // ============================================================
      // COCKPIT INTERIOR — the frame that sells "you are the pilot"
      // glareshield, windshield pillars, cowl, instrument coaming
      // ============================================================
      // glareshield (top black band)
      const glareshield = ctx.createLinearGradient(0, 0, 0, h * 0.08)
      glareshield.addColorStop(0, '#050810')
      glareshield.addColorStop(1, '#0c1420')
      ctx.fillStyle = glareshield
      ctx.fillRect(0, 0, w, h * 0.06)

      // windshield pillars (A-pillars, angled)
      ctx.fillStyle = '#0a1018'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(w * 0.12, h * 0.06)
      ctx.lineTo(w * 0.1, h * 0.62)
      ctx.lineTo(0, h * 0.62)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(w, 0)
      ctx.lineTo(w * 0.88, h * 0.06)
      ctx.lineTo(w * 0.9, h * 0.62)
      ctx.lineTo(w, h * 0.62)
      ctx.closePath()
      ctx.fill()

      // center rearview-mirror + sun-visor hint
      ctx.fillStyle = '#0a1018'
      ctx.fillRect(w * 0.42, h * 0.02, w * 0.16, h * 0.025)
      ctx.fillStyle = 'rgba(180,200,220,0.15)'
      ctx.fillRect(w * 0.42, h * 0.02, w * 0.16, h * 0.008)

      // COWL (nose of the aircraft) — pitches with attitude, the key depth cue
      const cowlTopY = h * 0.72 + pitchOffset * 0.5
      const cowlGrad = ctx.createLinearGradient(0, cowlTopY, 0, h)
      cowlGrad.addColorStop(0, '#3E92CC')
      cowlGrad.addColorStop(0.2, '#1f5179')
      cowlGrad.addColorStop(0.6, '#0f2d44')
      cowlGrad.addColorStop(1, '#06121e')
      ctx.fillStyle = cowlGrad
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.34, cowlTopY)
      ctx.quadraticCurveTo(cx, cowlTopY - 16, cx + w * 0.34, cowlTopY)
      ctx.lineTo(cx + w * 0.5, h)
      ctx.lineTo(cx - w * 0.5, h)
      ctx.closePath()
      ctx.fill()
      // cowl top highlight (catches the sun)
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.33, cowlTopY + 2)
      ctx.quadraticCurveTo(cx, cowlTopY - 14, cx + w * 0.33, cowlTopY + 2)
      ctx.stroke()
      // cowl seam
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.34, cowlTopY + 3)
      ctx.quadraticCurveTo(cx, cowlTopY - 12, cx + w * 0.34, cowlTopY + 3)
      ctx.stroke()
      // engine vents
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(cx + i * 20 - 4, cowlTopY + 22, 8, 3)
      }

      // ============================================================
      // INSTRUMENT COAMING (the panel lip above the cowl) — holds the gauges
      // ============================================================
      ctx.fillStyle = '#0a1018'
      ctx.fillRect(0, cowlTopY + 6, w, 10)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(0, cowlTopY + 6, w, 1.5)

      // vignette
      const vig = ctx.createRadialGradient(cx, h * 0.5, h * 0.3, cx, h * 0.5, h * 0.8)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.4)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)
    }, [])

    React.useImperativeHandle(ref, () => ({ renderFrame, reset }), [renderFrame, reset])

    return (
      <div ref={wrapRef} className={cn('relative h-full w-full overflow-hidden', className)}>
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 fc-vignette" />
      </div>
    )
  },
)
