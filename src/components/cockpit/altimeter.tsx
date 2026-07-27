'use client'

import * as React from 'react'
import { InstrumentFrame } from './instrument-frame'
import { useNeedleSpring, polar } from './use-needle-spring'

export interface AltimeterHandle {
  setValue: (feet: number) => void
}

export interface AltimeterProps {
  value?: number // controlled (replay/preview) — feet AGL
  className?: string
}

const CX = 100
const CY = 100

function feetTo100sDeg(feet: number) {
  return ((feet % 1000) / 1000) * 360
}
function feetTo1000sDeg(feet: number) {
  return ((feet % 10000) / 10000) * 360
}

export const Altimeter = React.forwardRef<AltimeterHandle, AltimeterProps>(
  function Altimeter({ value, className }, ref) {
    const needle100 = React.useRef<SVGGElement>(null)
    const needle1000 = React.useRef<SVGGElement>(null)
    const readout = React.useRef<SVGTextElement>(null)

    const apply100s = React.useCallback((deg: number) => {
      needle100.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} ${CX} ${CY})`)
    }, [])
    const apply1000s = React.useCallback((deg: number) => {
      needle1000.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} ${CX} ${CY})`)
    }, [])

    const spring100 = useNeedleSpring(apply100s, 0)
    const spring1000 = useNeedleSpring(apply1000s, 0)

    React.useImperativeHandle(ref, () => ({
      setValue: (feet: number) => {
        spring100.setValue(feetTo100sDeg(feet))
        spring1000.setValue(feetTo1000sDeg(feet))
        if (readout.current) {
          readout.current.textContent = String(Math.max(0, Math.round(feet))).padStart(3, '0')
        }
      },
    }), [spring100, spring1000])

    // controlled mode (replay scrub)
    React.useEffect(() => {
      if (value === undefined) return
      spring100.setImmediate(feetTo100sDeg(value))
      spring1000.setImmediate(feetTo1000sDeg(value))
      if (readout.current) {
        readout.current.textContent = String(Math.max(0, Math.round(value))).padStart(3, '0')
      }
    }, [value, spring100, spring1000])

    // ticks: 10 around (0-9)
    const ticks = Array.from({ length: 50 }, (_, i) => i)
    return (
      <InstrumentFrame label="ALT" sublabel="FT × 100" className={className} glow="#3E92CC">
        {/* tick ring */}
        {ticks.map((i) => {
          const deg = (i / 50) * 360
          const major = i % 5 === 0
          const p1 = polar(CX, CY, 82, deg)
          const p2 = polar(CX, CY, major ? 72 : 77, deg)
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
        {/* numbers 0-9 */}
        {Array.from({ length: 10 }, (_, n) => {
          const deg = (n / 10) * 360
          const p = polar(CX, CY, 60, deg)
          return (
            <text
              key={n}
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize="13"
              fontFamily="var(--font-jetbrains), monospace"
              fill="#cfe0f2"
            >
              {n}
            </text>
          )
        })}

        {/* digital hundreds readout */}
        <rect x="80" y="120" width="40" height="18" rx="2" fill="#02060d" stroke="rgba(62,146,204,0.4)" />
        <text
          ref={readout}
          x="100"
          y="133"
          textAnchor="middle"
          fontSize="12"
          fontFamily="var(--font-jetbrains), monospace"
          fill="#F2B134"
        >
          000
        </text>

        {/* 1000s needle (short, sky) */}
        <g ref={needle1000} transform={`rotate(0 ${CX} ${CY})`}>
          <polygon
            points={`${CX},${CY - 50} ${CX - 4},${CY} ${CX + 4},${CY}`}
            fill="#3E92CC"
            stroke="#0a1424"
            strokeWidth="0.6"
          />
        </g>
        {/* 100s needle (long, gold) */}
        <g ref={needle100} transform={`rotate(0 ${CX} ${CY})`}>
          <polygon
            points={`${CX},${CY - 76} ${CX - 2.6},${CY} ${CX + 2.6},${CY}`}
            fill="#F2B134"
            stroke="#0a1424"
            strokeWidth="0.6"
          />
          <circle cx={CX} cy={CY - 64} r="2.2" fill="#0a1424" />
        </g>
        {/* hub */}
        <circle cx={CX} cy={CY} r="6" fill="#1a2740" stroke="#5b6b82" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="2" fill="#F2B134" />
      </InstrumentFrame>
    )
  },
)
