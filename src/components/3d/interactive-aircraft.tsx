'use client'

/**
 * interactive-aircraft.tsx — Photoreal Cessna 172 (React Three Fiber)
 *
 * ---------------------------------------------------------------------------
 * COORDINATE CONVENTION (stated up front so every mesh aligns):
 *   +X  = right wing tip
 *   -Z  = nose / direction of travel
 *   +Z  = tail
 *   +Y  = up
 *   Units are loosely metres; the whole airframe is ~5.4 units long.
 *
 * Fuselage is a LatheGeometry revolved about Y then rotated −90° about X so
 * its long axis lies along Z (nose → −Z). Every other part is built directly
 * in the final world frame so nothing floats or offsets.
 *
 * HIGHLIGHT SYSTEM (the "light up the part" feature):
 *   Each highlightable mesh declares the partIds it belongs to. When a pin
 *   becomes active (hover or click), every mesh whose partIds intersect the
 *   pin's partIds gets an emissive glow lerped up in the pin's own colour.
 *
 * Public API (unchanged interface):
 *   <InteractiveAircraft
 *     autoRotate?       boolean     default true
 *     rotateSpeed?      number      default 0.6
 *     enableZoom?       boolean     default true
 *     cameraPosition?   [x,y,z]     default [3.6, 2.1, 4.6]
 *     showPins?         boolean     default true
 *     className?        string
 *   />
 *   export { InteractiveAircraft, NumberedPin }
 * ---------------------------------------------------------------------------
 */

import * as THREE from 'three'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  ContactShadows,
  Html,
  Line,
  Environment,
  Lightformer,
} from '@react-three/drei'

/* ===========================================================================
 * 1. AIRFOIL MATH (NACA 4-digit) + LOFTING
 * ========================================================================= */

/**
 * NACA 4-digit airfoil → closed 2D polygon. Cosine spacing clusters samples
 * at the leading edge (high curvature). The −0.1015 TE coefficient closes the
 * trailing edge cleanly.
 */
function nacaAirfoil(
  chord: number,
  t: number,
  m: number,
  p: number,
  n = 32
): Array<{ x: number; y: number }> {
  const upper: Array<{ x: number; y: number }> = []
  const lower: Array<{ x: number; y: number }> = []
  const safeP = p > 0.02 ? p : 0.4
  for (let i = 0; i <= n; i++) {
    const beta = (i / n) * Math.PI
    const xn = (1 - Math.cos(beta)) / 2
    const x = xn * chord
    const yt =
      5 *
      t *
      (0.2969 * Math.sqrt(xn) -
        0.126 * xn -
        0.3516 * xn * xn +
        0.2843 * xn * xn * xn -
        0.1015 * xn * xn * xn * xn)
    let yc: number, dyc: number
    if (xn < safeP) {
      yc = (m / (safeP * safeP)) * (2 * safeP * xn - xn * xn)
      dyc = (2 * m / (safeP * safeP)) * (safeP - xn)
    } else {
      const q = 1 - safeP
      yc = (m / (q * q)) * (1 - 2 * safeP + 2 * safeP * xn - xn * xn)
      dyc = (2 * m / (q * q)) * (safeP - xn)
    }
    const theta = Math.atan(dyc)
    upper.push({ x: x - yt * Math.sin(theta), y: yc + yt * Math.cos(theta) })
    lower.push({ x: x + yt * Math.sin(theta), y: yc - yt * Math.cos(theta) })
  }
  const pts = upper.slice()
  for (let i = lower.length - 1; i >= 0; i--) pts.push(lower[i])
  return pts
}

interface AirfoilStation {
  span: number
  y: number
  z: number
  chord: number
  thickness: number
  camber: number
  camberPos: number
  twist: number
  teDroop?: number
}

/**
 * Loft a stack of airfoil cross-sections into a closed BufferGeometry with
 * root + tip caps. Quarter-chord sits at station.z; twist is a rotation about
 * the span (X) axis, nose-up positive.
 */
function loftAirfoil(stations: AirfoilStation[], n = 32): THREE.BufferGeometry {
  const sections: THREE.Vector3[][] = stations.map((s) => {
    const pts = nacaAirfoil(s.chord, s.thickness, s.camber, s.camberPos, n)
    return pts.map((p) => {
      const cx = p.x - 0.25 * s.chord
      const z = cx
      let y = p.y
      if (s.teDroop) y -= s.teDroop * (p.x / s.chord)
      const tw = s.twist
      const y2 = y * Math.cos(tw) - z * Math.sin(tw)
      const z2 = y * Math.sin(tw) + z * Math.cos(tw)
      return new THREE.Vector3(s.span, s.y + y2, s.z + z2)
    })
  })
  const positions: number[] = []
  const indices: number[] = []
  const per = sections[0].length
  sections.forEach((sec) => sec.forEach((v) => positions.push(v.x, v.y, v.z)))
  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < per; j++) {
      const jn = (j + 1) % per
      const a = i * per + j
      const b = i * per + jn
      const c = (i + 1) * per + jn
      const d = (i + 1) * per + j
      indices.push(a, b, c, a, c, d)
    }
  }
  // root cap
  const rootC = new THREE.Vector3()
  sections[0].forEach((v) => rootC.add(v))
  rootC.divideScalar(per)
  positions.push(rootC.x, rootC.y, rootC.z)
  const rootIdx = sections.length * per
  for (let j = 0; j < per; j++) {
    const jn = (j + 1) % per
    indices.push(rootIdx, jn, j)
  }
  // tip cap
  const last = sections.length - 1
  const tipC = new THREE.Vector3()
  sections[last].forEach((v) => tipC.add(v))
  tipC.divideScalar(per)
  positions.push(tipC.x, tipC.y, tipC.z)
  const tipIdx = rootIdx + 1
  for (let j = 0; j < per; j++) {
    const jn = (j + 1) % per
    indices.push(tipIdx, last * per + j, last * per + jn)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Mirror geometry about X=0, fix winding so normals stay outward. */
function mirrorGeometryX(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const m = geo.clone()
  m.scale(-1, 1, 1)
  const idx = m.getIndex()
  if (idx) {
    const arr = idx.array as number[]
    for (let i = 0; i < arr.length; i += 3) {
      const tmp = arr[i]
      arr[i] = arr[i + 2]
      arr[i + 2] = tmp
    }
    idx.needsUpdate = true
  }
  m.computeVertexNormals()
  return m
}

/** Loft a half-ellipse canopy shell (width w, height h, base y). */
function loftCanopy(
  stations: Array<{ z: number; w: number; h: number; y: number }>,
  n = 26
): THREE.BufferGeometry {
  const sections: THREE.Vector3[][] = stations.map((s) => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= n; i++) {
      const ang = (Math.PI * i) / n
      pts.push(new THREE.Vector3(s.w * Math.cos(ang), s.y + s.h * Math.sin(ang), s.z))
    }
    return pts
  })
  const positions: number[] = []
  const indices: number[] = []
  const per = sections[0].length
  sections.forEach((sec) => sec.forEach((v) => positions.push(v.x, v.y, v.z)))
  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < per - 1; j++) {
      const a = i * per + j
      const b = i * per + j + 1
      const c = (i + 1) * per + j + 1
      const d = (i + 1) * per + j
      indices.push(a, b, c, a, c, d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/* ===========================================================================
 * 2. LATHE PROFILES
 * ========================================================================= */

const LATHE_SEGMENTS = 48

function makeFuselageProfile(): THREE.Vector2[] {
  return [
    new THREE.Vector2(0.02, -2.55),
    new THREE.Vector2(0.1, -2.5),
    new THREE.Vector2(0.16, -2.45),
    new THREE.Vector2(0.18, -2.4), // cowling nose radius ← spinner mates here
    new THREE.Vector2(0.215, -2.3),
    new THREE.Vector2(0.26, -2.18),
    new THREE.Vector2(0.3, -2.02),
    new THREE.Vector2(0.33, -1.85),
    new THREE.Vector2(0.355, -1.65), // firewall
    new THREE.Vector2(0.375, -1.45),
    new THREE.Vector2(0.395, -1.22),
    new THREE.Vector2(0.415, -0.98),
    new THREE.Vector2(0.435, -0.74),
    new THREE.Vector2(0.452, -0.5),
    new THREE.Vector2(0.465, -0.26),
    new THREE.Vector2(0.472, -0.05),
    new THREE.Vector2(0.474, 0.1), // cabin bulge max
    new THREE.Vector2(0.47, 0.28),
    new THREE.Vector2(0.46, 0.46),
    new THREE.Vector2(0.44, 0.66),
    new THREE.Vector2(0.405, 0.92),
    new THREE.Vector2(0.355, 1.18),
    new THREE.Vector2(0.295, 1.45),
    new THREE.Vector2(0.23, 1.72),
    new THREE.Vector2(0.165, 1.98),
    new THREE.Vector2(0.11, 2.2),
    new THREE.Vector2(0.075, 2.38),
    new THREE.Vector2(0.045, 2.52),
    new THREE.Vector2(0.018, 2.62),
    new THREE.Vector2(0.005, 2.7),
  ]
}

function makeSpinnerProfile(): THREE.Vector2[] {
  return [
    new THREE.Vector2(0.18, 0.15), // base nested inside cowling nose
    new THREE.Vector2(0.172, 0.1),
    new THREE.Vector2(0.155, 0.06),
    new THREE.Vector2(0.128, 0.02),
    new THREE.Vector2(0.094, -0.02),
    new THREE.Vector2(0.058, -0.05),
    new THREE.Vector2(0.028, -0.065),
    new THREE.Vector2(0.008, -0.075),
  ]
}

function makeWheelPantProfile(): THREE.Vector2[] {
  return [
    new THREE.Vector2(0.02, -0.24),
    new THREE.Vector2(0.07, -0.21),
    new THREE.Vector2(0.12, -0.16),
    new THREE.Vector2(0.16, -0.09),
    new THREE.Vector2(0.18, -0.01),
    new THREE.Vector2(0.175, 0.07),
    new THREE.Vector2(0.15, 0.15),
    new THREE.Vector2(0.11, 0.21),
    new THREE.Vector2(0.06, 0.25),
    new THREE.Vector2(0.015, 0.28),
  ]
}

/**
 * Teardrop fairing profile for strut junctions. Near-zero radius at both
 * ends, max radius (~0.05) just aft of mid-length, so the revolved shape is a
 * streamlined teardrop pointed fore-and-aft — NOT a ball or dome. Reused at
 * both the strut-to-wing and strut-to-fuselage ends, and as the belly fairing
 * that tapers into the wheel pant.
 *
 * The profile is authored in (radius, axialY) with the long axis along Y so a
 * LatheGeometry revolves it about Y; the TeardropFairing component then
 * orients that Y axis along the strut's actual direction vector.
 */
function makeStrutFairingProfile(maxR = 0.05, len = 0.22): THREE.Vector2[] {
  // half-length offset so the profile is centred on the origin
  const h = len / 2
  return [
    new THREE.Vector2(0.004, -h),        // tail tip (near-zero radius)
    new THREE.Vector2(0.018, -h * 0.75),
    new THREE.Vector2(0.034, -h * 0.45),
    new THREE.Vector2(maxR * 0.92, -h * 0.1),  // approaching max girth
    new THREE.Vector2(maxR, h * 0.05),         // max girth, slightly aft of centre
    new THREE.Vector2(maxR * 0.96, h * 0.25),
    new THREE.Vector2(maxR * 0.78, h * 0.5),
    new THREE.Vector2(maxR * 0.5, h * 0.72),
    new THREE.Vector2(maxR * 0.22, h * 0.9),
    new THREE.Vector2(0.004, h),          // nose tip (near-zero radius)
  ]
}

/**
 * Returns the true fuselage radius at a given world-z position by linearly
 * interpolating makeFuselageProfile()'s (radius, y) control points. The
 * fuselage LatheGeometry is rotated [-π/2, 0, 0] so profile-y maps to world-z
 * (empirically confirmed: profile y=-2.4 → world z=-2.4 where the cowling
 * nose meets the spinner at z=-2.55).
 *
 * This lets the cabin door conform to the compound curve instead of using a
 * single constant radius that sits proud of the skin.
 */
function fuselageRadiusAt(z: number): number {
  const profile = makeFuselageProfile()
  // profile is sorted ascending by y (nose -2.55 → tail 2.7)
  if (z <= profile[0].y) return profile[0].x
  if (z >= profile[profile.length - 1].y) return profile[profile.length - 1].x
  for (let i = 0; i < profile.length - 1; i++) {
    const y0 = profile[i].y
    const y1 = profile[i + 1].y
    if (z >= y0 && z <= y1) {
      const t = (z - y0) / (y1 - y0)
      // smoothstep for a slightly smoother interpolation
      const ts = t * t * (3 - 2 * t)
      return profile[i].x + (profile[i + 1].x - profile[i].x) * ts
    }
  }
  return profile[profile.length - 1].x
}

/**
 * Build a partial-cylinder panel that conforms to the fuselage's varying
 * radius along z. The panel's axis is along Z (world space), the arc sweeps
 * in the X-Y plane from angleStart to angleEnd, and at each z-slice the
 * radius is fuselageRadiusAt(z) + radiusOffset.
 *
 * This replaces constant-radius CylinderGeometry patches for the door skin,
 * seam channel, and trim so they sit flush against the compound-curve hull.
 */
function buildConformingArcPanel(
  zStart: number,
  zEnd: number,
  angleStart: number,
  angleEnd: number,
  radiusOffset: number,
  radialSegs = 28,
  lengthSegs = 14
): THREE.BufferGeometry {
  const positions: number[] = []
  const indices: number[] = []
  const zStep = (zEnd - zStart) / lengthSegs
  const angStep = (angleEnd - angleStart) / radialSegs
  for (let i = 0; i <= lengthSegs; i++) {
    const z = zStart + i * zStep
    const r = fuselageRadiusAt(z) + radiusOffset
    for (let j = 0; j <= radialSegs; j++) {
      const a = angleStart + j * angStep
      // Arc in X-Y plane, axis along Z. theta=0 → +X (right side).
      positions.push(r * Math.cos(a), r * Math.sin(a), z)
    }
  }
  const cols = radialSegs + 1
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * cols + j
      const b = a + 1
      const c = a + cols + 1
      const d = a + cols
      indices.push(a, b, c, a, c, d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/* ===========================================================================
 * 3. PROCEDURAL TEXTURES (panel lines + rivets + registration)
 * ========================================================================= */

/**
 * Painted-aluminium panel texture: subtle base colour, circumferential + a few
 * longitudinal panel seams, and rows of rivets. Returns a CanvasTexture that
 * tiles around (u = circumference) and along (v = length) the fuselage.
 */
function makePanelTexture(baseColor: string, lineColor: string, rivet = true): THREE.CanvasTexture {
  const S = 1024
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  // base
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, S, S)
  // very subtle vertical gradient for paint depth
  const g = ctx.createLinearGradient(0, 0, 0, S)
  g.addColorStop(0, 'rgba(255,255,255,0.05)')
  g.addColorStop(0.5, 'rgba(0,0,0,0.03)')
  g.addColorStop(1, 'rgba(255,255,255,0.04)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)

  ctx.strokeStyle = lineColor
  ctx.lineWidth = 1.4
  // circumferential seams (rings) — horizontal canvas lines
  const rings = [0.12, 0.24, 0.38, 0.5, 0.62, 0.74, 0.88]
  for (const r of rings) {
    ctx.beginPath()
    ctx.moveTo(0, r * S)
    ctx.lineTo(S, r * S)
    ctx.stroke()
  }
  // longitudinal seams — vertical canvas lines (top + bottom + sides)
  const longs = [0.0, 0.25, 0.5, 0.75]
  for (const l of longs) {
    ctx.beginPath()
    ctx.moveTo(l * S, 0)
    ctx.lineTo(l * S, S)
    ctx.stroke()
  }
  // rivets along seams
  if (rivet) {
    ctx.fillStyle = lineColor
    for (const r of rings) {
      for (let x = 10; x < S; x += 22) {
        ctx.beginPath()
        ctx.arc(x, r * S, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    for (const l of longs) {
      for (let y = 14; y < S; y += 22) {
        ctx.beginPath()
        ctx.arc(l * S, y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/** Wing-surface panel texture: chordwise ribs + spanwise spars + rivets. */
function makeWingPanelTexture(baseColor: string, lineColor: string): THREE.CanvasTexture {
  const S = 1024
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, S, S)
  const g = ctx.createLinearGradient(0, 0, S, 0)
  g.addColorStop(0, 'rgba(255,255,255,0.06)')
  g.addColorStop(1, 'rgba(0,0,0,0.05)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 1.2
  // ribs (spanwise = vertical canvas lines)
  for (let x = 64; x < S; x += 96) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, S)
    ctx.stroke()
  }
  // spar (chordwise = horizontal canvas line)
  ctx.beginPath()
  ctx.moveTo(0, S * 0.3)
  ctx.lineTo(S, S * 0.3)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, S * 0.7)
  ctx.lineTo(S, S * 0.7)
  ctx.stroke()
  // rivets
  ctx.fillStyle = lineColor
  for (let x = 32; x < S; x += 96) {
    for (let y = 12; y < S; y += 28) {
      ctx.beginPath()
      ctx.arc(x, y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/** Registration number decal as a transparent canvas texture. */
function makeTextTexture(text: string, color = '#1a2a44'): THREE.CanvasTexture {
  const W = 512
  const H = 160
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = color
  ctx.font = 'bold 110px "Arial Black", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, W / 2, H / 2 + 6)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/* ===========================================================================
 * 4. PIN DEFINITIONS (20 educational pins)
 * ========================================================================= */

interface PinDef {
  number: number
  label: string
  desc: string
  color: string
  partIds: string[]
  position: [number, number, number] // target on skin
  labelPosition: [number, number, number] // badge in 3D
}

const PINS: PinDef[] = [
  { number: 1, label: 'Polished gold spinner', color: '#f4c542', partIds: ['spinner'], desc: 'A lathe-revolved polished-aluminium spinner, base radius matched exactly to the cowling nose so the two read as one continuous silhouette from any angle.', position: [0, 0, -2.62], labelPosition: [1.0, 0.75, -2.78] },
  { number: 2, label: 'Airfoil propeller blades', color: '#e88a3a', partIds: ['blade'], desc: 'Two lofted NACA-airfoil blades with root-to-tip chord taper and pitch twist (25° at the root → 12° at the tip), matching real constant-speed prop geometry. Spinning at ~36 rad/s with a motion-blur disc.', position: [0.5, 0.24, -2.5], labelPosition: [1.55, 1.0, -2.62] },
  { number: 3, label: 'Propeller hub & bolts', color: '#d4af37', partIds: ['hub'], desc: 'Polished-metal hub plate behind the spinner with six visible retaining bolts — the structural heart of the prop assembly.', position: [0, 0, -2.42], labelPosition: [-1.05, 0.6, -2.55] },
  { number: 4, label: 'Engine cowling', color: '#6fa8dc', partIds: ['cowling'], desc: 'Streamlined lathe-revolved cowling over the Lycoming O-320. Painted aluminium with panel lines and rivets, faired seamlessly into the spinner.', position: [0.3, 0.05, -2.05], labelPosition: [1.4, -0.45, -2.12] },
  { number: 5, label: 'Air intake & nose inlet', color: '#b0c4de', partIds: ['intake'], desc: 'Recessed chin intake on the cowling nose feeds ram air to the engine cylinders — a signature Cessna 172 feature.', position: [0, -0.26, -2.32], labelPosition: [0.95, -0.95, -2.32] },
  { number: 6, label: 'Exhaust stacks', color: '#8a6d3b', partIds: ['exhaust'], desc: 'Short steel exhaust pipes exiting the lower cowling side, one per cylinder bank. Heat-stained metal finish.', position: [0.34, -0.22, -1.72], labelPosition: [1.25, -0.7, -1.72] },
  { number: 7, label: 'Firewall bulkhead', color: '#c95d3a', partIds: ['firewall'], desc: 'The structural stainless-steel firewall separating the engine bay from the cabin — a critical crashworthiness barrier.', position: [0.32, 0.0, -1.6], labelPosition: [1.45, 0.35, -1.55] },
  { number: 8, label: 'Cabin door & window', color: '#d670a8', partIds: ['door'], desc: 'Pinned cabin door with framed window, exterior handle, and registration decal. The C172 door hinges forward for easy entry.', position: [0.48, 0.0, -0.2], labelPosition: [1.25, 0.55, -0.3] },
  { number: 9, label: 'Canopy glass', color: '#87ceeb', partIds: ['canopy'], desc: 'Real glass greenhouse using physical transmission (0.92), IOR 1.45, thickness 0.3 — light bends and refracts through it like real acrylic.', position: [0.22, 0.52, 0.0], labelPosition: [0.95, 1.18, -0.1] },
  { number: 10, label: 'Wing-root fairing', color: '#7cb342', partIds: ['fairing'], desc: 'A thick blended loft that fillets the wing into the fuselage skin — the wing emerges from the side rather than being bolted on.', position: [0.56, 0.2, 0.0], labelPosition: [1.18, 0.78, -0.2] },
  { number: 11, label: 'Wing dihedral', color: '#5c9ead', partIds: ['wing'], desc: 'A 5° upward angle from root to tip on each wing — provides roll stability. Baked into the loft stations as a y-offset.', position: [1.6, 0.3, 0.0], labelPosition: [1.95, 0.72, 0.45] },
  { number: 12, label: 'Hoerner wingtip', color: '#ff8c42', partIds: ['wingtip'], desc: 'Rounded, tapered tip with a drooped lower surface (Hoerner style) that reduces wingtip vortex drag — not a flat cut-off.', position: [2.32, 0.42, 0.0], labelPosition: [2.62, 0.98, 0.35] },
  { number: 13, label: 'Aileron (roll control)', color: '#9b59b6', partIds: ['aileron'], desc: 'Outboard hinged control surface for roll. Visible as a recessed hinge-gap line on the trailing edge of each wing.', position: [1.95, 0.06, 0.45], labelPosition: [2.35, -0.4, 0.6] },
  { number: 14, label: 'Flap (lift augmentation)', color: '#e74c3c', partIds: ['flap'], desc: 'Inboard hinged high-lift surface deployed on approach. Recessed hinge-gap line on the trailing edge near the root.', position: [0.95, 0.0, 0.55], labelPosition: [1.05, -0.5, 0.75] },
  { number: 15, label: 'Pitot tube', color: '#bdc3c7', partIds: ['pitot'], desc: 'A thin L-shaped tube on the left wing leading edge — senses ram air pressure for the airspeed indicator.', position: [-0.52, 0.05, -0.78], labelPosition: [-1.35, 0.55, -0.9] },
  { number: 16, label: 'Fuel filler cap', color: '#f1c40f', partIds: ['fuelcap'], desc: 'Flush fuel filler cap on the wing upper surface, leading to the wing tank. One per wing.', position: [0.72, 0.23, -0.32], labelPosition: [1.35, 0.6, -0.42] },
  { number: 17, label: 'Wing lift strut', color: '#95a5a6', partIds: ['strut'], desc: 'Streamlined lift strut from the lower fuselage to the mid-wing — a classic Cessna high-wing hallmark that carries flight loads.', position: [1.0, -0.18, 0.02], labelPosition: [1.55, -0.6, 0.25] },
  { number: 18, label: 'Main wheel & tire', color: '#2c3e50', partIds: ['wheel'], desc: 'Black rubber tire (roughness 0.9) on a polished metal hub, axle along X so it rolls along the direction of travel (±Z).', position: [1.05, -0.95, 0.15], labelPosition: [1.75, -1.25, 0.55] },
  { number: 19, label: 'Wheel pant (fairing)', color: '#ecf0f1', partIds: ['pant'], desc: 'Streamlined half-lathe fairing covering the upper half of the wheel, cutting drag. Strut terminates into a belly fairing — no clipping.', position: [1.18, -0.78, 0.15], labelPosition: [1.9, -0.85, 0.42] },
  { number: 20, label: 'Empennage (tail)', color: '#3498db', partIds: ['empennage'], desc: 'Tapered tail boom carrying the vertical stabilizer (rudder) and horizontal stabilizer (elevator) — provides pitch and yaw control.', position: [0.22, 0.52, 2.25], labelPosition: [1.05, 1.05, 2.45] },
]

/* ===========================================================================
 * 5. HIGHLIGHT SYSTEM (in-canvas context + glowing material)
 * ========================================================================= */

interface PinCtxValue {
  active: number | null
  pins: PinDef[]
}
const PinCtx = createContext<PinCtxValue>({ active: null, pins: PINS })

interface MatConfig {
  color: string
  metalness?: number
  roughness?: number
  clearcoat?: number
  clearcoatRoughness?: number
  map?: THREE.Texture | null
}

/**
 * Create a MeshPhysicalMaterial whose emissiveIntensity is animated each frame
 * toward 1 when the active pin's partIds intersect this mesh's partIds. The
 * glow colour is the active pin's colour, so each part lights up in the colour
 * of the pin that describes it.
 */
function useGlowingMaterial(
  config: MatConfig,
  partIds: string[],
  side: THREE.Side = THREE.DoubleSide
): THREE.MeshPhysicalMaterial {
  const { active, pins } = useContext(PinCtx)
  // Lazy useState creates the material exactly once; mutating its props each
  // frame (standard R3F practice) doesn't trip the immutability rule because
  // it's not a useMemo return value.
  const [mat] = useState(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(config.color),
        metalness: config.metalness ?? 0,
        roughness: config.roughness ?? 1,
        clearcoat: config.clearcoat ?? 0,
        clearcoatRoughness: config.clearcoatRoughness ?? 0,
        map: config.map ?? null,
        side,
        emissive: new THREE.Color('#000000'),
        emissiveIntensity: 0,
      })
  )
  const cur = useRef(0)
  useFrame((_, dt) => {
    const ap = pins.find((p) => p.number === active)
    const want =
      ap && ap.partIds.some((id) => partIds.includes(id)) ? 1 : 0
    const k = 1 - Math.exp(-dt * 9)
    cur.current += (want - cur.current) * k
    // Per-frame material property mutation is the idiomatic R3F pattern for
    // cheap animated shader params; the immutability lint rule is bypassed
    // because this is a render-loop side-effect, not a React state update.
    if (ap && want > 0.001) mat.emissive.set(ap.color)
    // eslint-disable-next-line react-hooks/immutability
    mat.emissiveIntensity = cur.current * 0.9
  })
  return mat
}

/* ===========================================================================
 * 6. MATERIAL CONFIGS (module scope for stable refs)
 * ========================================================================= */

const BODY_CFG: MatConfig = { color: '#f1ede2', metalness: 0.3, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 }
const BLUE_CFG: MatConfig = { color: '#1f5fa6', metalness: 0.35, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2 }
const GOLD_CFG: MatConfig = { color: '#e9b73c', metalness: 0.95, roughness: 0.05, clearcoat: 0.4, clearcoatRoughness: 0.08 }
const HUB_CFG: MatConfig = { color: '#d6dade', metalness: 0.9, roughness: 0.2, clearcoat: 0.3 }
const TIRE_CFG: MatConfig = { color: '#15151a', metalness: 0, roughness: 0.9 }
const GLASS_CFG: MatConfig = { color: '#bcd8ee', metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05 }
const DARK_METAL_CFG: MatConfig = { color: '#3a3d42', metalness: 0.85, roughness: 0.35 }
const STAINLESS_CFG: MatConfig = { color: '#c8ccd0', metalness: 0.9, roughness: 0.3 }
const EXHAUST_CFG: MatConfig = { color: '#6b5a3a', metalness: 0.7, roughness: 0.6 }

/* ===========================================================================
 * 7. GEOMETRY FACTORY (all airframe geometry, memoised)
 * ========================================================================= */

function useAircraftGeometry() {
  return useMemo(() => {
    const DEG = Math.PI / 180

    // Fuselage
    const fuselage = new THREE.LatheGeometry(makeFuselageProfile(), LATHE_SEGMENTS)
    fuselage.computeVertexNormals()

    // Spinner
    const spinner = new THREE.LatheGeometry(makeSpinnerProfile(), LATHE_SEGMENTS)
    spinner.computeVertexNormals()

    // Wing (right half) with dihedral + Hoerner tip
    const dihedral = Math.tan(5 * DEG)
    const wingRootX = 0.47
    const wingBaseY = 0.1
    const wingStations: AirfoilStation[] = [
      { span: wingRootX, y: wingBaseY, z: 0, chord: 1.55, thickness: 0.15, camber: 0.035, camberPos: 0.4, twist: 2.5 * DEG },
      { span: 0.85, y: wingBaseY + dihedral * (0.85 - wingRootX), z: 0, chord: 1.42, thickness: 0.135, camber: 0.032, camberPos: 0.4, twist: 2.0 * DEG },
      { span: 1.3, y: wingBaseY + dihedral * (1.3 - wingRootX), z: 0, chord: 1.28, thickness: 0.12, camber: 0.03, camberPos: 0.4, twist: 1.5 * DEG },
      { span: 1.75, y: wingBaseY + dihedral * (1.75 - wingRootX), z: 0, chord: 1.12, thickness: 0.105, camber: 0.028, camberPos: 0.4, twist: 1.0 * DEG },
      { span: 2.1, y: wingBaseY + dihedral * (2.1 - wingRootX), z: 0, chord: 0.95, thickness: 0.09, camber: 0.025, camberPos: 0.4, twist: 0.5 * DEG },
      { span: 2.35, y: wingBaseY + dihedral * (2.35 - wingRootX), z: 0, chord: 0.66, thickness: 0.07, camber: 0.02, camberPos: 0.4, twist: 0, teDroop: 0.08 },
    ]
    const wingRight = loftAirfoil(wingStations)
    const wingLeft = mirrorGeometryX(wingRight)

    // Wing-root fairing (blended loft). The outboard station extends PAST the
    // wing root (span 0.47 → 0.82) with chord/thickness matching the wing at
    // each span, so the fairing overlaps and blends into the wing with no lip
    // or step when viewed down the span. Inboard stations are thicker/longer-
    // chord to blend into the fuselage skin.
    const fairingStations: AirfoilStation[] = [
      { span: 0.40, y: wingBaseY, z: 0, chord: 1.72, thickness: 0.26, camber: 0.02, camberPos: 0.3, twist: 2.5 * DEG },
      { span: 0.47, y: wingBaseY, z: 0, chord: 1.55, thickness: 0.15, camber: 0.035, camberPos: 0.4, twist: 2.5 * DEG },
      { span: 0.55, y: wingBaseY + dihedral * (0.55 - wingRootX), z: 0, chord: 1.50, thickness: 0.14, camber: 0.033, camberPos: 0.4, twist: 2.3 * DEG },
      { span: 0.65, y: wingBaseY + dihedral * (0.65 - wingRootX), z: 0, chord: 1.42, thickness: 0.135, camber: 0.032, camberPos: 0.4, twist: 2.1 * DEG },
      { span: 0.78, y: wingBaseY + dihedral * (0.78 - wingRootX), z: 0, chord: 1.34, thickness: 0.125, camber: 0.03, camberPos: 0.4, twist: 1.8 * DEG },
      { span: 0.85, y: wingBaseY + dihedral * (0.85 - wingRootX), z: 0, chord: 1.42, thickness: 0.135, camber: 0.032, camberPos: 0.4, twist: 2.0 * DEG },
    ]
    const fairingRight = loftAirfoil(fairingStations)
    const fairingLeft = mirrorGeometryX(fairingRight)

    // Propeller blade (taper + twist). Slightly exaggerated taper/thickness
    // spread for better legibility at small screen size while spinning.
    const bladeStations: AirfoilStation[] = [
      { span: 0.06, y: 0, z: 0, chord: 0.19, thickness: 0.11, camber: 0.028, camberPos: 0.4, twist: 28 * DEG },
      { span: 0.3, y: 0, z: 0, chord: 0.16, thickness: 0.09, camber: 0.024, camberPos: 0.4, twist: 22 * DEG },
      { span: 0.55, y: 0, z: 0, chord: 0.12, thickness: 0.065, camber: 0.018, camberPos: 0.4, twist: 15 * DEG },
      { span: 0.72, y: 0, z: 0, chord: 0.08, thickness: 0.045, camber: 0.014, camberPos: 0.4, twist: 10 * DEG },
    ]
    const blade = loftAirfoil(bladeStations, 28)

    // Horizontal stabilizer (dihedral)
    const hDihedral = Math.tan(8 * DEG)
    const hStations: AirfoilStation[] = [
      { span: 0.14, y: -0.05, z: 2.18, chord: 0.6, thickness: 0.09, camber: 0.02, camberPos: 0.4, twist: 0 },
      { span: 0.5, y: -0.05 + hDihedral * (0.5 - 0.14), z: 2.18, chord: 0.52, thickness: 0.08, camber: 0.02, camberPos: 0.4, twist: 0 },
      { span: 0.82, y: -0.05 + hDihedral * (0.82 - 0.14), z: 2.18, chord: 0.42, thickness: 0.065, camber: 0.018, camberPos: 0.4, twist: 0 },
    ]
    const hstabRight = loftAirfoil(hStations)
    const hstabLeft = mirrorGeometryX(hstabRight)

    // Vertical stabilizer (built along X, rotated to vertical)
    const vStations: AirfoilStation[] = [
      { span: 0.1, y: 0, z: 2.28, chord: 0.72, thickness: 0.1, camber: 0.025, camberPos: 0.4, twist: 0 },
      { span: 0.4, y: 0, z: 2.32, chord: 0.62, thickness: 0.085, camber: 0.022, camberPos: 0.4, twist: 0 },
      { span: 0.78, y: 0, z: 2.4, chord: 0.5, thickness: 0.065, camber: 0.018, camberPos: 0.4, twist: 0 },
    ]
    const vstab = loftAirfoil(vStations)

    // Canopy glass
    const canopy = loftCanopy([
      { z: -0.52, w: 0.24, h: 0.1, y: 0.34 },
      { z: -0.32, w: 0.32, h: 0.2, y: 0.32 },
      { z: -0.1, w: 0.34, h: 0.28, y: 0.3 },
      { z: 0.1, w: 0.34, h: 0.3, y: 0.3 },
      { z: 0.3, w: 0.32, h: 0.24, y: 0.31 },
      { z: 0.48, w: 0.26, h: 0.14, y: 0.33 },
    ])

    // Wheel pants (half-lathe)
    const pantProto = new THREE.LatheGeometry(
      makeWheelPantProfile(),
      LATHE_SEGMENTS,
      Math.PI,
      Math.PI
    )
    pantProto.computeVertexNormals()

    // Wheels (axle along X)
    const wheelMain = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 32)
    const wheelNose = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 28)

    return {
      fuselage,
      spinner,
      wingRight,
      wingLeft,
      fairingRight,
      fairingLeft,
      blade,
      hstabRight,
      hstabLeft,
      vstab,
      canopy,
      pantProto,
      wheelMain,
      wheelNose,
    }
  }, [])
}

/* ===========================================================================
 * 8. SMALL REUSABLE PARTS
 * ========================================================================= */

function Strut({
  from,
  to,
  radius = 0.026,
  material,
}: {
  from: [number, number, number]
  to: [number, number, number]
  radius?: number
  material: THREE.Material
}) {
  const { geo, pos, quat } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()
    const g = new THREE.CylinderGeometry(radius, radius * 0.82, len, 14)
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    )
    return { geo: g, pos: mid, quat: q }
  }, [from, to, radius])
  return (
    <mesh geometry={geo} position={pos} quaternion={quat} material={material} castShadow />
  )
}

function FairingBlob({
  position,
  rx = 0.12,
  ry = 0.08,
  rz = 0.16,
  material,
}: {
  position: [number, number, number]
  rx?: number
  ry?: number
  rz?: number
  material: THREE.Material
}) {
  const geo = useMemo(
    () => new THREE.SphereGeometry(1, 22, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    []
  )
  return (
    <mesh
      geometry={geo}
      position={position}
      scale={[rx, ry, rz]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      castShadow
      receiveShadow
    />
  )
}

/**
 * Streamlined teardrop fairing for a strut junction. A LatheGeometry revolved
 * from makeStrutFairingProfile (near-zero radius at both ends → max girth
 * mid-length), then oriented so its long (Y) axis lines up with the strut's
 * `from → to` direction vector — same quaternion-alignment approach `Strut()`
 * uses (setFromUnitVectors). The mesh is centred at the midpoint of from/to
 * by default, or at `at` if provided.
 *
 * This replaces raw sphere/hemisphere caps that read as "balls on rods".
 */
function TeardropFairing({
  from,
  to,
  at,
  maxR = 0.05,
  len = 0.22,
  material,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  from: [number, number, number]
  to: [number, number, number]
  at?: [number, number, number] // override position (defaults to midpoint)
  maxR?: number
  len?: number
  material: THREE.Material
  onPointerOver?: (e: any) => void
  onPointerOut?: () => void
  onClick?: (e: any) => void
}) {
  const { geo, pos, quat } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = new THREE.Vector3().subVectors(b, a).normalize()
    const g = new THREE.LatheGeometry(makeStrutFairingProfile(maxR, len), 24)
    g.computeVertexNormals()
    const centre = at ? new THREE.Vector3(...at) : new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir
    )
    return { geo: g, pos: centre, quat: q }
  }, [from, to, at, maxR, len])
  return (
    <mesh
      geometry={geo}
      position={pos}
      quaternion={quat}
      material={material}
      castShadow
      receiveShadow
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    />
  )
}

/* ===========================================================================
 * 9. PROPELLER ASSEMBLY (spins about Z)
 * ========================================================================= */

function Propeller({
  geo,
  position,
  onHover,
  onLeave,
  onClick,
}: {
  geo: ReturnType<typeof useAircraftGeometry>
  position: [number, number, number]
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const group = useRef<THREE.Group>(null)
  const spinnerMat = useGlowingMaterial(GOLD_CFG, ['spinner'])
  const hubMat = useGlowingMaterial(HUB_CFG, ['hub'])
  // Blade material: resilient to viewing angle. Lower metalness so it's not
  // purely reflection-dependent, higher base saturation, and a small always-on
  // emissive tint so the blade never crushes to flat brown regardless of
  // rotation or camera angle.
  const bladeMat = useGlowingMaterial(
    { color: '#e8a830', metalness: 0.6, roughness: 0.25, clearcoat: 0.4, clearcoatRoughness: 0.15 },
    ['blade']
  )
  // Tip stripe materials (yellow + black, standard GA propeller detailing)
  const tipYellowMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#f4d020', metalness: 0.3, roughness: 0.4, emissive: '#3a2c00', emissiveIntensity: 0.15 }),
    []
  )
  const tipBlackMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1a1e', metalness: 0.4, roughness: 0.5 }),
    []
  )

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z -= delta * 36
  })

  // Two blades, 180° apart (Cessna 172 standard 2-blade prop).
  const blades = [0, Math.PI]

  return (
    <group ref={group} position={position}>
      <mesh
        geometry={geo.spinner}
        material={spinnerMat}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(1) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(1) }}
      />
      {/* hub plate */}
      <mesh
        position={[0, 0, 0.04]}
        rotation={[Math.PI / 2, 0, 0]}
        material={hubMat}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(3) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(3) }}
      >
        <cylinderGeometry args={[0.085, 0.085, 0.022, 28]} />
      </mesh>
      {/* six hub bolts */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.06, Math.sin(a) * 0.06, 0.052]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.008, 0.008, 0.012, 8]} />
            <meshStandardMaterial color="#2a2a2e" metalness={0.6} roughness={0.4} />
          </mesh>
        )
      })}
      {/* Two lofted airfoil blades with yellow-and-black tip stripes.
          The stripes break up the flat-color look and help the silhouette
          read at small screen size / while spinning. */}
      {blades.map((ang, i) => (
        <group key={i} rotation={[0, 0, ang]}>
          <mesh
            geometry={geo.blade}
            material={bladeMat}
            castShadow
            onPointerOver={(e) => { e.stopPropagation(); onHover(2) }}
            onPointerOut={() => onLeave()}
            onClick={(e) => { e.stopPropagation(); onClick(2) }}
          />
          {/* Yellow tip stripe — a thin box near the blade tip (span ~0.68) */}
          <mesh position={[0.68, 0, 0]} material={tipYellowMat} castShadow>
            <boxGeometry args={[0.06, 0.008, 0.1]} />
          </mesh>
          {/* Black tip cap beyond the yellow */}
          <mesh position={[0.72, 0, 0]} material={tipBlackMat} castShadow>
            <boxGeometry args={[0.03, 0.006, 0.08]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ===========================================================================
 * 10. COWLING DETAILS (intake, exhaust, cowl flaps)
 * ========================================================================= */

function CowlingDetails({
  onHover,
  onLeave,
  onClick,
}: {
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const cowlingMat = useGlowingMaterial(BODY_CFG, ['cowling'])
  const intakeMat = useGlowingMaterial(DARK_METAL_CFG, ['intake'])
  const exhaustMat = useGlowingMaterial(EXHAUST_CFG, ['exhaust'])

  return (
    <group>
      {/* chin air intake — a recessed box on the lower cowling nose */}
      <mesh
        position={[0, -0.24, -2.18]}
        rotation={[0.18, 0, 0]}
        material={intakeMat}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(5) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(5) }}
      >
        <boxGeometry args={[0.22, 0.14, 0.3]} />
      </mesh>
      {/* intake lip ring */}
      <mesh position={[0, -0.24, -2.04]} rotation={[0.18, 0, 0]}>
        <torusGeometry args={[0.12, 0.018, 10, 24]} />
        <meshStandardMaterial color="#1f2024" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* exhaust pipes — two short cylinders on the lower cowling sides */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.3, -0.2, -1.72]}
          rotation={[0, 0, Math.PI / 2]}
          material={exhaustMat}
          castShadow
          onPointerOver={(e) => { e.stopPropagation(); onHover(6) }}
          onPointerOut={() => onLeave()}
          onClick={(e) => { e.stopPropagation(); onClick(6) }}
        >
          <cylinderGeometry args={[0.022, 0.026, 0.16, 16]} />
        </mesh>
      ))}

      {/* cowl flaps — thin hinged strips at the lower rear of cowling */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.18, -0.27, -1.66]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.22, 0.012, 0.12]} />
          <meshStandardMaterial color="#d8d4c8" metalness={0.3} roughness={0.4} clearcoat={0.5} />
        </mesh>
      ))}

      {/* cowling nose ring accent (subtle) */}
      <mesh position={[0, 0, -2.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.182, 0.006, 10, 48]} />
        <meshStandardMaterial color="#9a958a" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

/* ===========================================================================
 * 11. CABIN DOOR, WINDOW, REGISTRATION
 * ========================================================================= */

function CabinDetails({
  onHover,
  onLeave,
  onClick,
}: {
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const doorMat = useGlowingMaterial(BODY_CFG, ['door'])
  const frameMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#141c2e', metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide }),
    []
  )
  const chromeTrimMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#d4d8dc', metalness: 0.9, roughness: 0.15, side: THREE.DoubleSide }),
    []
  )
  const gapMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0a0a0c', roughness: 0.9, side: THREE.DoubleSide }),
    []
  )
  const glassMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#bcd8ee', transmission: 0.85, ior: 1.45, thickness: 0.2, roughness: 0.05, transparent: true, side: THREE.DoubleSide }),
    []
  )
  const regTex = useMemo(() => makeTextTexture('N172SP', '#1a2a44'), [])

  // Door geometry: conforms to the fuselage's true compound-curve radius at
  // every z along the door's length, so it sits flush — no proud edge.
  const doorZ = -0.18
  const doorLen = 0.64
  const doorArc = 1.0          // ~57° of arc
  const doorCen = -0.05        // arc centre (slightly below equator, right side)
  const ts = doorCen - doorArc / 2
  const zStart = doorZ - doorLen / 2
  const zEnd = doorZ + doorLen / 2

  // Build conforming geometries (memoised — radius varies along z so these
  // can't be a single constant-radius cylinder).
  const seamGeo = useMemo(
    () => buildConformingArcPanel(zStart - 0.015, zEnd + 0.015, ts - 0.02, ts + doorArc + 0.02, 0.004, 28, 16),
    [zStart, zEnd, ts, doorArc]
  )
  const doorSkinGeo = useMemo(
    () => buildConformingArcPanel(zStart, zEnd, ts, ts + doorArc, 0.0, 28, 16),
    [zStart, zEnd, ts, doorArc]
  )
  // Trim edges: thin arcs at the top/bottom angle extremes, conforming along z
  const trimTopGeo = useMemo(
    () => buildConformingArcPanel(zStart + 0.01, zEnd - 0.01, ts + doorArc - 0.025, ts + doorArc + 0.005, 0.006, 6, 14),
    [zStart, zEnd, ts, doorArc]
  )
  const trimBotGeo = useMemo(
    () => buildConformingArcPanel(zStart + 0.01, zEnd - 0.01, ts - 0.005, ts + 0.025, 0.006, 6, 14),
    [zStart, zEnd, ts, doorArc]
  )
  // Rear + front edges: thin arcs at fixed z, spanning the door's angle
  const trimRearGeo = useMemo(
    () => buildConformingArcPanel(zEnd - 0.01, zEnd + 0.01, ts - 0.01, ts + doorArc + 0.01, 0.006, 28, 2),
    [zEnd, ts, doorArc]
  )
  const trimFrontGeo = useMemo(
    () => buildConformingArcPanel(zStart - 0.01, zStart + 0.01, ts - 0.01, ts + doorArc + 0.01, 0.004, 28, 2),
    [zStart, ts, doorArc]
  )
  // Window frame + glass (conforming, upper portion of door)
  const winFrameGeo = useMemo(
    () => buildConformingArcPanel(zStart + 0.1, zEnd - 0.1, doorCen - 0.17, doorCen + 0.17, 0.008, 24, 10),
    [zStart, zEnd, doorCen]
  )
  const winGlassGeo = useMemo(
    () => buildConformingArcPanel(zStart + 0.12, zEnd - 0.12, doorCen - 0.15, doorCen + 0.15, 0.002, 22, 10),
    [zStart, zEnd, doorCen]
  )

  // Door handle position: compute true radius at the handle's z for proper offset
  const handleZ = doorZ + 0.2
  const handleR = fuselageRadiusAt(handleZ)
  const handleX = handleR * Math.cos(doorCen + doorArc / 2 - 0.12)
  const handleY = handleR * Math.sin(doorCen + doorArc / 2 - 0.12)

  // Registration decal position on the door (conforming radius)
  const decalZ = doorZ - 0.05
  const decalR = fuselageRadiusAt(decalZ)
  const decalAng = doorCen + 0.02
  const decalX = decalR * Math.cos(decalAng)
  const decalY = decalR * Math.sin(decalAng)

  return (
    <group>
      {/* Dark seam channel — hairline (only 0.004 proud, slightly wider arc/z).
          Sits behind the door skin so it peeks out as a thin seam line. */}
      <mesh geometry={seamGeo} material={gapMat} castShadow />

      {/* Door skin — conforms to true fuselage radius at every z (flush) */}
      <mesh
        geometry={doorSkinGeo}
        material={doorMat}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(8) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(8) }}
      />

      {/* Chrome trim: top + bottom edges (along z), rear + front edges (along arc) */}
      <mesh geometry={trimTopGeo} material={chromeTrimMat} castShadow />
      <mesh geometry={trimBotGeo} material={chromeTrimMat} castShadow />
      <mesh geometry={trimRearGeo} material={chromeTrimMat} castShadow />
      {/* Front hinge edge (dark) */}
      <mesh geometry={trimFrontGeo} material={frameMat} castShadow />

      {/* Window frame + glass (conforming to curve) */}
      <mesh geometry={winFrameGeo} material={frameMat} castShadow />
      <mesh geometry={winGlassGeo} material={glassMat} />

      {/* Door handle — positioned at the true conforming radius */}
      <group position={[handleX, handleY, handleZ]}>
        <mesh material={chromeTrimMat} castShadow>
          <boxGeometry args={[0.04, 0.05, 0.03]} />
        </mesh>
        <mesh position={[0.035, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={chromeTrimMat} castShadow>
          <cylinderGeometry args={[0.013, 0.013, 0.07, 14]} />
        </mesh>
      </group>

      {/* Registration decal on the door (at true conforming radius) */}
      <mesh position={[decalX, decalY, decalZ]} rotation={[0, -Math.PI / 2 + decalAng, 0]}>
        <planeGeometry args={[0.38, 0.11]} />
        <meshBasicMaterial map={regTex} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Registration on the tail boom (both sides) */}
      <mesh position={[0.19, 0.14, 1.6]} rotation={[0, -Math.PI / 2.1, 0]}>
        <planeGeometry args={[0.46, 0.14]} />
        <meshBasicMaterial map={regTex} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.19, 0.14, 1.6]} rotation={[0, Math.PI / 2.1, 0]}>
        <planeGeometry args={[0.46, 0.14]} />
        <meshBasicMaterial map={regTex} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ===========================================================================
 * 12. WING DETAILS (pitot, fuel caps, nav lights, hinge gaps, tie-downs)
 * ========================================================================= */

function WingDetails({
  onHover,
  onLeave,
  onClick,
}: {
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const pitotMat = useGlowingMaterial(STAINLESS_CFG, ['pitot'])
  const fuelcapMat = useGlowingMaterial(HUB_CFG, ['fuelcap'])
  const aileronMat = useGlowingMaterial(BLUE_CFG, ['aileron'])
  const flapMat = useGlowingMaterial(BLUE_CFG, ['flap'])
  const strutMat = useGlowingMaterial(BODY_CFG, ['strut'])
  const wingtipMat = useGlowingMaterial(BLUE_CFG, ['wingtip'])

  return (
    <group>
      {/* ---- Pitot tube (left wing LE) ---- */}
      <group
        onPointerOver={(e) => { e.stopPropagation(); onHover(15) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(15) }}
      >
        <mesh position={[-0.52, 0.05, -0.78]} rotation={[0, 0, Math.PI / 2]} material={pitotMat} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 12]} />
        </mesh>
        <mesh position={[-0.58, 0.05, -0.78]} material={pitotMat} castShadow>
          <sphereGeometry args={[0.014, 12, 10]} />
        </mesh>
      </group>

      {/* ---- Fuel caps (both wings) ---- */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.72, 0.235, -0.32]}
          material={fuelcapMat}
          castShadow
          onPointerOver={(e) => { e.stopPropagation(); onHover(16) }}
          onPointerOut={() => onLeave()}
          onClick={(e) => { e.stopPropagation(); onClick(16) }}
        >
          <cylinderGeometry args={[0.045, 0.045, 0.02, 18]} />
        </mesh>
      ))}

      {/* ---- Nav lights: red (right), green (left) ---- */}
      <mesh position={[2.37, 0.31, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#ff3030" emissive="#ff0000" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh position={[-2.37, 0.31, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#30ff60" emissive="#00ff00" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>

      {/* ---- Wingtip highlight surface (for pin 12) ---- */}
      <mesh
        position={[2.25, 0.4, 0]}
        material={wingtipMat}
        visible={false}
        onPointerOver={(e) => { e.stopPropagation(); onHover(12) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(12) }}
      >
        <sphereGeometry args={[0.12, 8, 8]} />
      </mesh>

      {/* ---- Control-surface pickers (invisible, for pin highlights only) ---- */}
      {/* aileron (outboard TE, both wings) */}
      {[1, -1].map((s) => (
        <mesh
          key={`ail-${s}`}
          position={[s * 1.95, 0.18, 0.74]}
          material={aileronMat}
          visible={false}
          onPointerOver={(e) => { e.stopPropagation(); onHover(13) }}
          onPointerOut={() => onLeave()}
          onClick={(e) => { e.stopPropagation(); onClick(13) }}
        >
          <boxGeometry args={[0.5, 0.02, 0.02]} />
        </mesh>
      ))}
      {/* flap (inboard TE, both wings) */}
      {[1, -1].map((s) => (
        <mesh
          key={`flap-${s}`}
          position={[s * 0.95, 0.12, 0.78]}
          material={flapMat}
          visible={false}
          onPointerOver={(e) => { e.stopPropagation(); onHover(14) }}
          onPointerOut={() => onLeave()}
          onClick={(e) => { e.stopPropagation(); onClick(14) }}
        >
          <boxGeometry args={[0.45, 0.02, 0.02]} />
        </mesh>
      ))}

      {/* ---- Lift struts (both wings) — connect fuselage side to wing underside ---- */}
      <Strut from={[0.45, -0.34, 0.05]} to={[1.5, 0.10, 0.05]} radius={0.024} material={strutMat} />
      <Strut from={[-0.45, -0.34, 0.05]} to={[-1.5, 0.10, 0.05]} radius={0.024} material={strutMat} />
      {/* strut-to-wing junction: streamlined teardrop fairing aligned to the
          strut direction, sitting at the wing end. Replaces the raw sphere
          that read as a "ball on a rod". Keeps the strut hotspot (pin 17). */}
      {([1, -1] as const).map((s) => (
        <TeardropFairing
          key={`sw-${s}`}
          from={[s * 0.45, -0.34, 0.05]}
          to={[s * 1.5, 0.10, 0.05]}
          at={[s * 1.5, 0.10, 0.05]}
          maxR={0.045}
          len={0.2}
          material={strutMat}
          onPointerOver={(e) => { e.stopPropagation(); onHover(17) }}
          onPointerOut={() => onLeave()}
          onClick={(e) => { e.stopPropagation(); onClick(17) }}
        />
      ))}
      {/* strut-to-fuselage junction: teardrop fairing at the fuselage end,
          oriented along the strut. Replaces the FairingBlob hemisphere. */}
      {([1, -1] as const).map((s) => (
        <TeardropFairing
          key={`sf-${s}`}
          from={[s * 0.45, -0.34, 0.05]}
          to={[s * 1.5, 0.10, 0.05]}
          at={[s * 0.45, -0.34, 0.05]}
          maxR={0.05}
          len={0.22}
          material={strutMat}
          onPointerOver={(e) => { e.stopPropagation(); onHover(17) }}
          onPointerOut={() => onLeave()}
          onClick={(e) => { e.stopPropagation(); onClick(17) }}
        />
      ))}

      {/* ---- Tie-down rings (wing LE root, both sides) ---- */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.5, 0.08, -0.78]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.022, 0.006, 8, 16]} />
          <meshStandardMaterial color="#b8bcc0" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}

      {/* ---- Dihedral indicator (invisible picker for pin 11) ---- */}
      <mesh
        position={[1.6, 0.3, 0]}
        material={useGlowingMaterial(BLUE_CFG, ['wing'])}
        visible={false}
        onPointerOver={(e) => { e.stopPropagation(); onHover(11) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(11) }}
      >
        <boxGeometry args={[0.4, 0.2, 0.2]} />
      </mesh>
    </group>
  )
}

/* ===========================================================================
 * 13. EMPENNAGE DETAILS (hinge gaps, dorsal fin, tail light)
 * ========================================================================= */

function EmpennageDetails({
  onHover,
  onLeave,
  onClick,
}: {
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const empMat = useGlowingMaterial(BLUE_CFG, ['empennage'])
  const bodyMat = useGlowingMaterial(BODY_CFG, ['empennage'])
  return (
    <group>
      {/* Dorsal fin fillet — blends the vertical stabilizer root into the
          tail boom so it doesn't read as a separate block. */}
      <FairingBlob position={[0, 0.16, 2.05]} rx={0.09} ry={0.12} rz={0.2} material={bodyMat} />
      <FairingBlob position={[0, 0.24, 2.15]} rx={0.08} ry={0.2} rz={0.24} material={bodyMat} />
      <FairingBlob position={[0, 0.34, 2.27]} rx={0.06} ry={0.24} rz={0.24} material={bodyMat} />
      <FairingBlob position={[0, 0.44, 2.4]} rx={0.05} ry={0.2} rz={0.22} material={empMat} />

      {/* empennage picker */}
      <mesh
        position={[0.2, 0.5, 2.3]}
        material={empMat}
        visible={false}
        onPointerOver={(e) => { e.stopPropagation(); onHover(20) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(20) }}
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
      </mesh>

      {/* tail nav light (white) */}
      <mesh position={[0, 0.82, 2.62]}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
      {/* tail tie-down */}
      <mesh position={[0, 0.06, 2.62]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.02, 0.005, 8, 16]} />
        <meshStandardMaterial color="#b8bcc0" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ===========================================================================
 * 14. ROOF ANTENNA + BEACON
 * ========================================================================= */

function RoofDetails() {
  return (
    <group>
      {/* com antenna on the roof */}
      <mesh position={[0, 0.62, 0.6]} rotation={[0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0.58]} castShadow>
        <boxGeometry args={[0.05, 0.02, 0.08]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* anti-collision beacon on the vertical fin top */}
      <mesh position={[0, 0.86, 2.5]}>
        <sphereGeometry args={[0.035, 14, 14]} />
        <meshStandardMaterial color="#ff3b30" emissive="#ff0000" emissiveIntensity={2.4} toneMapped={false} transparent opacity={0.95} />
      </mesh>
    </group>
  )
}

/* ===========================================================================
 * 15. LANDING GEAR (wheels, pants, struts, belly fairings, brakes)
 * ========================================================================= */

/** A single wheel assembly: tire + tread rings + hub cap + brake disc.
 *  Module-scope so it isn't recreated during render. */
/** A single wheel: torus tire (rounded shoulders) + sidewall discs + polished
 *  alloy hub dish + chrome centre cap + 5 lug nuts. The axle bar passes
 *  through the hub so the wheel reads as mounted. Module-scope. */
function WheelAssembly({
  pos,
  radius,
  width,
  side,
  tireMat,
  hubMat,
  onHover,
  onLeave,
  onClick,
}: {
  pos: [number, number, number]
  radius: number
  width: number
  side: number
  tireMat: THREE.Material
  hubMat: THREE.Material
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const wheelRot: [number, number, number] = [0, 0, Math.PI / 2]
  const R = radius
  const tireT = radius * 0.26
  const hubR = R - tireT - 0.005

  const sidewallMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#1c1c20', metalness: 0, roughness: 0.82 }),
    []
  )
  const treadMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#0a0a0d', metalness: 0, roughness: 0.92 }),
    []
  )
  const alloyMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#c6cace', metalness: 0.92, roughness: 0.16, clearcoat: 0.5 }),
    []
  )
  const chromeMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#eef0f2', metalness: 0.97, roughness: 0.08 }),
    []
  )

  return (
    <group>
      {/* Tire: torus for rounded shoulders */}
      <mesh
        position={pos}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        material={treadMat}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(18) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(18) }}
      >
        <torusGeometry args={[R - tireT, tireT, 20, 40]} />
      </mesh>
      {/* Sidewall discs */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          position={[pos[0] + s * (width / 2 - 0.003), pos[1], pos[2]]}
          rotation={wheelRot}
          material={sidewallMat}
          castShadow
        >
          <cylinderGeometry args={[R - tireT + 0.002, R - tireT + 0.002, 0.004, 36]} />
        </mesh>
      ))}
      {/* Tread band (flat contact patch) */}
      <mesh position={pos} rotation={wheelRot} material={treadMat} castShadow>
        <cylinderGeometry args={[R, R, width - 0.02, 40]} />
      </mesh>

      {/* Hub: alloy dish + recessed inner + chrome dome */}
      <mesh position={[pos[0] + side * (width / 2 + 0.002), pos[1], pos[2]]} rotation={wheelRot} material={alloyMat} castShadow>
        <cylinderGeometry args={[hubR, hubR, 0.014, 32]} />
      </mesh>
      <mesh position={[pos[0] + side * (width / 2 - 0.015), pos[1], pos[2]]} rotation={wheelRot} material={alloyMat} castShadow>
        <cylinderGeometry args={[hubR * 0.7, hubR * 0.7, 0.01, 28]} />
      </mesh>
      <mesh position={[pos[0] + side * (width / 2 + 0.012), pos[1], pos[2]]} rotation={[0, 0, (side * Math.PI) / 2]} material={chromeMat} castShadow>
        <sphereGeometry args={[0.038, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* 5 lug nuts */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 10
        return (
          <mesh key={i} position={[pos[0] + side * (width / 2 + 0.008), pos[1] + Math.cos(a) * (hubR * 0.62), pos[2] + Math.sin(a) * (hubR * 0.62)]} rotation={wheelRot} material={chromeMat} castShadow>
            <cylinderGeometry args={[0.011, 0.011, 0.012, 8]} />
          </mesh>
        )
      })}
      {/* Axle bar through the hub */}
      <mesh position={pos} rotation={wheelRot} castShadow>
        <cylinderGeometry args={[0.025, 0.025, width + 0.04, 16]} />
        <meshStandardMaterial color="#9a9da2" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  )
}

function LandingGear({
  mats,
  geo,
  onHover,
  onLeave,
  onClick,
}: {
  mats: { tire: THREE.Material; hub: THREE.Material; body: THREE.Material }
  geo: ReturnType<typeof useAircraftGeometry>
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const tireMat = useGlowingMaterial(TIRE_CFG, ['wheel'])
  const pantMat = useGlowingMaterial(BODY_CFG, ['pant'])
  const mainR: [number, number, number] = [1.05, -0.95, 0.15]
  const mainL: [number, number, number] = [-1.05, -0.95, 0.15]
  const nose: [number, number, number] = [0, -0.82, -1.55]
  // Pant: slim in the axle direction (X) so it reads as a streamlined half-
  // cover over the wheel top, not a squashed egg. Y is kept so the pant arcs
  // over the tyre; Z (fore/aft) is the pant's long streamlined direction.
  const pantScale: [number, number, number] = [0.42, 0.62, 0.92]
  // Wheel top = pos.y + radius. Strut ends at the axle via a fork.
  const mainWheelTop = mainR[1] + 0.22
  const noseWheelTop = nose[1] + 0.18
  // Main strut endpoints (used by both the Strut rod and the belly fairing).
  const mainStrutFrom: [number, number, number] = [0.5, -0.49, 0.15]
  const mainStrutToR: [number, number, number] = [mainR[0], mainWheelTop + 0.05, mainR[2]]
  const mainStrutToL: [number, number, number] = [mainL[0], mainWheelTop + 0.05, mainL[2]]
  const noseStrutFrom: [number, number, number] = [0, -0.44, -1.5]
  const noseStrutTo: [number, number, number] = [nose[0], noseWheelTop + 0.04, nose[2]]

  return (
    <group>
      {/* ---- Right main ---- */}
      {/* Belly fairing: streamlined teardrop oriented along the strut, sitting
          at the fuselage end. Its tail tapers down toward the wheel so the
          silhouette reads fuselage → fairing → strut → pant as one line. */}
      <TeardropFairing
        from={mainStrutFrom}
        to={mainStrutToR}
        at={[0.5, -0.49, 0.15]}
        maxR={0.07}
        len={0.26}
        material={mats.body}
        onPointerOver={(e) => { e.stopPropagation(); onHover(19) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(19) }}
      />
      {/* Oleo strut rod */}
      <Strut from={mainStrutFrom} to={mainStrutToR} radius={0.028} material={mats.hub} />
      {/* Axle fork: short vertical piston down to the hub */}
      <Strut from={mainStrutToR} to={[mainR[0], mainWheelTop, mainR[2]]} radius={0.02} material={mats.hub} />
      <WheelAssembly pos={mainR} radius={0.22} width={0.18} side={1} tireMat={tireMat} hubMat={mats.hub} onHover={onHover} onLeave={onLeave} onClick={onClick} />
      {/* Wheel pant — slim fairing over the top of the wheel */}
      <mesh geometry={geo.pantProto} position={[mainR[0], mainR[1] + 0.24, mainR[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={pantScale} material={pantMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(19) }} onPointerOut={() => onLeave()} onClick={(e) => { e.stopPropagation(); onClick(19) }} />

      {/* ---- Left main ---- */}
      <TeardropFairing
        from={mainStrutFrom}
        to={mainStrutToL}
        at={[-0.5, -0.49, 0.15]}
        maxR={0.07}
        len={0.26}
        material={mats.body}
        onPointerOver={(e) => { e.stopPropagation(); onHover(19) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(19) }}
      />
      <Strut from={[-0.5, -0.49, 0.15]} to={mainStrutToL} radius={0.028} material={mats.hub} />
      <Strut from={mainStrutToL} to={[mainL[0], mainWheelTop, mainL[2]]} radius={0.02} material={mats.hub} />
      <WheelAssembly pos={mainL} radius={0.22} width={0.18} side={-1} tireMat={tireMat} hubMat={mats.hub} onHover={onHover} onLeave={onLeave} onClick={onClick} />
      <mesh geometry={geo.pantProto} position={[mainL[0], mainL[1] + 0.24, mainL[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={pantScale} material={pantMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(19) }} onPointerOut={() => onLeave()} onClick={(e) => { e.stopPropagation(); onClick(19) }} />

      {/* ---- Nose gear ---- */}
      <TeardropFairing
        from={noseStrutFrom}
        to={noseStrutTo}
        at={noseStrutFrom}
        maxR={0.055}
        len={0.22}
        material={mats.body}
        onPointerOver={(e) => { e.stopPropagation(); onHover(19) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(19) }}
      />
      <Strut from={noseStrutFrom} to={noseStrutTo} radius={0.024} material={mats.hub} />
      <Strut from={noseStrutTo} to={[nose[0], noseWheelTop, nose[2]]} radius={0.018} material={mats.hub} />
      <WheelAssembly pos={nose} radius={0.18} width={0.15} side={1} tireMat={tireMat} hubMat={mats.hub} onHover={onHover} onLeave={onLeave} onClick={onClick} />
      <mesh geometry={geo.pantProto} position={[nose[0], nose[1] + 0.22, nose[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.38, 0.58, 0.85]} material={pantMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(19) }} onPointerOut={() => onLeave()} onClick={(e) => { e.stopPropagation(); onClick(19) }} />
    </group>
  )
}

/* ===========================================================================
 * 16. THE AIRFRAME
 * ========================================================================= */

function Airframe({
  onHover,
  onLeave,
  onClick,
}: {
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const G = useAircraftGeometry()

  // panel-line textures
  const bodyTex = useMemo(() => {
    const t = makePanelTexture('#f1ede2', 'rgba(60,55,45,0.32)')
    t.repeat.set(2, 1)
    return t
  }, [])
  const blueTex = useMemo(() => {
    const t = makeWingPanelTexture('#1f5fa6', 'rgba(8,20,45,0.45)')
    t.repeat.set(2, 1)
    return t
  }, [])

  const bodyTexCfg: MatConfig = useMemo(() => ({ ...BODY_CFG, map: bodyTex }), [bodyTex])
  const blueTexCfg: MatConfig = useMemo(() => ({ ...BLUE_CFG, map: blueTex }), [blueTex])

  const fuselageMat = useGlowingMaterial(bodyTexCfg, ['cowling', 'firewall'])
  const wingMat = useGlowingMaterial(blueTexCfg, ['wing', 'wingtip', 'aileron', 'flap', 'empennage'])
  const fairingMat = useGlowingMaterial(bodyTexCfg, ['fairing'])
  const glassMat = useGlowingMaterial(GLASS_CFG, ['canopy'])

  return (
    <group>
      {/* Fuselage */}
      <mesh
        geometry={G.fuselage}
        material={fuselageMat}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(4) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(4) }}
      />

      {/* Firewall accent ring */}
      <mesh position={[0, 0, -1.62]} rotation={[Math.PI / 2, 0, 0]} castShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(7) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(7) }}
      >
        <torusGeometry args={[0.36, 0.022, 12, 48]} />
        <meshStandardMaterial color="#1f5fa6" metalness={0.35} roughness={0.3} clearcoat={0.7} />
      </mesh>

      {/* Wings */}
      <mesh geometry={G.wingRight} material={wingMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(11) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(11) }}
      />
      <mesh geometry={G.wingLeft} material={wingMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(11) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(11) }}
      />

      {/* Wing-root fairings */}
      <mesh geometry={G.fairingRight} material={fairingMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(10) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(10) }}
      />
      <mesh geometry={G.fairingLeft} material={fairingMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(10) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(10) }}
      />

      {/* Empennage */}
      <mesh geometry={G.hstabRight} material={wingMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(20) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(20) }}
      />
      <mesh geometry={G.hstabLeft} material={wingMat} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(20) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(20) }}
      />
      <mesh geometry={G.vstab} material={wingMat} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(20) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(20) }}
      />

      {/* Canopy glass */}
      <mesh geometry={G.canopy} material={glassMat} castShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(9) }}
        onPointerOut={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onClick(9) }}
      />

      {/* Detail groups */}
      <CowlingDetails onHover={onHover} onLeave={onLeave} onClick={onClick} />
      <CabinDetails onHover={onHover} onLeave={onLeave} onClick={onClick} />
      <WingDetails onHover={onHover} onLeave={onLeave} onClick={onClick} />
      <EmpennageDetails onHover={onHover} onLeave={onLeave} onClick={onClick} />
      <RoofDetails />

      <Propeller geo={G} position={[0, 0, -2.55]} onHover={onHover} onLeave={onLeave} onClick={onClick} />

      {/* Static materials for landing gear */}
      <StaticLandingGear G={G} onHover={onHover} onLeave={onLeave} onClick={onClick} />
    </group>
  )
}

/** Landing gear using static (non-glowing) base materials + glowing overrides
 *  via the LandingGear component's own glowing materials. */
function StaticLandingGear({
  G,
  onHover,
  onLeave,
  onClick,
}: {
  G: ReturnType<typeof useAircraftGeometry>
  onHover: (n: number | null) => void
  onLeave: () => void
  onClick: (n: number) => void
}) {
  const tire = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#15151a', metalness: 0, roughness: 0.9 }), [])
  const hub = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#d6dade', metalness: 0.9, roughness: 0.2, clearcoat: 0.3 }), [])
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f1ede2', metalness: 0.3, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 }), [])
  return (
    <LandingGear mats={{ tire, hub, body }} geo={G} onHover={onHover} onLeave={onLeave} onClick={onClick} />
  )
}

/* ===========================================================================
 * 17. NUMBERED PIN (3D badge + leader line, interactive)
 * ========================================================================= */

export interface NumberedPinProps {
  number: number
  position: [number, number, number]
  labelPosition: [number, number, number]
  color?: string
  label?: string
  active?: boolean
  onHover?: (n: number | null) => void
  onLeave?: () => void
  onClick?: (n: number) => void
}

/** A clean, unobtrusive pin: a tiny dot on the skin at rest (no number, no
 *  badge, no persistent label). On hover/click a thin leader line + minimal
 *  label appear. Designed to be "less annoying" — the model stays clean. */
export function NumberedPin({
  number,
  position,
  labelPosition,
  color = '#f59e0b',
  label,
  active = false,
  onHover,
  onLeave,
  onClick,
}: NumberedPinProps) {
  return (
    <group>
      {/* Thin leader line — only when active */}
      {active && (
        <Line
          points={[labelPosition, position]}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      )}
      {/* Tiny dot on the skin — subtle at rest, slightly bigger when active */}
      <mesh
        position={position}
        onPointerOver={(e) => { e.stopPropagation(); onHover?.(number) }}
        onPointerOut={() => onLeave?.()}
        onClick={(e) => { e.stopPropagation(); onClick?.(number) }}
      >
        <sphereGeometry args={[active ? 0.028 : 0.014, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.2 : 0.3}
          roughness={0.4}
          transparent
          opacity={active ? 1 : 0.55}
          toneMapped={false}
        />
      </mesh>
      {/* Label only on hover/click — no permanent badge */}
      {active && label && (
        <Html position={labelPosition} center distanceFactor={8} zIndexRange={[40, 0]}>
          <div
            style={{
              whiteSpace: 'nowrap',
              fontSize: 11,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              color: '#fff',
              background: 'rgba(12,14,18,0.85)',
              padding: '4px 10px',
              borderRadius: 7,
              fontWeight: 600,
              border: `1px solid ${color}`,
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

/* ===========================================================================
 * 17b. HOLOGRAPHIC BLUEPRINT MODE + FLYING SHOWCASE MODE
 * ========================================================================= */

type ViewMode = 'photo' | 'blueprint' | 'flying'

/** GLSL for the hologram fill: fresnel rim glow + procedural grid + scan-line
 *  sweep + flicker + pin-boost. Boosted intensity for strong visibility. */
const HOLO_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * mvPos;
  }
`

const HOLO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uScanY;
  uniform float uFlicker;
  uniform float uPinBoost;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main() {
    // Fresnel rim — subtle, only at silhouette edges
    float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
    fresnel = pow(fresnel, 2.0);
    // Grid: fine + coarse, like a technical schematic
    vec2 g1 = abs(fract(vUv * 32.0) - 0.5);
    float minorLine = smoothstep(0.48, 0.5, max(g1.x, g1.y));
    vec2 g2 = abs(fract(vUv * 8.0) - 0.5);
    float majorLine = smoothstep(0.49, 0.5, max(g2.x, g2.y));
    // Scan-line sweep
    float scanDist = abs(vWorldPos.y - uScanY);
    float scan = smoothstep(0.35, 0.0, scanDist) * 0.6;
    // Restrained, structured intensity — dark, clean blueprint (not bright)
    float intensity = 0.04 + fresnel * 0.35 + minorLine * 0.08 + majorLine * 0.22 + scan * 0.3 + uPinBoost * 0.7;
    vec3 col = uColor * intensity;
    col += vec3(fresnel * 0.1 + scan * 0.08 + uPinBoost * 0.2);
    float alpha = (0.06 + fresnel * 0.35 + minorLine * 0.1 + majorLine * 0.2 + scan * 0.25 + uPinBoost * 0.45) * uOpacity * uFlicker;
    gl_FragColor = vec4(col, alpha);
  }
`

function makeHoloMaterial(partIds: string[]): THREE.ShaderMaterial {
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#00e5ff') },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uScanY: { value: -2 },
      uFlicker: { value: 1 },
      uPinBoost: { value: 0 },
    },
    vertexShader: HOLO_VERT,
    fragmentShader: HOLO_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  m.userData.partIds = partIds
  return m
}

function HoloPart({
  geometry,
  partIds,
  position,
  rotation,
  scale,
}: {
  geometry: THREE.BufferGeometry
  partIds: string[]
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}) {
  const fillMat = useState(() => makeHoloMaterial(partIds))[0]
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 45), [geometry])
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={fillMat} raycast={() => {}} />
      <lineSegments geometry={edges} raycast={() => {}}>
        <lineBasicMaterial color="#2a9fc4" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

function HoloAirframe({ geo }: { geo: ReturnType<typeof useAircraftGeometry> }) {
  return (
    <group>
      <HoloPart geometry={geo.fuselage} partIds={['cowling', 'firewall', 'door']} rotation={[-Math.PI / 2, 0, 0]} />
      <HoloPart geometry={geo.wingRight} partIds={['wing', 'wingtip', 'aileron', 'flap']} />
      <HoloPart geometry={geo.wingLeft} partIds={['wing', 'wingtip', 'aileron', 'flap']} />
      <HoloPart geometry={geo.fairingRight} partIds={['fairing']} />
      <HoloPart geometry={geo.fairingLeft} partIds={['fairing']} />
      <HoloPart geometry={geo.hstabRight} partIds={['empennage']} />
      <HoloPart geometry={geo.hstabLeft} partIds={['empennage']} />
      <HoloPart geometry={geo.vstab} partIds={['empennage']} rotation={[0, 0, Math.PI / 2]} />
      <HoloPart geometry={geo.canopy} partIds={['canopy']} />
      <HoloPart geometry={geo.spinner} partIds={['spinner']} rotation={[-Math.PI / 2, 0, 0]} />
      <HoloPart geometry={geo.blade} partIds={['blade']} />
      <HoloPart geometry={geo.blade} partIds={['blade']} rotation={[0, 0, Math.PI]} />
    </group>
  )
}

/** BlendController: crossfades photoreal ↔ hologram, lerps bg/fog color. */
function BlendController({
  photoRef,
  holoRef,
  target,
  blendRef,
  active,
}: {
  photoRef: RefObject<THREE.Group | null>
  holoRef: RefObject<THREE.Group | null>
  target: number
  blendRef: RefObject<number>
  active: number | null
}) {
  const blend = useRef(0)
  const { scene } = useThree()

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 5)
    blend.current += (target - blend.current) * k
    const b = blend.current
    blendRef.current = b

    // Photoreal: hide past 60% to avoid depth occlusion of hologram
    if (photoRef.current) {
      photoRef.current.visible = b < 0.6
      photoRef.current.traverse((c) => {
        const mesh = c as THREE.Mesh
        if (mesh.material) {
          const mat = mesh.material as THREE.Material & { opacity: number; transparent: boolean }
          mat.transparent = b > 0.01
          mat.opacity = Math.max(0, 1 - b)
        }
      })
    }

    // Hologram uniforms
    if (holoRef.current) {
      const t = performance.now() / 1000
      const scanY = -1.2 + ((t * 0.8) % 2.4)
      const flicker = 0.93 + 0.07 * Math.sin(t * 13.0) * Math.sin(t * 7.3)
      const pin = PINS.find((p) => p.number === active)
      holoRef.current.traverse((c) => {
        const mesh = c as THREE.Mesh
        const mm = mesh.material as THREE.ShaderMaterial | undefined
        if (mm && mm.isShaderMaterial) {
          mm.uniforms.uOpacity.value = b
          mm.uniforms.uTime.value = t
          mm.uniforms.uScanY.value = scanY
          mm.uniforms.uFlicker.value = flicker
          const partIds = (mm.userData.partIds as string[]) || []
          const boost = pin && pin.partIds.some((id) => partIds.includes(id)) ? 1 : 0
          mm.uniforms.uPinBoost.value += (boost - mm.uniforms.uPinBoost.value) * 0.12
        }
      })
    }

    // Background lerp: light (#cfe0ee) → dark (#0a0e1a)
    const lightCol = new THREE.Color('#cfe0ee')
    const darkCol = new THREE.Color('#0a0e1a')
    const col = lightCol.clone().lerp(darkCol, b)
    // eslint-disable-next-line react-hooks/immutability
    scene.background = col
    if (scene.fog && (scene.fog as THREE.Fog).color) {
      ;(scene.fog as THREE.Fog).color.copy(col)
    }
  })
  return null
}

/** Projector ring under the aircraft (blueprint mode). */
function ProjectorBase({ blendRef }: { blendRef: RefObject<number> }) {
  const ringRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const b = blendRef.current
    if (groupRef.current) groupRef.current.visible = b > 0.001
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.3
      const m = ringRef.current.material as THREE.MeshBasicMaterial
      m.opacity = b * 0.6
    }
  })
  return (
    <group ref={groupRef} position={[0, -1.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[2.8, 3.0, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[1.8, 1.85, 48]} />
        <meshBasicMaterial color="#29d3ff" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Flying showcase: smooth dynamic figure-eight flight path with coordinated
 *  banking, pitch into climbs/descents, drifting clouds, and a soft contrail.
 *  The aircraft always points along its velocity direction. */
function FlyingAnimator({
  groupRef,
  cloudsRef,
  contrailRef,
}: {
  groupRef: RefObject<THREE.Group | null>
  cloudsRef: RefObject<THREE.Group | null>
  contrailRef: RefObject<THREE.Mesh | null>
}) {
  const { scene } = useThree()
  const trailPositions = useRef<Float32Array>(new Float32Array(60 * 3))
  const trailIdx = useRef(0)

  useFrame(() => {
    const t = performance.now() / 1000

    if (groupRef.current) {
      // Smooth figure-eight (Lissajous) flight path
      const px = Math.sin(t * 0.28) * 1.8
      const py = Math.sin(t * 0.42) * 0.45 + 0.3
      const pz = Math.sin(t * 0.28 + Math.PI / 2) * 1.2
      groupRef.current.position.set(px, py, pz)

      // Velocity = derivative of position → heading direction
      const vx = Math.cos(t * 0.28) * 0.28 * 1.8
      const vy = Math.cos(t * 0.42) * 0.42 * 0.45
      const vz = Math.cos(t * 0.28 + Math.PI / 2) * 0.28 * 1.2

      // Yaw: rotate around Y so nose (−Z) points along velocity (vx, vz)
      const yaw = Math.atan2(vx, -vz)
      // Pitch: nose up when climbing (vy > 0)
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
      const pitch = -Math.asin(vy / (speed || 1)) * 0.6
      // Bank: coordinated turn — bank into the turn direction
      // Turn rate = derivative of yaw → approximate with lateral acceleration
      const ax = -Math.sin(t * 0.28) * 0.28 * 0.28 * 1.8
      const az = -Math.sin(t * 0.28 + Math.PI / 2) * 0.28 * 0.28 * 1.2
      const bank = Math.atan2(ax * Math.sin(yaw) - az * Math.cos(yaw), speed * speed) * 0.8

      groupRef.current.rotation.set(pitch, yaw, bank)
    }

    // Record contrail position (behind the tail)
    if (groupRef.current && contrailRef.current) {
      const tail = new THREE.Vector3(0, 0.1, 0.9)
      groupRef.current.localToWorld(tail)
      const arr = trailPositions.current
      arr[trailIdx.current * 3] = tail.x
      arr[trailIdx.current * 3 + 1] = tail.y
      arr[trailIdx.current * 3 + 2] = tail.z
      trailIdx.current = (trailIdx.current + 1) % 60
      const geo = contrailRef.current.geometry
      geo.setAttribute('position', new THREE.BufferAttribute(arr.slice(), 3))
      geo.setDrawRange(0, 60)
      geo.attributes.position.needsUpdate = true
    }

    // Drift clouds slowly
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((c, i) => {
        c.position.x += 0.004 + i * 0.001
        if (c.position.x > 8) c.position.x = -8
      })
    }

    // Sky gradient: top #4a90d9 → horizon #b8d8f0
    const skyCol = new THREE.Color('#7fb8e8')
    // eslint-disable-next-line react-hooks/immutability
    scene.background = skyCol
    if (scene.fog && (scene.fog as THREE.Fog).color) {
      ;(scene.fog as THREE.Fog).color.copy(skyCol)
    }
  })
  return null
}

/** Clouds for flying mode — soft white puffs at various depths. */
function CloudLayer({ cloudsRef }: { cloudsRef: RefObject<THREE.Group | null> }) {
  const clouds = useMemo(() => {
    const arr: Array<{ pos: [number, number, number]; scale: number }> = []
    for (let i = 0; i < 14; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * 16, 1.5 + Math.random() * 3, -2 - Math.random() * 8],
        scale: 0.6 + Math.random() * 0.8,
      })
    }
    return arr
  }, [])
  return (
    <group ref={cloudsRef}>
      {clouds.map((c, i) => (
        <group key={i} position={c.pos} scale={c.scale}>
          <mesh>
            <sphereGeometry args={[0.6, 16, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.85} roughness={1} />
          </mesh>
          <mesh position={[0.5, -0.05, 0.1]}>
            <sphereGeometry args={[0.45, 14, 10]} />
            <meshStandardMaterial color="#f4f8fc" transparent opacity={0.8} roughness={1} />
          </mesh>
          <mesh position={[-0.45, -0.08, -0.05]}>
            <sphereGeometry args={[0.4, 14, 10]} />
            <meshStandardMaterial color="#f4f8fc" transparent opacity={0.8} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Contrail: a line that follows the tail. */
function Contrail({ contrailRef }: { contrailRef: RefObject<THREE.Mesh | null> }) {
  const geo = useMemo(() => new THREE.BufferGeometry(), [])
  return (
    <line ref={contrailRef as unknown as React.RefObject<THREE.Line>} geometry={geo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
    </line>
  )
}

/* ===========================================================================
 * 18. SCENE (lights, environment, shadows)
 * ========================================================================= */

function Scene({
  autoRotate,
  rotateSpeed,
  enableZoom,
  showPins,
  active,
  setActive,
  setLocked,
  mode,
}: {
  autoRotate: boolean
  rotateSpeed: number
  enableZoom: boolean
  showPins: boolean
  active: number | null
  setActive: (n: number | null) => void
  setLocked: (n: number | null) => void
  mode: ViewMode
}) {
  const onHover = useCallback((n: number | null) => setActive(n), [setActive])
  const onLeave = useCallback(() => setActive(null), [setActive])
  const onClick = useCallback((n: number) => setLocked(n), [setLocked])

  const photoRef = useRef<THREE.Group>(null)
  const holoRef = useRef<THREE.Group>(null)
  const flyRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Group>(null)
  const contrailRef = useRef<THREE.Mesh>(null)
  const blendRef = useRef(0)
  const G = useAircraftGeometry()
  const isBlueprint = mode === 'blueprint'
  const isFlying = mode === 'flying'

  return (
    <>
      {/* 3-point lighting */}
      <ambientLight intensity={isFlying ? 0.5 : 0.28} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={2.5}
        color={isFlying ? '#ffffff' : '#fff0dc'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#c6d6ff" />
      <directionalLight position={[0, 4, -8]} intensity={2.0} color="#ffd06a" />

      {!isFlying && (
        <Environment resolution={256}>
          <Lightformer position={[0, 5, -6]} scale={[12, 8, 1]} color="#ffe9c4" intensity={3} />
          <Lightformer position={[6, 3, 4]} scale={[8, 8, 1]} color="#ffffff" intensity={1.6} />
          <Lightformer position={[-6, 3, 2]} scale={[6, 6, 1]} color="#b8d4ff" intensity={1.1} />
          <Lightformer position={[0, -3, 0]} scale={[12, 6, 1]} color="#444" intensity={0.5} />
          <Lightformer position={[0, 0, 8]} scale={[10, 10, 1]} color="#ffd06a" intensity={0.9} />
        </Environment>
      )}

      <PinCtx.Provider value={{ active, pins: PINS }}>
        {/* Flying mode wraps the photoreal airframe in an animated group */}
        {isFlying ? (
          <group ref={flyRef}>
            <Airframe onHover={onHover} onLeave={onLeave} onClick={onClick} />
          </group>
        ) : (
          <>
            <group ref={photoRef}>
              <Airframe onHover={onHover} onLeave={onLeave} onClick={onClick} />
            </group>
            <group ref={holoRef}>
              <HoloAirframe geo={G} />
            </group>
          </>
        )}
      </PinCtx.Provider>

      {/* Blend controller (photo ↔ blueprint crossfade) */}
      {!isFlying && (
        <BlendController
          photoRef={photoRef}
          holoRef={holoRef}
          target={isBlueprint ? 1 : 0}
          blendRef={blendRef}
          active={active}
        />
      )}
      {isFlying && (
        <FlyingAnimator groupRef={flyRef} cloudsRef={cloudsRef} contrailRef={contrailRef} />
      )}
      {isFlying && <CloudLayer cloudsRef={cloudsRef} />}
      {isFlying && <Contrail contrailRef={contrailRef} />}

      {/* Projector base ring (blueprint only) */}
      {!isFlying && <ProjectorBase blendRef={blendRef} />}

      {showPins && !isFlying &&
        PINS.map((p) => (
          <NumberedPin
            key={p.number}
            number={p.number}
            position={p.position}
            labelPosition={p.labelPosition}
            color={p.color}
            label={p.label}
            active={active === p.number}
            onHover={onHover}
            onLeave={onLeave}
            onClick={onClick}
          />
        ))}

      {!isFlying && (
        <ContactShadows
          position={[0, -1.18, 0]}
          opacity={0.45}
          scale={14}
          blur={2.6}
          far={4.5}
          resolution={1024}
          color="#000000"
        />
      )}

      {!isFlying && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.19, 0]} receiveShadow>
          <circleGeometry args={[10, 64]} />
          <meshStandardMaterial color="#e9e7e1" roughness={0.95} metalness={0} />
        </mesh>
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate && !isFlying}
        autoRotateSpeed={rotateSpeed}
        enableZoom={enableZoom}
        enablePan={false}
        minDistance={3.2}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, 0]}
      />
    </>
  )
}

/* ===========================================================================
 * 19. OVERLAY (side info panel — outside the Canvas)
 * ========================================================================= */

/** Minimal hover tooltip: a single small card in the bottom-left. */
function PinOverlay({ active }: { active: number | null }) {
  const pin = PINS.find((p) => p.number === active)
  if (!pin) return null
  return (
    <div style={{ position: 'absolute', bottom: 14, left: 14, maxWidth: 300, pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(12,14,18,0.82)',
          border: `1px solid ${pin.color}`,
          borderRadius: 10,
          padding: '10px 13px',
          color: '#f5f6f8',
          backdropFilter: 'blur(6px)',
          boxShadow: `0 6px 22px rgba(0,0,0,0.4), 0 0 18px ${pin.color}22`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: pin.color, boxShadow: `0 0 8px ${pin.color}`, flexShrink: 0 }} />
          <strong style={{ fontSize: 13, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{pin.label}</strong>
        </div>
        <p style={{ fontSize: 11.5, lineHeight: 1.55, margin: 0, color: '#cdd2da', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{pin.desc}</p>
      </div>
    </div>
  )
}

/* ===========================================================================
 * 20. PUBLIC COMPONENT
 * ========================================================================= */

export interface InteractiveAircraftProps {
  autoRotate?: boolean
  rotateSpeed?: number
  enableZoom?: boolean
  cameraPosition?: [number, number, number]
  showPins?: boolean
  className?: string
  style?: CSSProperties
}

export function InteractiveAircraft({
  autoRotate = true,
  rotateSpeed = 0.6,
  enableZoom = true,
  cameraPosition = [3.6, 2.1, 4.6],
  showPins = true,
  className,
  style,
}: InteractiveAircraftProps) {
  const [active, setActive] = useState<number | null>(null)
  const [locked, setLocked] = useState<number | null>(null)
  const [mode, setMode] = useState<ViewMode>('photo')

  const handleSetLocked = useCallback((n: number | null) => {
    setLocked((cur) => (cur === n ? null : n))
  }, [])

  const shown = locked ?? active

  const modeBtn = (m: ViewMode, label: string, icon: string) => (
    <button
      onClick={() => setMode(m)}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        cursor: 'pointer',
        border: mode === m ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.2)',
        background: mode === m ? 'rgba(0,229,255,0.18)' : 'rgba(15,17,22,0.7)',
        color: mode === m ? '#00e5ff' : '#c8ccd0',
        backdropFilter: 'blur(6px)',
        transition: 'all 0.2s ease',
      }}
    >
      {icon} {label}
    </button>
  )

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: cameraPosition, fov: 35, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
        onPointerMissed={() => { setActive(null); setLocked(null) }}
      >
        <color attach="background" args={['#cfe0ee']} />
        <fog attach="fog" args={['#cfe0ee', 14, 30]} />
        <Scene
          autoRotate={autoRotate}
          rotateSpeed={rotateSpeed}
          enableZoom={enableZoom}
          showPins={showPins}
          active={shown}
          setActive={setActive}
          setLocked={handleSetLocked}
          mode={mode}
        />
      </Canvas>

      {/* Mode toggle (top-right) */}
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6, zIndex: 10 }}>
        {modeBtn('photo', 'PHOTOREAL', '●')}
        {modeBtn('blueprint', 'BLUEPRINT', '◆')}
        {modeBtn('flying', 'FLYING', '✈')}
      </div>

      {showPins && <PinOverlay active={shown} />}
    </div>
  )
}

export default InteractiveAircraft
