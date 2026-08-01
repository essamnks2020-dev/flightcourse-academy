'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/* ============================================================
 * Types & data
 * ========================================================== */

type Category = 'Instrument' | 'Control' | 'Avionics' | 'Switch'

interface Hotspot {
  id: string
  name: string
  category: Category
  detail: string
}

const HOTSPOTS: Hotspot[] = [
  { id: 'asi', name: 'Airspeed Indicator', category: 'Instrument', detail: 'Indicates airspeed in knots. White, green, yellow arcs and a red line mark flap, normal, caution, and never-exceed ranges.' },
  { id: 'ai', name: 'Attitude Indicator', category: 'Instrument', detail: 'Gyro-driven artificial horizon showing pitch and bank against the horizon line.' },
  { id: 'alt', name: 'Altimeter', category: 'Instrument', detail: 'Barometric altimeter in feet. The needle indicates hundreds of feet per revolution; the digital window shows the full reading.' },
  { id: 'tc', name: 'Turn Coordinator', category: 'Instrument', detail: 'Shows rate of turn. The miniature aircraft banks with roll; standard-rate marks sit left and right.' },
  { id: 'dg', name: 'Heading Indicator', category: 'Instrument', detail: 'Directional gyro. The compass card rotates beneath a fixed lubber pointer to display the current heading.' },
  { id: 'vsi', name: 'Vertical Speed Indicator', category: 'Instrument', detail: 'Rate of climb or descent in feet per minute. Zero sits at the nine o’clock position.' },
  { id: 'master', name: 'Master Switch', category: 'Switch', detail: 'Controls the aircraft electrical master bus.' },
  { id: 'avbus', name: 'Avionics Bus', category: 'Switch', detail: 'Enables power to the avionics bus.' },
  { id: 'land', name: 'Landing Light', category: 'Switch', detail: 'Toggle for the forward landing light.' },
  { id: 'hdgknob', name: 'Heading Bug Knob', category: 'Control', detail: 'Rotary control that sets the heading bug on the directional gyro.' },
  { id: 'altknob', name: 'Altimeter Knob', category: 'Control', detail: 'Adjusts the barometric pressure reference (Kollsman window).' },
  { id: 'radio', name: 'COM/NAV Radio', category: 'Avionics', detail: 'Communication and navigation frequency display.' },
]

const CATEGORY_ORDER: Category[] = ['Instrument', 'Control', 'Avionics', 'Switch']

const CATEGORY_COLOR: Record<Category, string> = {
  Instrument: '#5ec5ff',
  Control: '#ffcc00',
  Avionics: '#7cfca0',
  Switch: '#ff7878',
}

/* ============================================================
 * Demo flight profile
 * ========================================================== */

interface FlightState {
  airspeed: number
  altitude: number
  vsi: number
  heading: number
  pitch: number
  bank: number
}

const NEUTRAL: FlightState = { airspeed: 0, altitude: 0, vsi: 0, heading: 0, pitch: 0, bank: 0 }

const KEYFRAMES: Array<{ t: number } & FlightState> = [
  { t: 0.0,  airspeed: 0,   altitude: 0,    vsi: 0,    heading: 0,  pitch: 0,  bank: 0 },
  { t: 1.0,  airspeed: 15,  altitude: 0,    vsi: 0,    heading: 0,  pitch: 0,  bank: 0 },
  { t: 3.0,  airspeed: 70,  altitude: 0,    vsi: 200,  heading: 0,  pitch: 5,  bank: 0 },
  { t: 4.5,  airspeed: 95,  altitude: 1500, vsi: 1500, heading: 7,  pitch: 8,  bank: 6 },
  { t: 6.0,  airspeed: 120, altitude: 3500, vsi: 1000, heading: 0,  pitch: 6,  bank: -4 },
  { t: 7.5,  airspeed: 120, altitude: 3500, vsi: 0,    heading: 0,  pitch: 2,  bank: 0 },
  { t: 9.0,  airspeed: 120, altitude: 3500, vsi: 0,    heading: 20, pitch: 2,  bank: 9 },
  { t: 10.0, airspeed: 110, altitude: 2500, vsi: -400, heading: 15, pitch: -2, bank: 0 },
  { t: 11.5, airspeed: 90,  altitude: 200,  vsi: -700, heading: 5,  pitch: -3, bank: -3 },
  { t: 14.0, airspeed: 0,   altitude: 0,    vsi: 0,    heading: 0,  pitch: 0,  bank: 0 },
]

function lerp(a: number, b: number, f: number) {
  return a + (b - a) * f
}

function interpolateFlight(elapsed: number): FlightState {
  if (elapsed <= KEYFRAMES[0].t) return KEYFRAMES[0]
  const last = KEYFRAMES[KEYFRAMES.length - 1]
  if (elapsed >= last.t) return last
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i]
    const b = KEYFRAMES[i + 1]
    if (elapsed >= a.t && elapsed <= b.t) {
      const f = (elapsed - a.t) / (b.t - a.t)
      return {
        airspeed: lerp(a.airspeed, b.airspeed, f),
        altitude: lerp(a.altitude, b.altitude, f),
        vsi: lerp(a.vsi, b.vsi, f),
        heading: lerp(a.heading, b.heading, f),
        pitch: lerp(a.pitch, b.pitch, f),
        bank: lerp(a.bank, b.bank, f),
      }
    }
  }
  return last
}

/* ============================================================
 * Needle / dial angle maps
 *  Convention: 0deg = 12 o'clock (pointing up), positive = clockwise
 * ========================================================== */

const ASI_MAX = 160
function asiAngle(kt: number) {
  return -135 + (Math.min(Math.max(kt, 0), ASI_MAX) / ASI_MAX) * 270
}
// Altimeter 100s needle: full turn per 1000ft, continuous (no modulo) so it
// never snaps backward at the 999->1000 boundary.
function altAngle(ft: number) {
  return (ft / 1000) * 360
}
// VSI: 0 at 9 o'clock (-90deg), +2000 at +50, -2000 at -230
function vsiAngle(fpm: number) {
  const c = Math.max(-2000, Math.min(2000, fpm))
  return -90 + (c / 2000) * 140
}
// DG card rotates so current heading sits under the top lubber pointer.
function dgCardAngle(h: number) {
  return -h
}
// AI horizon: bank rotates the horizon (opposite sense), pitch translates it.
function aiHorizonTransform(pitch: number, bank: number) {
  return `rotate(${-bank}deg) translateY(${pitch * 2.2}px)`
}
// Turn coordinator: aircraft banks with roll.
function tcAircraftAngle(bank: number) {
  return bank
}

/* ============================================================
 * SVG dial helpers
 * ========================================================== */

function polar(r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 50 + r * Math.sin(rad), y: 50 - r * Math.cos(rad) }
}

function arcPath(r: number, a1: number, a2: number) {
  const p1 = polar(r, a1)
  const p2 = polar(r, a2)
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
}

function Tick({ angle, major }: { angle: number; major?: boolean }) {
  const r2 = major ? 41 : 43.5
  return (
    <line
      x1="50"
      y1="4"
      x2="50"
      y2={50 - r2}
      transform={`rotate(${angle} 50 50)`}
      className={major ? 'tick-major' : 'tick-minor'}
    />
  )
}

function DialLabel({ angle, r, children }: { angle: number; r: number; children: ReactNode }) {
  return (
    <g transform={`rotate(${angle} 50 50)`}>
      <text
        x="50"
        y={50 - r}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(${-angle} 50 ${50 - r})`}
        className="dial-text"
      >
        {children}
      </text>
    </g>
  )
}

/* ============================================================
 * Gauge shell — bezel, face gradient, screws, glass reflection
 * (shared by all 6 instruments)
 * ========================================================== */

function Gauge({ children }: { children: ReactNode }) {
  return (
    <div className="gauge">
      <div className="gauge-bezel">
        <div className="gauge-face">
          {children}
          <div className="gauge-glass" />
        </div>
      </div>
      <div className="screw screw-12" />
      <div className="screw screw-3" />
      <div className="screw screw-6" />
      <div className="screw screw-9" />
    </div>
  )
}

/* ============================================================
 * Instruments
 * ========================================================== */

function AirspeedIndicator({ value }: { value: number }) {
  return (
    <Gauge>
      <svg className="dial-svg" viewBox="0 0 100 100">
        {/* colored operating arcs */}
        <path d={arcPath(44, asiAngle(40), asiAngle(85))} className="arc arc-white" />
        <path d={arcPath(44, asiAngle(85), asiAngle(120))} className="arc arc-green" />
        <path d={arcPath(44, asiAngle(120), asiAngle(150))} className="arc arc-yellow" />
        <path d={arcPath(44, asiAngle(150), asiAngle(160))} className="arc arc-red" />
        {/* ticks every 10kt */}
        {Array.from({ length: 17 }).map((_, i) => {
          const kt = i * 10
          return <Tick key={kt} angle={asiAngle(kt)} major={kt % 20 === 0} />
        })}
        {/* labels every 40kt */}
        {[0, 40, 80, 120, 160].map((kt) => (
          <DialLabel key={kt} angle={asiAngle(kt)} r={35}>{kt}</DialLabel>
        ))}
      </svg>
      <div className="lcd lcd-asi">{Math.round(value).toString().padStart(3, '0')} KT</div>
      <div className="needle" style={{ transform: `rotate(${asiAngle(value)}deg)` }} />
      <div className="hub-cap" />
    </Gauge>
  )
}

function AttitudeIndicator({ pitch, bank }: { pitch: number; bank: number }) {
  return (
    <Gauge>
      <div className="ai-horizon" style={{ transform: aiHorizonTransform(pitch, bank) }}>
        <div className="ai-sky" />
        <div className="ai-ground" />
        <div className="ai-horizon-line" />
        <div className="ai-ladder">
          {[-20, -10, 10, 20].map((p) => (
            <div key={p} className="ai-ladder-mark" style={{ top: `calc(50% + ${p * 1.6}px)` }}>
              <span>{Math.abs(p)}</span>
            </div>
          ))}
        </div>
        {/* bank scale that rotates with the horizon */}
        {[-30, -20, -10, 10, 20, 30].map((b) => (
          <div
            key={b}
            className="ai-bank-mark"
            style={{ transform: `rotate(${b}deg)` }}
          />
        ))}
      </div>
      <svg className="dial-svg" viewBox="0 0 100 100" />
      {/* fixed aircraft symbol */}
      <div className="ai-aircraft">
        <div className="ai-wing ai-wing-l" />
        <div className="ai-wing ai-wing-r" />
        <div className="ai-dot" />
      </div>
      {/* fixed sky pointer at top */}
      <div className="ai-pointer" />
    </Gauge>
  )
}

function Altimeter({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <Gauge>
      <svg className="dial-svg" viewBox="0 0 100 100">
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i // 0..9, hundreds digit
          const a = (n / 10) * 360
          return <Tick key={n} angle={a} major />
        })}
        {Array.from({ length: 50 }).map((_, i) => {
          const a = (i / 50) * 360
          return <Tick key={`m${i}`} angle={a} major={false} />
        })}
        {Array.from({ length: 10 }).map((_, i) => (
          <DialLabel key={i} angle={(i / 10) * 360} r={35}>{i}</DialLabel>
        ))}
      </svg>
      <div className="lcd lcd-alt">{rounded.toString().padStart(5, '0')}</div>
      <div className="needle" style={{ transform: `rotate(${altAngle(value)}deg)` }} />
      <div className="hub-cap" />
    </Gauge>
  )
}

function TurnCoordinator({ bank }: { bank: number }) {
  return (
    <Gauge>
      <svg className="dial-svg" viewBox="0 0 100 100">
        {/* standard-rate marks L and R */}
        <line x1="50" y1="6" x2="50" y2="14" transform="rotate(-35 50 50)" className="tick-major" />
        <line x1="50" y1="6" x2="50" y2="14" transform="rotate(35 50 50)" className="tick-major" />
        <line x1="50" y1="6" x2="50" y2="12" transform="rotate(-25 50 50)" className="tick-minor" />
        <line x1="50" y1="6" x2="50" y2="12" transform="rotate(25 50 50)" className="tick-minor" />
        <DialLabel angle={-35} r={30}>L</DialLabel>
        <DialLabel angle={35} r={30}>R</DialLabel>
      </svg>
      <div className="tc-aircraft" style={{ transform: `rotate(${tcAircraftAngle(bank)}deg)` }}>
        <div className="tc-wing" />
        <div className="tc-tail" />
        <div className="tc-body" />
      </div>
      <div className="tc-label">2 MIN</div>
      <div className="hub-cap" />
    </Gauge>
  )
}

function HeadingIndicator({ heading }: { heading: number }) {
  const h = ((Math.round(heading) % 360) + 360) % 360
  const display = h === 0 ? 360 : h
  return (
    <Gauge>
      <div className="dg-card" style={{ transform: `rotate(${dgCardAngle(heading)}deg)` }}>
        <svg className="dial-svg" viewBox="0 0 100 100">
          {Array.from({ length: 36 }).map((_, i) => {
            const deg = i * 10
            return <Tick key={deg} angle={deg} major={deg % 30 === 0} />
          })}
          <DialLabel angle={0} r={33}>N</DialLabel>
          <DialLabel angle={90} r={33}>E</DialLabel>
          <DialLabel angle={180} r={33}>S</DialLabel>
          <DialLabel angle={270} r={33}>W</DialLabel>
          {[30, 60, 120, 150, 210, 240, 300, 330].map((d) => (
            <DialLabel key={d} angle={d} r={33}>{d / 10}</DialLabel>
          ))}
        </svg>
      </div>
      <div className="dg-pointer" />
      <div className="lcd lcd-dg">{display.toString().padStart(3, '0')}°</div>
    </Gauge>
  )
}

function VerticalSpeedIndicator({ value }: { value: number }) {
  const fpm = Math.round(value)
  const sign = fpm > 0 ? '+' : fpm < 0 ? '-' : '±'
  const abs = Math.abs(fpm).toString().padStart(4, '0')
  return (
    <Gauge>
      <svg className="dial-svg" viewBox="0 0 100 100">
        {[0, 500, 1000, 1500, 2000, -500, -1000, -1500, -2000].map((v) => (
          <Tick key={v} angle={vsiAngle(v)} major />
        ))}
        {[-1000, -500, 0, 500, 1000, 1500, 2000].map((v) => (
          <DialLabel key={v} angle={vsiAngle(v)} r={33}>
            {Math.abs(v) / 1000}
          </DialLabel>
        ))}
      </svg>
      <div className="lcd lcd-vsi">{sign}{abs}</div>
      <div className="needle" style={{ transform: `rotate(${vsiAngle(value)}deg)` }} />
      <div className="hub-cap" />
    </Gauge>
  )
}

/* ============================================================
 * Panel controls (switches / knobs / avionics)
 * ========================================================== */

function ToggleSwitch({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="toggle-wrap">
      <div className="toggle-switch">
        <div className={`toggle-lever ${on ? 'toggle-lever--up' : 'toggle-lever--down'}`} />
      </div>
      <span className="toggle-label">{label}</span>
    </div>
  )
}

function Knob({ angle, label }: { angle: number; label: string }) {
  return (
    <div className="knob-wrap">
      <div className="knob" style={{ transform: `rotate(${angle}deg)` }}>
        <div className="knob-pointer" />
      </div>
      <span className="knob-label">{label}</span>
    </div>
  )
}

/* ============================================================
 * Hotspot wrapper — keyboard accessible, filterable
 * ========================================================== */

function Hotspot({
  hotspot,
  selectedId,
  activeCategory,
  onSelect,
  className,
  children,
}: {
  hotspot: Hotspot
  selectedId: string | null
  activeCategory: Category | null
  onSelect: (id: string) => void
  className?: string
  children: ReactNode
}) {
  const dim = activeCategory !== null && activeCategory !== hotspot.category
  const active = selectedId === hotspot.id
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${hotspot.name} — ${hotspot.category}`}
      aria-pressed={active}
      onClick={() => onSelect(hotspot.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(hotspot.id)
        }
      }}
      className={`hotspot ${dim ? 'hotspot--dimmed' : ''} ${active ? 'hotspot--active' : ''} ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

/* ============================================================
 * Main view
 * ========================================================== */

export default function CockpitExplorerView() {
  const [flight, setFlight] = useState<FlightState>(NEUTRAL)
  const [running, setRunning] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const runDemo = useCallback(() => {
    if (running || intervalRef.current) return
    setRunning(true)
    setSelectedId(null)
    const start = performance.now()
    intervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000
      if (elapsed >= 14) {
        setFlight(NEUTRAL)
        setRunning(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }
      setFlight(interpolateFlight(elapsed))
    }, 100)
  }, [running])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const selectHotspot = useCallback((id: string) => {
    setSelectedId((cur) => (cur === id ? null : id))
  }, [])

  const toggleCategory = useCallback((cat: Category) => {
    setActiveCategory((cur) => (cur === cat ? null : cat))
  }, [])

  const selected = HOTSPOTS.find((h) => h.id === selectedId) ?? null

  const landingOn = running && flight.airspeed < 95 && flight.altitude < 1200

  const hotspotById = (id: string) => HOTSPOTS.find((h) => h.id === id)!

  return (
    <div className="cockpit-root">
      <div className="cockpit-shell">
        <header className="cockpit-head">
          <h1 className="cockpit-title">Flight Instrument Panel</h1>
          <div className="legend" role="group" aria-label="Filter panel by category">
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`legend-chip ${activeCategory === cat ? 'legend-chip--active' : ''}`}
              >
                <span
                  className="legend-dot"
                  aria-hidden="true"
                  style={{ background: CATEGORY_COLOR[cat] }}
                />
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Carbon-fiber instrument panel */}
        <section className="panel-carbon" aria-label="Six-pack flight instruments">
          <div className="sixpack">
            <Hotspot hotspot={hotspotById('asi')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot}>
              <AirspeedIndicator value={flight.airspeed} />
              <span className="gauge-caption">ASI</span>
            </Hotspot>
            <Hotspot hotspot={hotspotById('ai')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot}>
              <AttitudeIndicator pitch={flight.pitch} bank={flight.bank} />
              <span className="gauge-caption">AI</span>
            </Hotspot>
            <Hotspot hotspot={hotspotById('alt')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot}>
              <Altimeter value={flight.altitude} />
              <span className="gauge-caption">ALT</span>
            </Hotspot>
            <Hotspot hotspot={hotspotById('tc')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot}>
              <TurnCoordinator bank={flight.bank} />
              <span className="gauge-caption">TC</span>
            </Hotspot>
            <Hotspot hotspot={hotspotById('dg')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot}>
              <HeadingIndicator heading={flight.heading} />
              <span className="gauge-caption">DG</span>
            </Hotspot>
            <Hotspot hotspot={hotspotById('vsi')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot}>
              <VerticalSpeedIndicator value={flight.vsi} />
              <span className="gauge-caption">VSI</span>
            </Hotspot>
          </div>
        </section>

        {/* Brushed-metal switch rail */}
        <section className="panel-brushed" aria-label="Switches and controls">
          <Hotspot hotspot={hotspotById('master')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot} className="rail-cell">
            <ToggleSwitch on={running} label="Master" />
          </Hotspot>
          <Hotspot hotspot={hotspotById('avbus')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot} className="rail-cell">
            <ToggleSwitch on={running} label="Avionics" />
          </Hotspot>
          <Hotspot hotspot={hotspotById('land')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot} className="rail-cell">
            <ToggleSwitch on={landingOn} label="Landing" />
          </Hotspot>
          <Hotspot hotspot={hotspotById('hdgknob')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot} className="rail-cell">
            <Knob angle={-flight.heading} label="HDG" />
          </Hotspot>
          <Hotspot hotspot={hotspotById('altknob')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot} className="rail-cell">
            <Knob angle={flight.altitude / 18} label="ALT" />
          </Hotspot>
          <Hotspot hotspot={hotspotById('radio')} selectedId={selectedId} activeCategory={activeCategory} onSelect={selectHotspot} className="rail-cell rail-cell--radio">
            <div className="lcd radio-lcd">
              <div className="radio-row">COM <span>122.75</span></div>
              <div className="radio-row">NAV <span>108.50</span></div>
            </div>
          </Hotspot>
          <button
            type="button"
            className="demo-btn"
            onClick={runDemo}
            disabled={running}
            aria-label="Run demo flight profile"
          >
            {running ? 'Flying…' : 'Run Demo Flight'}
          </button>
        </section>

        {/* Detail view */}
        <section className="detail-area" aria-live="polite">
          {selected ? (
            <div className="detail-card">
              <div className="detail-head">
                <span
                  className="legend-dot"
                  aria-hidden="true"
                  style={{ background: CATEGORY_COLOR[selected.category] }}
                />
                <h2 className="detail-title">{selected.name}</h2>
                <span className="detail-cat">{selected.category}</span>
              </div>
              <p className="detail-text">{selected.detail}</p>
            </div>
          ) : (
            <div className="detail-card detail-card--empty">
              Select an instrument, control, switch, or avionics item to view its details.
            </div>
          )}
        </section>
      </div>

      <footer className="cockpit-footer">
        Cockpit Instrument Explorer — six-pack gauge cluster
      </footer>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  )
}

/* ============================================================
 * Styles — plain CSS (multi-stop gradients can't be expressed in
 * Tailwind arbitrary values, so this is injected as a global block).
 * ========================================================== */

const CSS = `
.cockpit-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0b;
  color: #e6e6ea;
  font-family: var(--font-geist-sans, system-ui, sans-serif);
}
.cockpit-shell {
  flex: 1;
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
  padding: 22px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ---------- header / legend ---------- */
.cockpit-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.cockpit-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: #d8d8dc;
  text-transform: uppercase;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #a8a8ac;
  background: #161618;
  border: 1px solid #2a2a2e;
  border-radius: 20px;
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.legend-chip:hover {
  border-color: #3a3a40;
  color: #e6e6ea;
}
.legend-chip--active {
  background: #0c2a3a;
  border-color: #38bdf8;
  color: #bae6fd;
}
.legend-chip:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.15);
}

/* ---------- carbon-fiber panel ---------- */
.panel-carbon {
  background-color: #161616;
  background-image:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px);
  box-shadow: inset 0 0 60px rgba(0,0,0,0.75), inset 0 0 12px rgba(0,0,0,0.9);
  border-radius: 14px;
  padding: 26px 16px;
  display: flex;
  justify-content: center;
}
.sixpack {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: 22px 26px;
  justify-content: center;
}
@media (max-width: 560px) {
  .sixpack { grid-template-columns: repeat(2, max-content); }
}

/* ---------- brushed-metal rail ---------- */
.panel-brushed {
  background: linear-gradient(90deg, #9a9a9e, #b8b8bc, #8e8e92, #c0c0c4, #949498);
  background-size: 3px 100%;
  background-repeat: repeat;
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.4), 0 4px 14px rgba(0,0,0,0.5);
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: center;
}
.rail-cell { padding: 4px 8px; border-radius: 8px; }
.rail-cell--radio { display: flex; align-items: center; }

/* ---------- hotspots ---------- */
.hotspot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.25s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.hotspot:hover:not(.hotspot--dimmed) { transform: translateY(-1px); }
.hotspot--dimmed { opacity: 0.2; }
.hotspot--active { box-shadow: 0 0 0 2px rgba(56,189,248,0.65); }
.hotspot:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* ---------- gauge shell ---------- */
.gauge {
  position: relative;
  width: var(--g, 168px);
  height: var(--g, 168px);
}
@media (max-width: 720px) { .gauge { --g: 150px; } }
@media (max-width: 560px) { .gauge { --g: 124px; } }
@media (max-width: 380px) { .gauge { --g: 108px; } }

.gauge-bezel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 135deg,
    #8a8a8e 0deg, #d8d8dc 45deg, #6e6e72 90deg,
    #b8b8bc 135deg, #4a4a4e 180deg, #c4c4c8 225deg,
    #7a7a7e 270deg, #e0e0e4 315deg, #8a8a8e 360deg
  );
  box-shadow:
    inset 0 0 3px rgba(0,0,0,0.6),
    0 1px 3px rgba(0,0,0,0.6),
    0 6px 14px rgba(0,0,0,0.5);
  padding: 9px;
}
.gauge-face {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #2b2b2e 0%, #1c1c1e 55%, #0a0a0b 100%);
  overflow: hidden;
  box-shadow: inset 0 0 14px rgba(0,0,0,0.95), inset 0 0 3px rgba(0,0,0,0.9);
}

/* screws at 12 / 3 / 6 / 9 */
.screw {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ccc 0%, #888 50%, #333 100%);
  box-shadow: 0 0.5px 1px rgba(0,0,0,0.8), inset 0 0 1px rgba(0,0,0,0.5);
  z-index: 10;
}
.screw::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80%;
  height: 1px;
  background: rgba(0,0,0,0.75);
  transform: translate(-50%, -50%) rotate(45deg);
  border-radius: 1px;
}
.screw-12 { top: 2px; left: 50%; margin-left: -3.5px; }
.screw-3  { right: 2px; top: 50%; margin-top: -3.5px; }
.screw-6  { bottom: 2px; left: 50%; margin-left: -3.5px; }
.screw-9  { left: 2px; top: 50%; margin-top: -3.5px; }

/* convex glass reflection */
.gauge-glass {
  position: absolute;
  width: 60%;
  height: 38%;
  top: 7%;
  left: 12%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 40%, transparent 70%);
  transform: rotate(-25deg);
  filter: blur(1.5px);
  pointer-events: none;
  z-index: 5;
}

/* ---------- dial (SVG) ---------- */
.dial-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}
.tick-major { stroke: #d8d8dc; stroke-width: 1.3; }
.tick-minor { stroke: #6a6a6e; stroke-width: 0.7; }
.dial-text {
  fill: #d8d8dc;
  font-size: 6.5px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.arc { fill: none; stroke-width: 2.4; stroke-linecap: butt; }
.arc-white  { stroke: rgba(255,255,255,0.6); }
.arc-green  { stroke: rgba(90,220,100,0.78); }
.arc-yellow { stroke: rgba(255,210,40,0.8); }
.arc-red    { stroke: rgba(255,50,50,0.9); stroke-width: 1.8; }

/* ---------- needle (CSS transform + spring transition) ---------- */
.needle {
  position: absolute;
  left: 50%;
  top: 8%;
  width: 4px;
  height: 42%;
  margin-left: -2px;
  transform-origin: 50% 100%;
  background: linear-gradient(180deg, #f0f0f4 0%, #ffffff 50%, #b0b0b4 100%);
  border-radius: 3px 3px 1px 1px;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
  z-index: 3;
}
.needle::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 6px;
  height: 12%;
  margin-left: -3px;
  background: linear-gradient(180deg, #888, #3a3a3e);
  border-radius: 1px;
}
.hub-cap {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #d8d8dc 0%, #7a7a7e 60%, #2a2a2c 100%);
  box-shadow: 0 1px 2px rgba(0,0,0,0.8), inset 0 0 3px rgba(0,0,0,0.7);
  z-index: 4;
}

/* ---------- LCD digital readouts ---------- */
.lcd {
  font-family: 'Courier New', monospace;
  color: #6fd0ff;
  filter: drop-shadow(0 0 4px rgba(62,146,204,0.7));
  background: #05141c;
  padding: 2px 6px;
  border-radius: 2px;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,0.4);
  font-size: 11px;
  letter-spacing: 1px;
  position: absolute;
  z-index: 2;
  white-space: nowrap;
}
.lcd-asi { left: 50%; bottom: 16%; transform: translateX(-50%); }
.lcd-alt { right: 13%; top: 50%; transform: translateY(-50%); }
.lcd-dg  { left: 50%; top: 63%; transform: translateX(-50%); }
.lcd-vsi { left: 50%; bottom: 16%; transform: translateX(-50%); }

.gauge-caption {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #8a8a8e;
  text-transform: uppercase;
  font-weight: 700;
}

/* ---------- attitude indicator ---------- */
.ai-horizon {
  position: absolute;
  left: -25%;
  top: -25%;
  width: 150%;
  height: 150%;
  transform-origin: 50% 50%;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}
.ai-sky {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, #2a6cb0 0%, #4a9adb 100%);
}
.ai-ground {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, #6b4a2a 0%, #3a2a1a 100%);
}
.ai-horizon-line {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 2px;
  background: #e6e6ea;
  transform: translateY(-1px);
  box-shadow: 0 0 1px rgba(0,0,0,0.6);
}
.ai-ladder { position: absolute; inset: 0; }
.ai-ladder-mark {
  position: absolute;
  left: 50%;
  width: 22px;
  height: 1px;
  margin-left: -11px;
  background: rgba(255,255,255,0.7);
}
.ai-ladder-mark span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 6px;
  color: #e6e6ea;
  background: rgba(0,0,0,0.25);
  padding: 0 1px;
}
.ai-bank-mark {
  position: absolute;
  left: 50%;
  top: 6%;
  width: 1px;
  height: 7px;
  margin-left: -0.5px;
  background: rgba(255,255,255,0.6);
  transform-origin: 50% calc(50vw);
}
.ai-aircraft {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  z-index: 3;
}
.ai-wing {
  position: absolute;
  top: -1.5px;
  height: 3px;
  width: 26px;
  background: #ffcc00;
  box-shadow: 0 0 2px rgba(0,0,0,0.8);
}
.ai-wing-l { right: 6px; }
.ai-wing-r { left: 6px; }
.ai-dot {
  position: absolute;
  left: -3px;
  top: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffcc00;
  box-shadow: 0 0 2px rgba(0,0,0,0.8);
}
.ai-pointer {
  position: absolute;
  left: 50%;
  top: 4%;
  width: 0;
  height: 0;
  margin-left: -5px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 8px solid #ffcc00;
  z-index: 4;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.6));
}

/* ---------- turn coordinator ---------- */
.tc-aircraft {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-origin: 50% 50%;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
  z-index: 3;
}
.tc-wing {
  position: absolute;
  left: -26px;
  top: -2px;
  width: 52px;
  height: 4px;
  background: #f0f0f4;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
.tc-tail {
  position: absolute;
  left: -1.5px;
  top: -15px;
  width: 3px;
  height: 13px;
  background: #f0f0f4;
  border-radius: 1px;
}
.tc-body {
  position: absolute;
  left: -3px;
  top: -5px;
  width: 6px;
  height: 12px;
  background: #f0f0f4;
  border-radius: 2px;
}
.tc-label {
  position: absolute;
  left: 50%;
  bottom: 16%;
  transform: translateX(-50%);
  font-size: 8px;
  letter-spacing: 1.2px;
  color: #a8a8ac;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  z-index: 2;
}

/* ---------- heading indicator ---------- */
.dg-card {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  transform-origin: 50% 50%;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}
.dg-pointer {
  position: absolute;
  left: 50%;
  top: 3%;
  width: 0;
  height: 0;
  margin-left: -6px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 10px solid #ffcc00;
  z-index: 4;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.6));
}

/* ---------- toggles / knobs / radio ---------- */
.toggle-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.toggle-switch {
  position: relative;
  width: 26px;
  height: 44px;
  background: linear-gradient(180deg, #2a2a2c, #0e0e10);
  border-radius: 4px;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.5);
  border: 1px solid #1a1a1c;
}
.toggle-lever {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 20px;
  margin-left: -4px;
  background: linear-gradient(180deg, #e8e8ec 0%, #b0b0b4 50%, #7a7a7e 100%);
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.5);
  transition: top 0.25s ease;
}
.toggle-lever--up { top: 3px; }
.toggle-lever--down { top: 21px; }
.toggle-label {
  font-size: 9px;
  color: #1c1c1e;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 700;
}

.knob-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.knob {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #6a6a6e 0%, #3a3a3e 55%, #1a1a1c 100%);
  box-shadow: inset 0 0 4px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.15);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: 50% 50%;
}
.knob-pointer {
  position: absolute;
  left: 50%;
  top: 3px;
  width: 2px;
  height: 9px;
  margin-left: -1px;
  background: #f0f0f4;
  border-radius: 1px;
  box-shadow: 0 0 1px rgba(0,0,0,0.8);
}
.knob-label {
  font-size: 9px;
  color: #1c1c1e;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 700;
}

.radio-lcd {
  position: static;
  transform: none;
  font-size: 10px;
  line-height: 1.55;
  letter-spacing: 0.5px;
  min-width: 88px;
  text-align: left;
}
.radio-row { display: flex; justify-content: space-between; gap: 8px; }
.radio-row span { color: #b6ecff; }

/* ---------- demo button ---------- */
.demo-btn {
  margin-left: auto;
  padding: 10px 18px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #05141c;
  background: linear-gradient(180deg, #5ec5ff, #2a8fd0);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 0 #1a5f8a, 0 3px 8px rgba(0,0,0,0.5);
  transition: transform 0.08s ease, box-shadow 0.08s ease, filter 0.15s ease;
}
.demo-btn:hover:not(:disabled) { filter: brightness(1.08); }
.demo-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 0 0 #1a5f8a, 0 1px 2px rgba(0,0,0,0.5);
}
.demo-btn:disabled {
  opacity: 0.55;
  cursor: default;
  filter: grayscale(0.4);
}
.demo-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* ---------- detail card ---------- */
.detail-area { min-height: 92px; }
.detail-card {
  background: #0e0e10;
  border: 1px solid #232328;
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: inset 0 0 22px rgba(0,0,0,0.6);
}
.detail-card--empty {
  color: #6a6a6e;
  font-size: 13px;
  text-align: center;
  padding: 26px 18px;
}
.detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.detail-title {
  font-size: 15px;
  font-weight: 600;
  color: #e6e6ea;
  margin: 0;
}
.detail-cat {
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8a8a8e;
  border: 1px solid #2a2a2c;
  padding: 2px 7px;
  border-radius: 3px;
}
.detail-text {
  font-size: 13px;
  color: #a8a8ac;
  line-height: 1.5;
  margin: 0;
}

/* ---------- footer ---------- */
.cockpit-footer {
  margin-top: auto;
  padding: 14px 16px;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: #4a4a4e;
  border-top: 1px solid #1a1a1c;
  background: #060607;
}

@media (max-width: 560px) {
  .panel-brushed { gap: 12px; }
  .demo-btn { margin-left: 0; width: 100%; }
}
`
