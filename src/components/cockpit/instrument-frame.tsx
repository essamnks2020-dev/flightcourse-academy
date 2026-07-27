'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * InstrumentFrame — the shared Cockpit Explorer visual language.
 * A circular bezel with a dual-tone metallic ring, knurled outer edge, 4
 * beveled screws, a dark LCD face with a brand-tinted radial glow, layered
 * glass glare, and a label plate. All FlightCourse instruments render their
 * face content inside this frame so the brand reads consistently everywhere.
 */
export interface InstrumentFrameProps {
  children?: React.ReactNode
  label?: string
  sublabel?: string
  className?: string
  glow?: string // hex tint for the LCD glow
  faceTint?: string // hex for face background top
}

export const InstrumentFrame = React.forwardRef<
  SVGSVGElement,
  InstrumentFrameProps
>(function InstrumentFrame(
  { children, label, sublabel, className, glow = '#3E92CC', faceTint = '#0a1626' },
  ref,
) {
  const id = React.useId().replace(/:/g, '')
  const screws = [
    { x: 30, y: 30 },
    { x: 170, y: 30 },
    { x: 30, y: 170 },
    { x: 170, y: 170 },
  ]
  return (
    <svg
      ref={ref}
      viewBox="0 0 200 224"
      className={cn('h-full w-full select-none', className)}
      role="img"
      aria-label={label}
    >
      <defs>
        {/* outer ring — brushed metal, light at top-left */}
        <linearGradient id={`ring-${id}`} x1="0.25" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#7b8ca6" />
          <stop offset="25%" stopColor="#3d4d66" />
          <stop offset="55%" stopColor="#1a2740" />
          <stop offset="85%" stopColor="#0c1626" />
          <stop offset="100%" stopColor="#445468" />
        </linearGradient>
        {/* inner bevel ring — highlights the face edge */}
        <linearGradient id={`bevel-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
        </linearGradient>
        <radialGradient id={`face-${id}`} cx="50%" cy="42%" r="72%">
          <stop offset="0%" stopColor={faceTint} />
          <stop offset="65%" stopColor="#050a14" />
          <stop offset="100%" stopColor="#01040a" />
        </radialGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="58%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.32" />
          <stop offset="55%" stopColor={glow} stopOpacity="0.07" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`screw-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#7e8ea6" />
          <stop offset="60%" stopColor="#2a3850" />
          <stop offset="100%" stopColor="#0a1424" />
        </radialGradient>
        {/* glass glare — two layered highlights */}
        <linearGradient id={`glare1-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id={`glare2-${id}`} cx="30%" cy="22%" r="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* knurled outer edge (tick ring) */}
      <g>
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * 360
          const rad = (a * Math.PI) / 180
          const x1 = 100 + Math.cos(rad) * 98.5
          const y1 = 100 + Math.sin(rad) * 98.5
          const x2 = 100 + Math.cos(rad) * 95.5
          const y2 = 100 + Math.sin(rad) * 95.5
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 2 === 0 ? '#445468' : '#1a2740'}
              strokeWidth="0.9"
            />
          )
        })}
      </g>

      {/* outer metallic ring */}
      <circle cx="100" cy="100" r="95" fill={`url(#ring-${id})`} />
      {/* ring highlight (top arc) */}
      <path
        d="M 18 100 A 82 82 0 0 1 100 18"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* ring shadow (bottom arc) */}
      <path
        d="M 182 100 A 82 82 0 0 1 100 182"
        fill="none"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* inner bevel ring */}
      <circle cx="100" cy="100" r="90" fill="none" stroke={`url(#bevel-${id})`} strokeWidth="3" />

      {/* face */}
      <circle cx="100" cy="100" r="87" fill={`url(#face-${id})`} />
      <circle cx="100" cy="100" r="87" fill={`url(#glow-${id})`} />
      <circle cx="100" cy="100" r="87" fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="1.2" />

      {/* screws (beveled) */}
      {screws.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="6" fill="rgba(0,0,0,0.5)" />
          <circle cx={p.x} cy={p.y} r="5.2" fill={`url(#screw-${id})`} />
          <circle cx={p.x} cy={p.y} r="5.2" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="0.5" />
          {/* phillips slot */}
          <line
            x1={p.x - 3}
            y1={p.y}
            x2={p.x + 3}
            y2={p.y}
            stroke="rgba(0,0,0,0.7)"
            strokeWidth="1"
            transform={`rotate(${i * 47} ${p.x} ${p.y})`}
          />
          <line
            x1={p.x}
            y1={p.y - 3}
            x2={p.x}
            y2={p.y + 3}
            stroke="rgba(0,0,0,0.7)"
            strokeWidth="1"
            transform={`rotate(${i * 47} ${p.x} ${p.y})`}
          />
          {/* specular highlight */}
          <circle cx={p.x - 1.6} cy={p.y - 1.6} r="1.3" fill="rgba(255,255,255,0.45)" />
        </g>
      ))}

      {/* face content */}
      <g>{children}</g>

      {/* layered glass glare */}
      <ellipse cx="76" cy="62" rx="56" ry="30" fill={`url(#glare1-${id})`} />
      <ellipse cx="70" cy="56" rx="30" ry="16" fill={`url(#glare2-${id})`} />

      {/* label plate */}
      {label && (
        <g>
          <rect
            x="62"
            y="185"
            width="76"
            height="24"
            rx="4"
            fill="#0a1424"
            stroke="rgba(255,255,255,0.12)"
          />
          <rect x="62" y="185" width="76" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
          <text
            x="100"
            y="201"
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-jetbrains), monospace"
            fill="#9fb6d4"
            letterSpacing="1.8"
          >
            {label}
          </text>
          {sublabel && (
            <text
              x="100"
              y="216"
              textAnchor="middle"
              fontSize="8"
              fontFamily="var(--font-jetbrains), monospace"
              fill="#5f7a99"
              letterSpacing="0.6"
            >
              {sublabel}
            </text>
          )}
        </g>
      )}
    </svg>
  )
})
