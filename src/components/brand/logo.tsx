import { cn } from "@/lib/utils";

/**
 * FlightCourse Academy mark — an attitude indicator (artificial horizon)
 * whose horizon line doubles as a rising flight path. Reads as both an
 * instrument and a "course" being flown. Clean, no animation, one metaphor.
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
          <circle cx="20" cy="20" r="15" />
        </clipPath>
        <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.11 232)" />
          <stop offset="100%" stopColor="oklch(0.42 0.08 244)" />
        </linearGradient>
        <linearGradient id="fc-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.42 0.06 60)" />
          <stop offset="100%" stopColor="oklch(0.28 0.045 55)" />
        </linearGradient>
      </defs>

      {/* Dial face, tilted like a banking turn */}
      <g clipPath="url(#fc-dial)">
        <rect x="0" y="0" width="40" height="40" fill="url(#fc-sky)" />
        <path d="M-6 26 L46 14 L46 46 L-6 46 Z" fill="url(#fc-ground)" />
        <path
          d="M-6 26 L46 14"
          stroke="oklch(0.97 0.01 250)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* Bezel */}
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke="oklch(0.99 0.01 250 / 30%)"
        strokeWidth="2"
      />

      {/* Aircraft symbol in amber, climbing along the horizon */}
      <path
        d="M11 22.5 L18.5 22.5 M21.5 21.5 L29 19.5"
        stroke="oklch(0.79 0.152 74)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="22" r="1.9" fill="oklch(0.79 0.152 74)" />
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
