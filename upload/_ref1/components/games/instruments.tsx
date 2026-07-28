import type { InstrumentSpec } from "@/lib/games/generators"
import { cn } from "@/lib/utils"

/**
 * Live analogue instruments, drawn to scale so the reading skill transfers to
 * the real panel. All five share one 200x200 viewBox and one bezel.
 */

const FACE = "oklch(0.13 0.02 254)"
const TICK = "oklch(0.95 0.006 250)"
const DIM = "oklch(0.68 0.024 250)"
const NEEDLE = "oklch(0.97 0.008 250)"
const BRAND = "oklch(0.79 0.152 74)"

function Bezel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <circle cx="100" cy="100" r="99" fill="oklch(0.24 0.028 253)" />
      <circle
        cx="100"
        cy="100"
        r="93"
        fill={FACE}
        stroke="oklch(0.99 0.01 250 / 14%)"
        strokeWidth="2"
      />
      {children}
      <circle cx="100" cy="100" r="6" fill="oklch(0.3 0.03 253)" />
    </>
  )
}

/** Point at `angle` degrees clockwise from 12 o'clock, `r` from the centre. */
function polar(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) }
}

function Tick({
  angle,
  inner,
  outer,
  width = 2,
  color = TICK,
}: {
  angle: number
  inner: number
  outer: number
  width?: number
  color?: string
}) {
  const a = polar(angle, inner)
  const b = polar(angle, outer)
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
    />
  )
}

function DialLabel({
  angle,
  r,
  children,
  size = 15,
}: {
  angle: number
  r: number
  children: React.ReactNode
  size?: number
}) {
  const p = polar(angle, r)
  return (
    <text
      x={p.x}
      y={p.y}
      fill={TICK}
      fontSize={size}
      fontWeight="600"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="var(--font-mono), monospace"
    >
      {children}
    </text>
  )
}

function Needle({
  angle,
  length,
  width,
  tail = 14,
  color = NEEDLE,
}: {
  angle: number
  length: number
  width: number
  tail?: number
  color?: string
}) {
  return (
    <g transform={`rotate(${angle} 100 100)`}>
      <path
        d={`M ${100 - width / 2} ${100 + tail} L ${100 - width / 2} ${
          100 - length + 8
        } L 100 ${100 - length} L ${100 + width / 2} ${100 - length + 8} L ${
          100 + width / 2
        } ${100 + tail} Z`}
        fill={color}
      />
    </g>
  )
}

/* -------------------------------------------------------------------------- */

function Altimeter({ altitude }: { altitude: number }) {
  const hundreds = ((altitude % 1000) / 1000) * 360
  const thousands = ((altitude % 10000) / 10000) * 360
  return (
    <Bezel>
      {Array.from({ length: 50 }, (_, i) => i * 7.2).map((a) => (
        <Tick
          key={a}
          angle={a}
          inner={a % 36 === 0 ? 68 : 76}
          outer={84}
          width={a % 36 === 0 ? 3 : 1.4}
          color={a % 36 === 0 ? TICK : DIM}
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => i).map((i) => (
        <DialLabel key={i} angle={i * 36} r={56}>
          {i}
        </DialLabel>
      ))}
      <text
        x="100"
        y="146"
        fill={DIM}
        fontSize="10"
        textAnchor="middle"
        letterSpacing="2"
        fontFamily="var(--font-mono), monospace"
      >
        ALT 100 FEET
      </text>
      {/* Thousands: short, fat. Hundreds: long, thin. */}
      <Needle angle={thousands} length={48} width={11} />
      <Needle angle={hundreds} length={80} width={6} />
    </Bezel>
  )
}

function HeadingIndicator({ heading }: { heading: number }) {
  const cardinal: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "W" }
  return (
    <Bezel>
      <g transform={`rotate(${-heading} 100 100)`}>
        {Array.from({ length: 72 }, (_, i) => i * 5).map((a) => (
          <Tick
            key={a}
            angle={a}
            inner={a % 30 === 0 ? 68 : a % 10 === 0 ? 74 : 78}
            outer={84}
            width={a % 30 === 0 ? 3 : 1.4}
            color={a % 30 === 0 ? TICK : DIM}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
          <g key={a} transform={`rotate(${a} 100 100)`}>
            <g transform={`rotate(${-a} ${polar(a, 55).x} ${polar(a, 55).y})`}>
              <DialLabel angle={a} r={55} size={cardinal[a] ? 19 : 15}>
                {cardinal[a] ?? a / 10}
              </DialLabel>
            </g>
          </g>
        ))}
      </g>
      {/* Fixed aircraft symbol + lubber line. */}
      <path d="M100 6 L94 18 L106 18 Z" fill={BRAND} />
      <path
        d="M100 82 L100 122 M76 100 L124 100 M88 118 L112 118"
        stroke={BRAND}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Bezel>
  )
}

function Airspeed({ knots }: { knots: number }) {
  // 0-200 kt over a full turn: 1.8° per knot.
  const angle = knots * 1.8
  return (
    <Bezel>
      {/* Green arc (normal operating range 48-129 kt). */}
      <path
        d={`M ${polar(48 * 1.8, 80).x} ${polar(48 * 1.8, 80).y} A 80 80 0 ${
          (129 - 48) * 1.8 > 180 ? 1 : 0
        } 1 ${polar(129 * 1.8, 80).x} ${polar(129 * 1.8, 80).y}`}
        stroke="oklch(0.73 0.152 155)"
        strokeWidth="7"
        fill="none"
      />
      {/* Yellow caution arc, then the red line. */}
      <path
        d={`M ${polar(129 * 1.8, 80).x} ${polar(129 * 1.8, 80).y} A 80 80 0 0 1 ${
          polar(158 * 1.8, 80).x
        } ${polar(158 * 1.8, 80).y}`}
        stroke="oklch(0.82 0.15 90)"
        strokeWidth="7"
        fill="none"
      />
      <Tick angle={158 * 1.8} inner={74} outer={86} width={4} color="oklch(0.62 0.208 26)" />

      {Array.from({ length: 40 }, (_, i) => i * 5).map((v) => (
        <Tick
          key={v}
          angle={v * 1.8}
          inner={v % 20 === 0 ? 64 : 72}
          outer={v % 20 === 0 ? 74 : 74}
          width={v % 20 === 0 ? 3 : 1.4}
          color={v % 20 === 0 ? TICK : DIM}
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => i * 20).map((v) => (
        <DialLabel key={v} angle={v * 1.8} r={52}>
          {v}
        </DialLabel>
      ))}
      <text
        x="100"
        y="150"
        fill={DIM}
        fontSize="10"
        textAnchor="middle"
        letterSpacing="2"
        fontFamily="var(--font-mono), monospace"
      >
        KNOTS
      </text>
      <Needle angle={angle} length={78} width={7} />
    </Bezel>
  )
}

function Attitude({ pitch, bank }: { pitch: number; bank: number }) {
  const pxPerDeg = 2.6
  return (
    <>
      <circle cx="100" cy="100" r="99" fill="oklch(0.24 0.028 253)" />
      <defs>
        <clipPath id="ai-face">
          <circle cx="100" cy="100" r="86" />
        </clipPath>
      </defs>
      <g clipPath="url(#ai-face)">
        <g transform={`rotate(${-bank} 100 100)`}>
          <g transform={`translate(0 ${pitch * pxPerDeg})`}>
            <rect x="-120" y="-160" width="440" height="260" fill="oklch(0.55 0.11 232)" />
            <rect x="-120" y="100" width="440" height="300" fill="oklch(0.38 0.055 58)" />
            <line x1="-120" y1="100" x2="320" y2="100" stroke={TICK} strokeWidth="2.5" />
            {[-20, -10, 10, 20].map((p) => (
              <g key={p}>
                <line
                  x1={100 - (Math.abs(p) === 10 ? 26 : 16)}
                  y1={100 - p * pxPerDeg}
                  x2={100 + (Math.abs(p) === 10 ? 26 : 16)}
                  y2={100 - p * pxPerDeg}
                  stroke={TICK}
                  strokeWidth="1.6"
                />
              </g>
            ))}
          </g>
        </g>
        {/* Bank scale on the bezel. */}
        {[-45, -30, -20, -10, 0, 10, 20, 30, 45].map((a) => (
          <Tick
            key={a}
            angle={a}
            inner={a === 0 ? 74 : 78}
            outer={86}
            width={a % 30 === 0 || a === 0 ? 3 : 1.6}
            color={a === 0 ? BRAND : TICK}
          />
        ))}
      </g>
      {/* Sky pointer: rotates with the bank, sits just inside the scale. */}
      <g transform={`rotate(${bank} 100 100)`}>
        <path d="M100 22 L93 34 L107 34 Z" fill={BRAND} />
      </g>
      {/* Fixed aircraft symbol. */}
      <path
        d="M60 100 L86 100 M114 100 L140 100 M100 100 L100 100"
        stroke={BRAND}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="3.6" fill={BRAND} />
      <circle
        cx="100"
        cy="100"
        r="93"
        fill="none"
        stroke="oklch(0.99 0.01 250 / 14%)"
        strokeWidth="2"
      />
    </>
  )
}

function Vsi({ fpm }: { fpm: number }) {
  // ±2000 fpm mapped over ±170°, zero at 9 o'clock (270°).
  const angle = 270 + (fpm / 2000) * 170
  return (
    <Bezel>
      {[-2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000].map((v) => (
        <Tick
          key={v}
          angle={270 + (v / 2000) * 170}
          inner={v % 1000 === 0 ? 66 : 74}
          outer={84}
          width={v % 1000 === 0 ? 3 : 1.6}
          color={v % 1000 === 0 ? TICK : DIM}
        />
      ))}
      {[-2, -1, 0, 1, 2].map((v) => (
        <DialLabel key={v} angle={270 + ((v * 1000) / 2000) * 170} r={52}>
          {Math.abs(v)}
        </DialLabel>
      ))}
      <text
        x="118"
        y="72"
        fill={DIM}
        fontSize="9"
        letterSpacing="1.5"
        fontFamily="var(--font-mono), monospace"
      >
        UP
      </text>
      <text
        x="118"
        y="136"
        fill={DIM}
        fontSize="9"
        letterSpacing="1.5"
        fontFamily="var(--font-mono), monospace"
      >
        DOWN
      </text>
      <text
        x="100"
        y="160"
        fill={DIM}
        fontSize="9"
        textAnchor="middle"
        letterSpacing="1.5"
        fontFamily="var(--font-mono), monospace"
      >
        100 FT/MIN
      </text>
      <Needle angle={angle} length={78} width={6} />
    </Bezel>
  )
}

/* -------------------------------------------------------------------------- */

const titles: Record<InstrumentSpec["kind"], string> = {
  altimeter: "Altimeter",
  heading: "Heading indicator",
  airspeed: "Airspeed indicator",
  attitude: "Attitude indicator",
  vsi: "Vertical speed indicator",
}

export function Instrument({
  spec,
  className,
}: {
  spec: InstrumentSpec
  className?: string
}) {
  return (
    <figure className={cn("flex flex-col items-center gap-3", className)}>
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${titles[spec.kind]} — read the indication`}
        className="size-52 shrink-0 drop-shadow-[0_10px_30px_oklch(0_0_0/45%)] sm:size-60"
      >
        {spec.kind === "altimeter" ? <Altimeter altitude={spec.altitude} /> : null}
        {spec.kind === "heading" ? <HeadingIndicator heading={spec.heading} /> : null}
        {spec.kind === "airspeed" ? <Airspeed knots={spec.knots} /> : null}
        {spec.kind === "attitude" ? (
          <Attitude pitch={spec.pitch} bank={spec.bank} />
        ) : null}
        {spec.kind === "vsi" ? <Vsi fpm={spec.fpm} /> : null}
      </svg>
      <figcaption className="label-instrument text-muted-foreground">
        {titles[spec.kind]}
      </figcaption>
    </figure>
  )
}
