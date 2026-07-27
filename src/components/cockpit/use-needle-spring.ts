'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * useNeedleSpring — a tiny critically-damped spring that drives an SVG needle
 * via a direct DOM attribute write (no React re-render, no transform-origin
 * headaches). Start-on-demand: the rAF only runs while the needle is settling,
 * so idle instruments cost nothing.
 *
 * `apply(deg)` is called every frame with the eased display value (degrees).
 */
export function useNeedleSpring(apply: (deg: number) => void, initial = 0) {
  const target = useRef(initial)
  const display = useRef(initial)
  const raf = useRef(0)
  const running = useRef(false)
  const applyRef = useRef(apply)
  useEffect(() => {
    applyRef.current = apply
  }, [apply])

  const start = useCallback(() => {
    if (running.current) return
    running.current = true
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = target.current
      const d = display.current
      // critically-damped-ish ease toward target (~ settles in ~0.5s)
      const k = 1 - Math.pow(0.0008, dt)
      const next = d + (t - d) * k
      display.current = next
      applyRef.current(next)
      if (Math.abs(t - next) < 0.04) {
        display.current = t
        applyRef.current(t)
        running.current = false
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [])

  const setValue = useCallback(
    (v: number) => {
      target.current = v
      start()
    },
    [start],
  )

  // Snap with no easing (used for replay scrubbing — scrubbing wants immediacy).
  const setImmediate = useCallback((v: number) => {
    target.current = v
    display.current = v
    applyRef.current(v)
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return { setValue, setImmediate }
}

// geometry helpers shared by all round instruments --------------------------
export function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

/** SVG arc path from deg a1 to a2 (0 = up, clockwise) at radius r. */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  a1: number,
  a2: number,
) {
  const start = polar(cx, cy, r, a1)
  const end = polar(cx, cy, r, a2)
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0
  const sweep = a2 > a1 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} ${sweep} ${end.x.toFixed(
    2,
  )} ${end.y.toFixed(2)}`
}
