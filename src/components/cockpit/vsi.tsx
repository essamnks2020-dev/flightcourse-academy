'use client'

import * as React from 'react'
import { InstrumentFrame } from './instrument-frame'
import { useNeedleSpring, polar } from './use-needle-spring'

export interface VsiHandle {
  setValue: (fpm: number) => void
}

export interface VsiProps {
  value?: number // controlled (replay) — ft/min
  className?: string
}

const CX = 100
const CY = 100
const MAX = 2000
const SPAN = 120 // degrees each side from top

function fpmToDeg(fpm: number) {
  const c = Math.max(-MAX, Math.min(MAX, fpm))
  return (c / MAX) * SPAN
}

export const Vsi = React.forwardRef<VsiHandle, VsiProps>(function Vsi(
  { value, className },
  ref,
) {
  const needle = React.useRef<SVGGElement>(null)
  const readout = React.useRef<SVGTextElement>(null)

  const apply = React.useCallback((deg: number) => {
    needle.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} ${CX} ${CY})`)
  }, [])
  const spring = useNeedleSpring(apply, 0)

  React.useImperativeHandle(ref, () => ({
    setValue: (fpm: number) => {
      spring.setValue(fpmToDeg(fpm))
      if (readout.current) {
        const v = Math.round(fpm)
        readout.current.textContent = (v > 0 ? '+' : '') + v
      }
    },
  }), [spring])

  React.useEffect(() => {
    if (value === undefined) return
    spring.setImmediate(fpmToDeg(value))
    const v = Math.round(value)
    if (readout.current) readout.current.textContent = (v > 0 ? '+' : '') + v
  }, [value, spring])

  const labels = [-20, -10, -5, 0, 5, 10, 20] // ×100 fpm
  return (
    <InstrumentFrame label="VSI" sublabel="FT/MIN" className={className} glow="#F2B134">
      {/* tick ring */}
      {Array.from({ length: 21 }, (_, i) => {
        const fpm = -MAX + (i / 20) * (2 * MAX)
        const deg = fpmToDeg(fpm)
        const major = i % 5 === 0
        const p1 = polar(CX, CY, 82, deg)
        const p2 = polar(CX, CY, major ? 70 : 77, deg)
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={major ? '#cfe0f2' : '#5f7a99'}
            strokeWidth={major ? 1.6 : 0.8}
          />
        )
      })}
      {/* numbers */}
      {labels.map((n) => {
        const deg = fpmToDeg(n * 100)
        const p = polar(CX, CY, 58, deg)
        return (
          <text
            key={n}
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            fontSize="12"
            fontFamily="var(--font-jetbrains), monospace"
            fill={n === 0 ? '#F2B134' : '#cfe0f2'}
          >
            {n}
          </text>
        )
      })}
      {/* climb/descend hints */}
      <text x={polar(CX, CY, 90, 70).x} y={polar(CX, CY, 90, 70).y} textAnchor="middle" fontSize="8" fill="#5f7a99" fontFamily="var(--font-jetbrains), monospace">UP</text>
      <text x={polar(CX, CY, 90, -70).x} y={polar(CX, CY, 90, -70).y} textAnchor="middle" fontSize="8" fill="#5f7a99" fontFamily="var(--font-jetbrains), monospace">DN</text>

      {/* digital readout */}
      <rect x="78" y="124" width="44" height="16" rx="2" fill="#02060d" stroke="rgba(242,177,52,0.4)" />
      <text
        ref={readout}
        x="100"
        y="136"
        textAnchor="middle"
        fontSize="11"
        fontFamily="var(--font-jetbrains), monospace"
        fill="#F2B134"
      >
        0
      </text>

      {/* needle (double-ended, like a real VSI) */}
      <g ref={needle} transform={`rotate(0 ${CX} ${CY})`}>
        <line x1={CX} y1={CY - 74} x2={CX} y2={CY + 30} stroke="#F2B134" strokeWidth="2.4" strokeLinecap="round" />
        <polygon points={`${CX},${CY - 74} ${CX - 3},${CY - 64} ${CX + 3},${CY - 64}`} fill="#F2B134" />
        <circle cx={CX} cy={CY + 30} r="2" fill="#F2B134" />
      </g>
      <circle cx={CX} cy={CY} r="6" fill="#1a2740" stroke="#5b6b82" strokeWidth="1" />
      <circle cx={CX} cy={CY} r="2" fill="#F2B134" />
    </InstrumentFrame>
  )
})
