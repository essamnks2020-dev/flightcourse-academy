import { cn } from "@/lib/utils";

/**
 * FlightCourse Academy mark — a detailed attitude indicator (artificial
 * horizon). The dial shows a sky/ground split, a bank-angle scale with tick
 * marks, pitch ladder lines, and a climbing aircraft symbol in amber. The
 * horizon line doubles as a rising flight path — "course" being flown.
 *
 * Clean SVG, no animation, one metaphor. Detailed enough to read as a real
 * instrument at small sizes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-9", className)}
    >
      <defs>
        <clipPath id="fc-dial">
          <circle cx="20" cy="20" r="14" />
        </clipPath>
        <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.11 232)" />
          <stop offset="100%" stopColor="oklch(0.44 0.08 244)" />
        </linearGradient>
        <linearGradient id="fc-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.44 0.06 60)" />
          <stop offset="100%" stopColor="oklch(0.28 0.045 55)" />
        </linearGradient>
        <linearGradient id="fc-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.4 0.03 255)" />
          <stop offset="50%" stopColor="oklch(0.25 0.02 255)" />
          <stop offset="100%" stopColor="oklch(0.18 0.02 255)" />
        </linearGradient>
      </defs>

      {/* Outer bezel ring */}
      <circle cx="20" cy="20" r="15.5" fill="url(#fc-bezel)" />
      <circle cx="20" cy="20" r="14.5" fill="oklch(0.12 0.02 255)" />

      {/* Dial face — clipped to inner circle */}
      <g clipPath="url(#fc-dial)">
        {/* Sky */}
        <rect x="0" y="0" width="40" height="40" fill="url(#fc-sky)" />
        {/* Ground — tilted like a banking turn */}
        <path d="M-6 27 L46 13 L46 46 L-6 46 Z" fill="url(#fc-ground)" />
        {/* Horizon line — white, the signature element */}
        <path
          d="M-6 27 L46 13"
          stroke="oklch(0.97 0.01 250)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Pitch ladder — short lines parallel to horizon */}
        <path
          d="M-2 23 L6 21.2 M-2 31 L6 29.2"
          stroke="oklch(0.97 0.01 250 / 45%)"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
        <path
          d="M34 18.8 L42 17 M34 25.8 L42 24"
          stroke="oklch(0.97 0.01 250 / 45%)"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
      </g>

      {/* Bank-angle scale — tick marks around the top of the dial */}
      <g stroke="oklch(0.97 0.01 250 / 55%)" strokeWidth="0.8" strokeLinecap="round">
        {/* Center top (0°) — longer */}
        <line x1="20" y1="5.5" x2="20" y2="8" strokeWidth="1.1" />
        {/* ±10° */}
        <line x1="13.2" y1="7" x2="13.8" y2="9.2" />
        <line x1="26.8" y1="7" x2="26.2" y2="9.2" />
        {/* ±20° */}
        <line x1="8" y1="10.8" x2="9" y2="12.6" />
        <line x1="32" y1="10.8" x2="31" y2="12.6" />
        {/* ±30° (triangle pointers) */}
        <path d="M5 16 L6.2 14.4 L7.4 16 Z" fill="oklch(0.97 0.01 250 / 55%)" stroke="none" />
        <path d="M35 16 L33.8 14.4 L32.6 16 Z" fill="oklch(0.97 0.01 250 / 55%)" stroke="none" />
      </g>

      {/* Bank pointer triangle at top center — fixed reference */}
      <path d="M20 4.5 L18.3 6.8 L21.7 6.8 Z" fill="oklch(0.79 0.152 74)" />

      {/* Inner bezel ring */}
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="oklch(0.99 0.01 250 / 22%)"
        strokeWidth="0.8"
        fill="none"
      />

      {/* Aircraft symbol — center dot + swept wings + tail, in amber */}
      <g stroke="oklch(0.79 0.152 74)" strokeWidth="1.8" strokeLinecap="round" fill="oklch(0.79 0.152 74)">
        {/* Wings — extend left and right from center, slightly swept up (climbing) */}
        <line x1="10.5" y1="22.5" x2="16" y2="21.5" />
        <line x1="24" y1="20.5" x2="29.5" y2="19.5" />
        {/* Tail — small vertical stabilizer suggestion */}
        <line x1="20" y1="22" x2="20" y2="24.5" strokeWidth="1.4" />
        {/* Center dot — the aircraft reference */}
        <circle cx="20" cy="21.5" r="1.4" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {showText ? (
        <span className="flex flex-col leading-none">
          <span className="text-[0.95rem] font-semibold tracking-tight">
            FlightCourse
          </span>
          <span className="label-instrument text-muted-foreground text-[0.5625rem]">
            Academy
          </span>
        </span>
      ) : null}
    </span>
  );
}
