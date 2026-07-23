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

/** Circular progress ring styled like an instrument gauge with tick marks */
export function GaugeRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = "var(--color-sky)",
  trackColor = "color-mix(in srgb, var(--color-sky) 15%, transparent)",
  showTicks = true,
  animate = true,
}: GaugeRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (clampedValue / 100) * circumference;
  const center = size / 2;

  // Tick marks around the ring
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
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Tick marks */}
        {showTicks &&
          ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="color-mix(in srgb, var(--color-slate) 40%, transparent)"
              strokeWidth={t.major ? 1.5 : 0.75}
            />
          ))}
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
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
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="font-heading font-bold text-xl sm:text-2xl leading-none">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
