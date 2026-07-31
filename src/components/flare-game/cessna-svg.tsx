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
 * CessnaSvg — a REAR 3/4 view of a Cessna 172 (looking at the back of the
 * plane as it flies away down the runway). This matches the forward-perspective
 * runway — the plane faces the right direction.
 *
 * Features: high-wing, tricycle gear, swept fin, spinning prop disc visible
 * from behind, elevator/rudder/aileron control surfaces that hinge in real-time,
 * gear compression on touchdown, landing light, tail number.
 *
 * Brand palette: navy shadows, sky-blue livery, gold accents, glass cockpit.
 */
export const CessnaSvg = React.forwardRef<CessnaHandle, CessnaSvgProps>(
  function CessnaSvg({ stalled = false, onGround = false, gearCompress = 0, className }, ref) {
    const elevRef = React.useRef<SVGGElement>(null)
    const rudderRef = React.useRef<SVGGElement>(null)
    const aileronLRef = React.useRef<SVGGElement>(null)
    const aileronRRef = React.useRef<SVGGElement>(null)
    const propRef = React.useRef<SVGGElement>(null)

    React.useImperativeHandle(ref, () => ({
      setElevator: (deg: number) => {
        elevRef.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} 120 28)`)
      },
      setRudder: (deg: number) => {
        rudderRef.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} 120 8)`)
      },
      setAileron: (deg: number) => {
        aileronLRef.current?.setAttribute('transform', `rotate(${deg.toFixed(2)} 50 34)`)
        aileronRRef.current?.setAttribute('transform', `rotate(${-deg.toFixed(2)} 190 34)`)
      },
      setBank: () => {
        /* bank applied via parent wrapper */
      },
    }), [])

    // livery swaps to damaged/red look when stalled
    const bodyTop = stalled ? '#aebdd0' : '#f8fbff'
    const bodyMid = stalled ? '#2a3a55' : '#d8e4f0'
    const bodyBot = stalled ? '#44557a' : '#8a9db8'
    const accent = stalled ? '#cf5b53' : '#3E92CC'
    const accentDark = stalled ? '#7a2f2c' : '#1f5179'
    const gold = '#F2B134'
    const id = React.useId().replace(/:/g, '')

    const gearSquash = gearCompress * 3

    return (
      <svg
        viewBox="0 0 240 140"
        className={cn('overflow-visible', className)}
        role="img"
        aria-label="Cessna 172 — rear view"
      >
        <defs>
          <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bodyTop} />
            <stop offset="50%" stopColor={bodyMid} />
            <stop offset="100%" stopColor={bodyBot} />
          </linearGradient>
          <linearGradient id={`wing-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} />
            <stop offset="60%" stopColor={accentDark} />
            <stop offset="100%" stopColor="#143656" />
          </linearGradient>
          <linearGradient id={`wing-shade-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#143656" />
            <stop offset="100%" stopColor="#0a1f33" />
          </linearGradient>
          <linearGradient id={`window-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fe3ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a2236" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`prop-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="40%" stopColor="rgba(200,220,240,0.15)" />
            <stop offset="100%" stopColor="rgba(200,220,240,0)" />
          </radialGradient>
          <radialGradient id={`hub-${id}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff3c4" />
            <stop offset="60%" stopColor={gold} />
            <stop offset="100%" stopColor="#8a6320" />
          </radialGradient>
          <radialGradient id={`light-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,238,180,0.9)" />
            <stop offset="100%" stopColor="rgba(255,238,180,0)" />
          </radialGradient>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Ground shadow (grows + sharpens near the ground) */}
        <ellipse cx="120" cy={onGround ? 122 : 125} rx="70" ry="5" fill="rgba(0,0,0,0.25)" />

        {/* === Landing light cone (forward, volumetric — visible from behind as glow ahead) === */}
        <ellipse cx="120" cy="45" rx="50" ry="20" fill={`url(#light-${id})`} opacity="0.4" />

        {/* === Horizontal stabilizer + hinged elevator (rear view — wide span) === */}
        <g>
          {/* Stabilizer — wide horizontal surface at the tail */}
          <path d="M 70 30 L 170 30 L 172 34 L 68 34 Z" fill={`url(#wing-shade-${id})`} stroke="#0a1424" strokeWidth="0.8" />
          <path d="M 72 30 L 168 30 L 168 32 L 72 32 Z" fill={accent} opacity="0.6" />
          {/* Elevator — hinged, spans the stabilizer */}
          <g ref={elevRef} transform="rotate(0 120 28)">
            <path d="M 72 34 L 168 34 L 170 40 L 70 40 Z" fill={stalled ? '#7a2f2c' : '#2d6a93'} stroke="#0a1424" strokeWidth="0.8" />
            <path d="M 74 34 L 166 34 L 166 36 L 74 36 Z" fill={accent} opacity="0.4" />
          </g>
        </g>

        {/* === Vertical fin + hinged rudder (center, tall) === */}
        <path d="M 112 30 L 116 4 L 124 4 L 128 30 Z" fill={`url(#wing-${id})`} stroke="#0a1424" strokeWidth="0.9" />
        <g ref={rudderRef} transform="rotate(0 120 8)">
          <path d="M 120 8 L 128 8 L 132 30 L 116 30 Z" fill={accentDark} stroke="#0a1424" strokeWidth="0.7" opacity="0.95" />
          <line x1="120" y1="12" x2="128" y2="12" stroke={accent} strokeWidth="0.5" opacity="0.5" />
        </g>
        {/* Tail number on the fin */}
        <text x="120" y="18" fontSize="5" fontFamily="var(--font-mono), monospace" fill="#e6f0fb" textAnchor="middle" opacity="0.85">N172FC</text>

        {/* === Fuselage (rear view — rounded body tapering forward) === */}
        <path
          d="M 95 28 C 95 42, 100 52, 120 54 C 140 52, 145 42, 145 28 C 145 22, 135 18, 120 18 C 105 18, 95 22, 95 28 Z"
          fill={`url(#body-${id})`} stroke="#0a1424" strokeWidth="1"
        />
        {/* Belly shadow */}
        <path d="M 100 48 C 108 52, 132 52, 140 48 C 135 54, 105 54, 100 48 Z" fill="#0a1424" opacity="0.2" />
        {/* Livery stripe */}
        <path d="M 96 34 C 100 36, 140 36, 144 34 L 144 36 C 140 38, 100 38, 96 36 Z" fill={accent} opacity="0.7" />
        <path d="M 96 37 C 100 39, 140 39, 144 37 L 144 38 C 140 40, 100 40, 96 38 Z" fill={gold} opacity="0.6" />

        {/* === Cabin windows (rear view — two side windows + rear window) === */}
        <path d="M 105 26 L 135 26 L 137 32 L 103 32 Z" fill={`url(#window-${id})`} stroke="#0a1424" strokeWidth="0.6" />
        <line x1="120" y1="26" x2="120" y2="32" stroke="#0a1424" strokeWidth="0.5" opacity="0.6" />
        {/* Window highlights */}
        <path d="M 107 27 L 117 27 L 113 30 L 107 30 Z" fill="rgba(255,255,255,0.35)" />
        <path d="M 123 27 L 133 27 L 129 30 L 123 30 Z" fill="rgba(255,255,255,0.2)" />

        {/* === High wing (spanning the full width, viewed from behind) === */}
        <path d="M 35 38 L 205 38 L 210 44 L 30 44 Z" fill={`url(#wing-${id})`} stroke="#0a1424" strokeWidth="1" />
        {/* Wing underside shadow */}
        <path d="M 35 43 L 205 43 L 210 44 L 30 44 Z" fill="#0a1f33" />
        {/* Wing top highlight */}
        <path d="M 40 39 L 200 39" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        {/* Wing strut lines (visible from rear) */}
        <line x1="50" y1="44" x2="55" y2="50" stroke="#0a1424" strokeWidth="1.2" />
        <line x1="190" y1="44" x2="185" y2="50" stroke="#0a1424" strokeWidth="1.2" />
        {/* Navigation lights — red (left), green (right) */}
        <circle cx="32" cy="41" r="2" fill="#e0584f" filter={`url(#glow-${id})`} />
        <circle cx="32" cy="41" r="1.2" fill="#ff9a92" />
        <circle cx="208" cy="41" r="2" fill="#5fcf6a" filter={`url(#glow-${id})`} />
        <circle cx="208" cy="41" r="1.2" fill="#b6f5bf" />

        {/* === Ailerons (hinged, at wing tips) === */}
        <g ref={aileronLRef} transform="rotate(0 50 34)">
          <path d="M 35 44 L 55 44 L 53 49 L 37 49 Z" fill={accentDark} stroke="#0a1424" strokeWidth="0.5" opacity="0.6" />
        </g>
        <g ref={aileronRRef} transform="rotate(0 190 34)">
          <path d="M 185 44 L 205 44 L 203 49 L 187 49 Z" fill={accentDark} stroke="#0a1424" strokeWidth="0.5" opacity="0.6" />
        </g>

        {/* === Propeller disc (seen from behind — glowing disc + blade ghosts) === */}
        <g transform="translate(120 50)">
          <ellipse rx="22" ry="22" fill={`url(#prop-${id})`} opacity="0.5" />
          <g ref={propRef}>
            <ellipse rx="22" ry="2.2" fill="rgba(18,28,42,0.5)">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
            <ellipse rx="22" ry="2.2" fill="rgba(18,28,42,0.35)">
              <animateTransform attributeName="transform" type="rotate" from="120" to="480" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
            <ellipse rx="22" ry="2.2" fill="rgba(18,28,42,0.25)">
              <animateTransform attributeName="transform" type="rotate" from="240" to="600" dur="0.12s" repeatCount="indefinite" />
            </ellipse>
          </g>
          <circle r="3.5" fill={`url(#hub-${id})`} stroke="#0a1424" strokeWidth="0.5" />
          <circle r="1.3" fill="#0a1424" />
        </g>

        {/* === Landing light (center, below prop) === */}
        <circle cx="120" cy="50" r="2.5" fill="#fff3c4" filter={`url(#glow-${id})`} opacity="0.9" />

        {/* === Fixed tricycle gear (rear view — two main + nose) === */}
        {/* Nose gear (center, forward) */}
        <line x1="120" y1="54" x2="120" y2={72 - gearSquash} stroke="#0a1424" strokeWidth="2" />
        <ellipse cx="120" cy={73 - gearSquash} rx={4 - gearCompress * 0.5} ry={4 - gearCompress * 0.5} fill="#1a2740" stroke="#0a1424" strokeWidth="1" />
        <circle cx="120" cy={73 - gearSquash} r="1.8" fill="#2a3a55" />

        {/* Main gear (left) */}
        <line x1="85" y1="54" x2="82" y2={72 - gearSquash} stroke="#0a1424" strokeWidth="2.2" />
        <ellipse cx="82" cy={73 - gearSquash} rx={5 - gearCompress * 0.6} ry={5 - gearCompress * 0.6} fill="#1a2740" stroke="#0a1424" strokeWidth="1" />
        <circle cx="82" cy={73 - gearSquash} r="2.2" fill="#2a3a55" />
        <circle cx="81" cy={72 - gearSquash} r="0.8" fill="rgba(255,255,255,0.3)" />

        {/* Main gear (right) */}
        <line x1="155" y1="54" x2="158" y2={72 - gearSquash} stroke="#0a1424" strokeWidth="2.2" />
        <ellipse cx="158" cy={73 - gearSquash} rx={5 - gearCompress * 0.6} ry={5 - gearCompress * 0.6} fill="#1a2740" stroke="#0a1424" strokeWidth="1" />
        <circle cx="158" cy={73 - gearSquash} r="2.2" fill="#2a3a55" />
        <circle cx="157" cy={72 - gearSquash} r="0.8" fill="rgba(255,255,255,0.3)" />

        {/* Registration on the belly */}
        <text x="120" y="62" fontSize="4.5" fontFamily="var(--font-mono), monospace" fill="#e6f0fb" textAnchor="middle" opacity="0.6">172</text>
      </svg>
    )
  },
)
