'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CessnaHandle {
  setElevator: (deg: number) => void
  setRudder: (deg: number) => void
  setAileron: (deg: number) => void
  setBank: (deg: number) => void
}

export interface CessnaSvgProps {
  stalled?: boolean
  onGround?: boolean
  gearCompress?: number // 0..1, how squashed the gear is (touchdown feedback)
  className?: string
}

/**
 * CessnaSvg — a refined side profile of a Cessna 172 (high-wing, fixed
 * tricycle gear, swept fin). Control surfaces are hinged groups driven
 * imperatively by the 60fps game loop:
 *   • elevator  — deflects up on flare input
 *   • rudder    — deflects for crosswind de-crab
 *   • aileron   — subtle deflection with bank
 * Pitch, crab-yaw and bank are applied by the parent wrapper transform.
 * Brand palette only: navy shadows, sky-blue livery, gold accents.
 */
export const CessnaSvg = React.forwardRef<CessnaHandle, CessnaSvgProps>(
  function CessnaSvg({ stalled = false, onGround = false, gearCompress = 0, className }, ref) {
    const elevRef = React.useRef<SVGGElement>(null)
    const rudderRef = React.useRef<SVGGElement>(null)
    const aileronRef = React.useRef<SVGGElement>(null)
    const propRef = React.useRef<SVGGElement>(null)

    React.useImperativeHandle(ref, () => ({
      setElevator: (deg: number) => {
        elevRef.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} 0 3)`)
      },
      setRudder: (deg: number) => {
        rudderRef.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} 42 30)`)
      },
      setAileron: (deg: number) => {
        aileronRef.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} 172 34)`)
      },
      setBank: () => {
        /* bank applied via parent wrapper */
      },
    }), [])

    // livery swaps to a damaged/red look when stalled
    const bodyTop = stalled ? '#aebdd0' : '#fbfdff'
    const bodyMid = stalled ? '#2a3a55' : '#dfe8f2'
    const bodyBot = stalled ? '#44557a' : '#8fa3bd'
    const accent = stalled ? '#cf5b53' : '#3E92CC'
    const accentDark = stalled ? '#7a2f2c' : '#1f5179'
    const gold = '#F2B134'
    const id = React.useId().replace(/:/g, '')

    // gear compression: lower the wheel Y when compressing
    const gearDrop = onGround ? 0 : 2
    const gearSquash = gearCompress * 2

    return (
      <svg
        viewBox="0 0 260 116"
        className={cn('overflow-visible', className)}
        role="img"
        aria-label="Cessna 172"
      >
        <defs>
          <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bodyTop} />
            <stop offset="42%" stopColor={bodyMid} />
            <stop offset="100%" stopColor={bodyBot} />
          </linearGradient>
          <linearGradient id={`wing-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} />
            <stop offset="55%" stopColor={accentDark} />
            <stop offset="100%" stopColor="#163a55" />
          </linearGradient>
          <linearGradient id={`wing-shade-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#163a55" />
            <stop offset="100%" stopColor="#0c2436" />
          </linearGradient>
          <linearGradient id={`window-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9fe3ff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#1d4f74" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a2236" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`prop-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="35%" stopColor="rgba(200,220,240,0.25)" />
            <stop offset="100%" stopColor="rgba(200,220,240,0)" />
          </radialGradient>
          <linearGradient id={`beam-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,238,180,0)" />
            <stop offset="25%" stopColor="rgba(255,238,180,0.45)" />
            <stop offset="70%" stopColor="rgba(255,238,180,0.2)" />
            <stop offset="100%" stopColor="rgba(255,238,180,0)" />
          </linearGradient>
          <radialGradient id={`hub-${id}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff3c4" />
            <stop offset="60%" stopColor={gold} />
            <stop offset="100%" stopColor="#8a6320" />
          </radialGradient>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* soft ground shadow (grows + sharpens near the ground) */}
        <ellipse cx="130" cy={onGround ? 98 : 100} rx="82" ry="5" fill="rgba(0,0,0,0.22)" />

        {/* === Landing light cone (forward, volumetric) === */}
        <path d="M 226 54 L 272 42 L 272 66 Z" fill={`url(#beam-${id})`} opacity="0.85" />
        <path d="M 226 54 L 258 49 L 258 59 Z" fill="rgba(255,238,180,0.3)" />

        {/* === Horizontal stabilizer + hinged elevator === */}
        <g transform="translate(48 52)">
          <path d="M 0 0 L -40 -3 L -40 5 L 0 7 Z" fill={`url(#wing-shade-${id})`} stroke="#0a1424" strokeWidth="0.8" />
          <path d="M 0 0 L -40 -3 L -40 1 L 0 3 Z" fill={accent} opacity="0.85" />
          <g ref={elevRef} transform="rotate(0 0 3)">
            <path d="M 0 3 L -34 6 L -34 13 L 0 10 Z" fill={stalled ? '#7a2f2c' : '#2d6a93'} stroke="#0a1424" strokeWidth="0.8" />
            <path d="M 0 3 L -34 6 L -34 7.5 L 0 4.5 Z" fill={accent} opacity="0.5" />
          </g>
        </g>

        {/* === Vertical fin + hinged rudder === */}
        <path d="M 38 52 L 22 16 L 40 18 L 44 24 L 42 52 Z" fill={`url(#wing-${id})`} stroke="#0a1424" strokeWidth="0.9" />
        <g ref={rudderRef} transform="rotate(0 42 30)">
          <path d="M 42 52 L 42 24 L 50 26 L 52 52 Z" fill={accentDark} stroke="#0a1424" strokeWidth="0.8" opacity="0.95" />
          <path d="M 42 28 L 50 29" stroke={accent} strokeWidth="0.5" opacity="0.6" />
        </g>
        <text x="32" y="34" fontSize="6.5" fontFamily="var(--font-jetbrains), monospace" fill="#e6f0fb" transform="rotate(-62 34 32)" opacity="0.92">N172FC</text>

        {/* === Fuselage (sculpted) === */}
        <path
          d="M 56 54 C 80 34, 172 34, 212 45 C 224 47, 230 53, 226 60 C 206 69, 104 71, 56 64 C 45 62, 43 56, 56 54 Z"
          fill={`url(#body-${id})`} stroke="#0a1424" strokeWidth="1"
        />
        <path d="M 56 62 C 104 69, 206 67, 226 60 C 214 66, 104 70, 56 64 Z" fill="#0a1424" opacity="0.2" />
        <path d="M 70 38 C 110 35, 170 35, 206 43" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <path d="M 76 51 C 100 48, 140 48, 172 51" stroke="#0a1424" strokeWidth="0.4" fill="none" opacity="0.5" />
        <path d="M 80 56 L 164 56" stroke="#0a1424" strokeWidth="0.35" fill="none" opacity="0.4" />
        <path d="M 130 41 L 130 60" stroke="#0a1424" strokeWidth="0.35" fill="none" opacity="0.4" />
        <path d="M 64 55 L 204 50" stroke={accent} strokeWidth="2" opacity="0.85" />
        <path d="M 64 57 L 204 52" stroke={gold} strokeWidth="0.7" opacity="0.75" />
        <rect x="62" y="60" width="7" height="2.4" rx="1" fill="#2a3340" stroke="#0a1424" strokeWidth="0.4" />
        <circle cx="62" cy="61.2" r="0.9" fill="#0a1424" />

        {/* === Cabin windows (tinted, reflective) === */}
        <path d="M 108 40 L 166 40 L 175 49 L 108 49 Z" fill={`url(#window-${id})`} stroke="#0a1424" strokeWidth="0.7" />
        <path d="M 125 40.5 L 125 48.5 M 142 40.5 L 142 48.5 M 159 40.5 L 159 48.5" stroke="#0a1424" strokeWidth="0.6" opacity="0.7" />
        <path d="M 110 41.5 L 128 41.5 L 120 46.5 L 110 46.5 Z" fill="rgba(255,255,255,0.42)" />
        <path d="M 144 41.5 L 162 41.5 L 154 46.5 L 144 46.5 Z" fill="rgba(255,255,255,0.2)" />
        <path d="M 108 49 L 108 63 C 117 64.5, 126 64.5, 130 63 L 130 49" stroke="#0a1424" strokeWidth="0.7" fill="none" />
        <circle cx="124" cy="56" r="0.8" fill={gold} />
        <path d="M 104 60 L 100 64" stroke="#0a1424" strokeWidth="1" />

        {/* === High wing (with strut + hinged aileron) === */}
        <path d="M 80 33 L 186 33 L 190 40 L 76 40 Z" fill={`url(#wing-${id})`} stroke="#0a1424" strokeWidth="1" />
        <path d="M 76 39 L 190 39 L 190 40 L 76 40 Z" fill="#0c2436" />
        <path d="M 82 34 L 184 34" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
        <path d="M 92 35 L 106 35" stroke="#0a1424" strokeWidth="0.5" opacity="0.6" />
        <line x1="86" y1="40" x2="86" y2="41.5" stroke={gold} strokeWidth="0.6" />
        <g ref={aileronRef} transform="rotate(0 172 34)">
          <path d="M 172 34 L 190 34 L 190 40 L 172 40 Z" fill={accentDark} stroke="#0a1424" strokeWidth="0.6" opacity="0.55" />
        </g>
        <line x1="94" y1="40" x2="100" y2="55" stroke="#0a1424" strokeWidth="1.5" />
        <line x1="174" y1="40" x2="168" y2="55" stroke="#0a1424" strokeWidth="1.5" />
        <line x1="94" y1="40" x2="100" y2="55" stroke={accent} strokeWidth="0.5" opacity="0.5" />
        <circle cx="80" cy="36" r="1.8" fill="#e0584f" filter={`url(#glow-${id})`} />
        <circle cx="80" cy="36" r="1" fill="#ff9a92" />
        <circle cx="190" cy="36" r="1.8" fill="#5fcf6a" filter={`url(#glow-${id})`} />
        <circle cx="190" cy="36" r="1" fill="#b6f5bf" />

        {/* === Propeller (spinning disc + blade ghosts + hub) === */}
        <g transform="translate(226 53)">
          <ellipse rx="28" ry="26" fill={`url(#prop-${id})`} opacity="0.65" />
          {/* 3 blade ghosts at different phases — fast, smooth spin */}
          <g ref={propRef}>
            <ellipse rx="28" ry="2.8" fill="rgba(18,28,42,0.6)">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
            <ellipse rx="28" ry="2.8" fill="rgba(18,28,42,0.42)">
              <animateTransform attributeName="transform" type="rotate" from="120" to="480" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
            <ellipse rx="28" ry="2.8" fill="rgba(18,28,42,0.3)">
              <animateTransform attributeName="transform" type="rotate" from="240" to="600" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
          </g>
          <circle r="4" fill={`url(#hub-${id})`} stroke="#0a1424" strokeWidth="0.6" />
          <circle r="1.6" fill="#0a1424" />
        </g>

        {/* === Landing light (nose cone) === */}
        <circle cx="225" cy="50" r="2.8" fill="#fff3c4" filter={`url(#glow-${id})`} />
        <circle cx="225" cy="50" r="1.4" fill="#ffffff" />

        {/* === Fixed tricycle gear (compresses on touchdown) === */}
        {/* nose gear */}
        <line x1="194" y1="66" x2="194" y2={82 - gearSquash - gearDrop} stroke="#0a1424" strokeWidth="2.2" />
        <path d={`M 190 ${81 - gearSquash} L 198 ${81 - gearSquash} L 196 ${85 - gearSquash} L 192 ${85 - gearSquash} Z`} fill="#1a2740" stroke="#0a1424" strokeWidth="0.6" />
        <circle cx="194" cy={83 - gearSquash} r={5 - gearCompress * 0.6} fill="#1a2740" stroke="#0a1424" strokeWidth="1" />
        <circle cx="194" cy={83 - gearSquash} r="2.2" fill="#2a3a55" />
        <circle cx="193" cy={82 - gearSquash} r="0.8" fill="rgba(255,255,255,0.3)" />
        {/* main gear (left) */}
        <line x1="120" y1="68" x2="118" y2={83 - gearSquash - gearDrop} stroke="#0a1424" strokeWidth="2.4" />
        <path d={`M 113 ${82 - gearSquash} L 123 ${82 - gearSquash} L 121 ${86 - gearSquash} L 115 ${86 - gearSquash} Z`} fill="#1a2740" stroke="#0a1424" strokeWidth="0.6" />
        <circle cx="118" cy={84 - gearSquash} r={5.8 - gearCompress * 0.7} fill="#1a2740" stroke="#0a1424" strokeWidth="1" />
        <circle cx="118" cy={84 - gearSquash} r="2.5" fill="#2a3a55" />
        <circle cx="117" cy={83 - gearSquash} r="0.9" fill="rgba(255,255,255,0.3)" />
        {/* main gear (right, faded) */}
        <line x1="132" y1="68" x2="128" y2={83 - gearSquash - gearDrop} stroke="#0a1424" strokeWidth="1.6" opacity="0.55" />
        <circle cx="128" cy={83 - gearSquash} r={5.2 - gearCompress * 0.6} fill="#22304a" stroke="#0a1424" strokeWidth="1" opacity="0.65" />
        <circle cx="128" cy={83 - gearSquash} r="2.1" fill="#2f4060" opacity="0.7" />

        <text x="130" y="32" fontSize="5.5" fontFamily="var(--font-jetbrains), monospace" fill="#e6f0fb" opacity="0.7" textAnchor="middle">172</text>
        <line x1="150" y1="40" x2="150" y2="36" stroke="#0a1424" strokeWidth="0.8" />
      </svg>
    )
  },
)
