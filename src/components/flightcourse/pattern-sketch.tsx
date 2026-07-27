"use client";

import * as React from "react";
import type { MapKind } from "@/lib/scenarios";

interface Props {
  kind: MapKind;
  runway: string;
  className?: string;
}

const VB_W = 360;
const VB_H = 240;

/** Small Cessna-style aircraft glyph pointing in a heading (deg, 0 = right). */
function Aircraft({
  x,
  y,
  heading = 0,
  color = "#F2B134",
  size = 16,
}: {
  x: number;
  y: number;
  heading?: number;
  color?: string;
  size?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${heading})`}>
      <path
        d={`M${size} 0 L${-size * 0.5} ${size * 0.45} L${-size * 0.5} ${-size * 0.45} Z`}
        fill={color}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1"
      />
      <rect
        x={-size * 0.62}
        y={-size * 0.16}
        width={size * 0.34}
        height={size * 0.32}
        rx={size * 0.1}
        fill={color}
      />
      <rect
        x={-size * 0.05}
        y={-size * 0.9}
        width={size * 0.1}
        height={size * 0.55}
        fill={color}
      />
      <rect
        x={-size * 0.05}
        y={size * 0.35}
        width={size * 0.1}
        height={size * 0.5}
        fill={color}
      />
    </g>
  );
}

function Runway({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y - 8} width={w} height={16} rx={3} fill="#1A3866" stroke="#3E92CC" strokeWidth="1.5" />
      <line x1={x + 6} y1={y} x2={x + w - 6} y2={y} stroke="#6FB4DE" strokeWidth="1" strokeDasharray="6 6" />
      <text x={x + w / 2} y={y - 14} textAnchor="middle" fontSize="11" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">
        RWY {label}
      </text>
    </g>
  );
}

export function PatternSketch({ kind, runway, className }: Props) {
  const stroke = "#3E92CC";
  const dim = "rgba(111,180,222,0.55)";
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={className}
      role="img"
      aria-label={`Position sketch: ${kind}`}
    >
      <defs>
        <linearGradient id="sk-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A1730" />
          <stop offset="1" stopColor="#081227" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#sk-bg)" rx="10" />

      {kind === "downwind" && (
        <g>
          <Runway x={70} y={150} w={220} label={runway} />
          <path d="M70 110 L290 110 L290 150" fill="none" stroke={dim} strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M70 150 L70 110" fill="none" stroke={dim} strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="180" y="100" textAnchor="middle" fontSize="10" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">DOWNWIND</text>
          <Aircraft x={180} y={110} heading={180} />
        </g>
      )}

      {kind === "pattern-entry-45" && (
        <g>
          <Runway x={70} y={150} w={220} label={runway} />
          <path d="M40 210 L120 110 L290 110" fill="none" stroke={stroke} strokeWidth="1.8" strokeDasharray="5 4" />
          <text x="70" y="200" fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">45° ENTRY</text>
          <text x="180" y="100" textAnchor="middle" fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">DOWNWIND</text>
          <Aircraft x={70} y={185} heading={315} />
        </g>
      )}

      {kind === "ground-taxi" && (
        <g>
          <Runway x={120} y={60} w={180} label={runway} />
          <rect x={24} y={150} width={90} height={60} rx={4} fill="rgba(62,146,204,0.10)" stroke={dim} />
          <text x={69} y={184} textAnchor="middle" fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">RAMP</text>
          <path d="M70 150 L70 110 L120 110" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          <text x={40} y={130} fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">A</text>
          <Aircraft x={70} y={170} heading={0} />
        </g>
      )}

      {kind === "runway-hold" && (
        <g>
          <Runway x={40} y={120} w={280} label={runway} />
          <line x1={120} y1={140} x2={120} y2={170} stroke="#F2B134" strokeWidth="3" />
          <text x={120} y={186} textAnchor="middle" fontSize="9" fill="#F2B134" fontFamily="JetBrains Mono, monospace">HOLD SHORT</text>
          <Aircraft x={120} y={160} heading={0} />
        </g>
      )}

      {kind === "approach" && (
        <g>
          <Runway x={70} y={150} w={220} label={runway} />
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0 0 L6 4 L0 8 Z" fill={stroke} />
            </marker>
          </defs>
          <path d="M180 215 L180 150" fill="none" stroke={stroke} strokeWidth="1.8" strokeDasharray="5 4" markerEnd="url(#arrow)" />
          <text x="190" y="210" fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">10 NM, 2500 ft</text>
          <Aircraft x={180} y={210} heading={0} />
        </g>
      )}

      {kind === "emergency" && (
        <g>
          <Runway x={70} y={150} w={220} label={runway} />
          <path d="M180 60 L180 140" fill="none" stroke="#ef5b5b" strokeWidth="1.8" strokeDasharray="5 4" />
          <text x="190" y="90" fontSize="10" fill="#ef5b5b" fontFamily="JetBrains Mono, monospace" fontWeight="700">MAYDAY</text>
          <text x="190" y="104" fontSize="8" fill="#ef5b5b" fontFamily="JetBrains Mono, monospace">ENGINE OUT</text>
          <Aircraft x={180} y={60} heading={0} color="#ef5b5b" />
        </g>
      )}

      {kind === "radio-check" && (
        <g>
          <Runway x={70} y={150} w={220} label={runway} />
          <g transform="translate(180 90)">
            {[14, 22, 30].map((r, i) => (
              <circle key={r} r={r} fill="none" stroke="#5BFF9B" strokeWidth="1.5" opacity={0.6 - i * 0.15}>
                <animate attributeName="r" from="10" to="34" dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
          <text x="180" y="60" textAnchor="middle" fontSize="9" fill="#5BFF9B" fontFamily="JetBrains Mono, monospace">RADIO CHECK</text>
          <Aircraft x={180} y={90} heading={0} color="#5BFF9B" />
        </g>
      )}

      {kind === "flight-following" && (
        <g>
          <circle cx="290" cy="60" r="26" fill="none" stroke={dim} strokeWidth="1" />
          <circle cx="290" cy="60" r="16" fill="none" stroke={dim} strokeWidth="1" />
          <g transform="translate(290 60)">
            <line x1="0" y1="0" x2="26" y2="0" stroke="#5BFF9B" strokeWidth="1.5">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.4s" repeatCount="indefinite" />
            </line>
          </g>
          <text x="290" y="100" textAnchor="middle" fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">CENTER</text>
          <path d="M120 200 L260 80" fill="none" stroke={stroke} strokeWidth="1.4" strokeDasharray="5 5" />
          <text x="70" y="210" fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">→ ROCHESTER</text>
          <Aircraft x={130} y={190} heading={330} />
        </g>
      )}

      {kind === "runway-crossing" && (
        <g>
          <Runway x={40} y={60} w={280} label={runway} />
          <Runway x={40} y={150} w={280} label="23" />
          <path d="M150 180 L150 70" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          <text x={120} y={200} fontSize="9" fill="#6FB4DE" fontFamily="JetBrains Mono, monospace">A</text>
          <Aircraft x={150} y={120} heading={0} />
        </g>
      )}

      <text x={VB_W - 10} y={VB_H - 8} textAnchor="end" fontSize="8" fill="rgba(111,180,222,0.4)" fontFamily="JetBrains Mono, monospace">
        not to scale
      </text>
    </svg>
  );
}
