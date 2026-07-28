"use client";

import { motion } from "framer-motion";

interface GaugeRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
  showTicks?: boolean;
  animate?: boolean;
}

/** Circular progress ring styled like an instrument gauge with tick marks. */
export function GaugeRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = "var(--color-primary)",
  trackColor = "color-mix(in srgb, var(--color-primary) 15%, transparent)",
  showTicks = true,
  animate = true,
}: GaugeRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (clampedValue / 100) * circumference;
  const center = size / 2;

  const ticks = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * 360 - 90;
    const isMajor = i % 5 === 0;
    const innerR = radius - strokeWidth / 2 - (isMajor ? 6 : 3);
    const outerR = radius - strokeWidth / 2 - 1;
    const rad = (angle * Math.PI) / 180;
    return {
      x1: center + innerR * Math.cos(rad),
      y1: center + innerR * Math.sin(rad),
      x2: center + outerR * Math.cos(rad),
      y2: center + outerR * Math.sin(rad),
      major: isMajor,
    };
  });

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {showTicks &&
          ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="oklch(0.99 0.01 250 / 22%)"
              strokeWidth={t.major ? 1.5 : 0.75}
            />
          ))}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="nums text-xl font-semibold leading-none sm:text-2xl">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="label-instrument mt-1.5 text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
