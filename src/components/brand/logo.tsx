import { cn } from "@/lib/utils";

/**
 * FlightCourse Academy mark — a refined attitude indicator (artificial
 * horizon). Designed with premium logo principles: simplicity, strong
 * negative space, balanced proportions, scalability.
 *
 * The mark is a circle (the instrument bezel) containing a tilted horizon
 * (sky/ground split), a bank-angle scale, and a minimal aircraft symbol.
 * Reads as both an attitude indicator AND an abstract "course being flown."
 */
export function LogoMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-9", animated && "logo-draw", className)}
    >
      <defs>
        <clipPath id="fc-dial">
          <circle cx="20" cy="20" r="13" />
        </clipPath>
        <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.10 235)" />
          <stop offset="100%" stopColor="oklch(0.38 0.07 245)" />
        </linearGradient>
        <linearGradient id="fc-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.42 0.05 60)" />
          <stop offset="100%" stopColor="oklch(0.26 0.04 55)" />
        </linearGradient>
        <linearGradient id="fc-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.38 0.03 255)" />
          <stop offset="50%" stopColor="oklch(0.22 0.02 255)" />
          <stop offset="100%" stopColor="oklch(0.15 0.02 255)" />
        </linearGradient>
        <radialGradient id="fc-glass" cx="35%" cy="25%" r="60%">
          <stop offset="0%" stopColor="oklch(0.99 0.01 250 / 15%)" />
          <stop offset="100%" stopColor="oklch(0.99 0.01 250 / 0%)" />
        </radialGradient>
      </defs>

      {/* Outer bezel ring — premium gradient */}
      <circle cx="20" cy="20" r="16" fill="url(#fc-bezel)" />
      <circle cx="20" cy="20" r="14.5" fill="oklch(0.10 0.02 255)" />

      {/* Dial face — clipped to inner circle */}
      <g clipPath="url(#fc-dial)">
        {/* Sky */}
        <rect x="0" y="0" width="40" height="40" fill="url(#fc-sky)" />
        {/* Ground — tilted like a banking turn */}
        <path d="M-6 26 L46 14 L46 46 L-6 46 Z" fill="url(#fc-ground)" />
        {/* Horizon line — the signature element, clean white */}
        <path
          d="M-6 26 L46 14"
          stroke="oklch(0.97 0.01 250)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Pitch ladder — minimal, 2 lines only */}
        <path d="M0 22 L8 20.5 M0 30 L8 28.5" stroke="oklch(0.97 0.01 250 / 35%)" strokeWidth="0.5" strokeLinecap="round" />
      </g>

      {/* Glass reflection */}
      <circle cx="20" cy="20" r="13" fill="url(#fc-glass)" />

      {/* Bank-angle scale — minimal, only 0° + ±30° marks */}
      <g stroke="oklch(0.97 0.01 250 / 45%)" strokeLinecap="round">
        <line x1="20" y1="6" x2="20" y2="8.5" strokeWidth="1" />
        <path d="M7.5 16 L8.5 14.5 L9.5 16" strokeWidth="0.7" fill="none" />
        <path d="M30.5 16 L31.5 14.5 L32.5 16" strokeWidth="0.7" fill="none" />
      </g>

      {/* Bank pointer — amber triangle at top */}
      <path d="M20 5 L18.5 7.5 L21.5 7.5 Z" fill="oklch(0.79 0.152 74)" />

      {/* Inner bezel ring — subtle */}
      <circle cx="20" cy="20" r="13" stroke="oklch(0.99 0.01 250 / 15%)" strokeWidth="0.5" fill="none" />

      {/* Aircraft symbol — minimal, elegant. Center dot + two swept wings */}
      <g stroke="oklch(0.79 0.152 74)" strokeWidth="2" strokeLinecap="round" fill="oklch(0.79 0.152 74)">
        {/* Wings — slightly swept, climbing */}
        <line x1="11" y1="22.5" x2="17" y2="21.5" />
        <line x1="23" y1="20.5" x2="29" y2="19.5" />
        {/* Center dot — the aircraft reference */}
        <circle cx="20" cy="21" r="1.8" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
  animated = false,
}: {
  className?: string;
  showText?: boolean;
  animated?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark animated={animated} className={animated ? "logo-draw" : undefined} />
      {showText ? (
        <span className="flex flex-col leading-none gap-[3px]">
          <span className="text-[1.1rem] font-semibold tracking-[-0.025em]">
            FlightCourse
          </span>
          <span className="font-mono text-[0.48rem] uppercase tracking-[0.22em] text-muted-foreground font-medium">
            Academy
          </span>
        </span>
      ) : null}
    </span>
  );
}
