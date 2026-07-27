'use client'

import * as React from 'react'
import { InstrumentFrame } from './instrument-frame'
import { useNeedleSpring, polar, arcPath } from './use-needle-spring'

export interface AirspeedHandle {
  setValue: (kt: number) => void
}

export interface AirspeedProps {
  value?: number // controlled (replay) — kt
  className?: string
}

const CX = 100
const CY = 100
const MAX = 160
const SWEEP = 270 // degrees
const START = -135 // 0 kt points to 7:30

function ktToDeg(kt: number) {
  const c = Math.max(0, Math.min(MAX, kt))
  return START + (c / MAX) * SWEEP
}

export const Airspeed = React.forwardRef<AirspeedHandle, AirspeedProps>(
  function Airspeed({ value, className }, ref) {
    const needle = React.useRef<SVGGElement>(null)
    const readout = React.useRef<SVGTextElement>(null)

    const apply = React.useCallback((deg: number) => {
      needle.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} ${CX} ${CY})`)
    }, [])
    const spring = useNeedleSpring(apply, START)

    React.useImperativeHandle(ref, () => ({
      setValue: (kt: number) => {
        spring.setValue(ktToDeg(kt))
        if (readout.current) readout.current.textContent = String(Math.max(0, Math.round(kt)))
      },
    }), [spring])

    React.useEffect(() => {
      if (value === undefined) return
      spring.setImmediate(ktToDeg(value))
      if (readout.current) readout.current.textContent = String(Math.max(0, Math.round(value)))
    }, [value, spring])

    // C172 arcs (kt): white 33-85 (flap), green 44-129 (normal), yellow 129-163, red Vne 163
    const arcs = [
      { from: 33, to: 85, color: '#e8eef5', w: 5 },
      { from: 44, to: 129, color: '#5fcf6a', w: 5 },
      { from: 129, to: 160, color: '#F2B134', w: 5 },
    ]
    // ticks every 10
    const ticks = Array.from({ length: MAX / 10 + 1 }, (_, i) => i * 10)

    return (
      <InstrumentFrame label="AS" sublabel="KNOTS" className={className} glow="#5fcf6a">
        {/* colored arcs */}
        {arcs.map((a, i) => (
          <path
            key={i}
            d={arcPath(CX, CY, 80, ktToDeg(a.from), ktToDeg(a.to))}
            fill="none"
            stroke={a.color}
            strokeWidth={a.w}
            strokeLinecap="butt"
          />
        ))}
        {/* Vne red radial */}
        <line
          x1={polar(CX, CY, 86, ktToDeg(160)).x}
          y1={polar(CX, CY, 86, ktToDeg(160)).y}
          x2={polar(CX, CY, 68, ktToDeg(160)).x}
          y2={polar(CX, CY, 68, ktToDeg(160)).y}
          stroke="#e0584f"
          strokeWidth="2.4"
        />

        {/* ticks + numbers */}
        {ticks.map((kt) => {
          const deg = ktToDeg(kt)
          const major = kt % 20 === 0
          const p1 = polar(CX, CY, 74, deg)
          const p2 = polar(CX, CY, major ? 64 : 70, deg)
          return (
            <g key={kt}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={major ? '#cfe0f2' : '#5f7a99'}
                strokeWidth={major ? 1.6 : 0.9}
              />
              {major && (
                <text
                  x={polar(CX, CY, 54, deg).x}
                  y={polar(CX, CY, 54, deg).y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="var(--font-jetbrains), monospace"
                  fill="#cfe0f2"
                >
                  {kt}
                </text>
              )}
            </g>
          )
        })}

        {/* digital readout */}
        <rect x="82" y="124" width="36" height="16" rx="2" fill="#02060d" stroke="rgba(95,207,106,0.4)" />
        <text
          ref={readout}
          x="100"
          y="136"
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-jetbrains), monospace"
          fill="#5fcf6a"
        >
          0
        </text>

        {/* needle */}
        <g ref={needle} transform={`rotate(${START} ${CX} ${CY})`}>
          <polygon
            points={`${CX},${CY - 72} ${CX - 2.4},${CY + 6} ${CX + 2.4},${CY + 6}`}
            fill="#F2B134"
            stroke="#0a1424"
            strokeWidth="0.6"
          />
        </g>
        <circle cx={CX} cy={CY} r="6" fill="#1a2740" stroke="#5b6b82" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="2" fill="#F2B134" />
      </InstrumentFrame>
    )
  },
)
