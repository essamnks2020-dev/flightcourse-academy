'use client'

import * as React from 'react'
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ComposedChart,
} from 'recharts'
import type { Attempt } from '@/lib/aviation'

/**
 * TelemetryChart — visualizes the recorded flight telemetry so the pilot can
 * *see* what happened, not just read numbers. Shows altitude + airspeed vs
 * time, with the flare-input window and touchdown point marked directly on
 * the chart. (§2.2)
 *
 * Uses recharts (already installed, previously unused). Single YAxis to keep
 * it simple and avoid multi-axis edge cases.
 */
export function TelemetryChart({ attempt }: { attempt: Attempt }) {
  const tel = attempt.telemetry
  if (!tel || tel.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-black/20 text-xs text-muted-foreground">
        Not enough telemetry data for a chart.
      </div>
    )
  }

  const flareStart = tel.findIndex((f) => f.flare)
  const touchdownIdx = tel.findIndex((f) => f.onGround)

  const data = tel.map((f, i) => ({
    idx: i,
    t: +(f.t / 1000).toFixed(1),
    alt: Math.max(0, Math.round(f.altitude)),
    spd: Math.round(f.airspeed),
  }))

  return (
    <div className="rounded-lg border border-border bg-black/30 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Telemetry · altitude (ft) & airspeed (kt) vs time
        </span>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded bg-accent" /> Alt
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded bg-primary" /> Spd
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 9, fill: '#5f7a99' }}
            stroke="rgba(255,255,255,0.1)"
          />
          <YAxis
            domain={[0, 120]}
            tick={{ fontSize: 9, fill: '#5f7a99' }}
            stroke="rgba(255,255,255,0.1)"
          />
          <Tooltip
            contentStyle={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '11px',
            }}
            labelStyle={{ color: '#8aa3c4' }}
          />
          {flareStart >= 0 && (
            <ReferenceLine
              x={data[flareStart].t}
              stroke="var(--primary)"
              strokeOpacity={0.5}
              strokeDasharray="3 3"
              label={{ value: 'FLARE', fontSize: 8, fill: 'var(--primary)', position: 'top' }}
            />
          )}
          {touchdownIdx >= 0 && (
            <ReferenceLine
              x={data[touchdownIdx].t}
              stroke="var(--destructive)"
              strokeOpacity={0.6}
              label={{ value: 'TD', fontSize: 8, fill: 'var(--destructive)', position: 'top' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="alt"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="spd"
            stroke="var(--primary)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
