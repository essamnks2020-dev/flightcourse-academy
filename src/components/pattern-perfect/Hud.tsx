"use client";

import { motion } from "framer-motion";
import { Gauge, Compass, Wind, Plane, Radio, AlertTriangle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LegName } from "@/lib/pattern/types";

export interface HudData {
  altitudeFt: number;
  airspeedKt: number;
  headingDeg: number;
  verticalSpeedFpm: number;
  leg: LegName;
  minSeparationFt: number;
  status: "safe" | "warn" | "critical";
  nextCallLabel: string | null;
  flightTimeSec: number;
  callsign: string;
  windLabel: string;
  windFromDeg: number;
}

const LEG_LABELS: Record<LegName, string> = {
  entry: "Entry",
  downwind: "Downwind",
  base: "Base",
  final: "Final",
  rollout: "Rollout",
};

const LEG_COLORS: Record<LegName, string> = {
  entry: "text-sky",
  downwind: "text-sky",
  base: "text-gold",
  final: "text-gold",
  rollout: "text-muted-foreground",
};

export function Hud({ data }: { data: HudData }) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* Screen-reader live region: announces leg changes + spacing status so a
          low-vision learner isn't locked out of the core feedback loop. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Leg: {LEG_LABELS[data.leg]}. Altitude {Math.round(data.altitudeFt)} feet.{" "}
        {data.status === "critical"
          ? `Near miss, ${Math.round(data.minSeparationFt)} feet from traffic.`
          : data.status === "warn"
            ? `Traffic warning, ${Math.round(data.minSeparationFt)} feet.`
            : "Traffic clear."}
        {data.nextCallLabel ? `Next radio call: ${data.nextCallLabel}.` : ""}
      </div>
      {/* Callsign chip (top-center) */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute left-1/2 top-3 -translate-x-1/2"
      >
        <Badge variant="outline" className="glass-strong border-sky/40 px-3 py-1 font-mono text-xs text-foreground">
          {data.callsign}
        </Badge>
      </motion.div>

      {/* Instrument cluster (top-left) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute left-3 top-12 flex flex-col gap-2"
      >
        <Instrument icon={<Gauge className="h-3.5 w-3.5" />} label="ALT" value={`${Math.round(data.altitudeFt)}`} unit="ft" />
        <Instrument icon={<Plane className="h-3.5 w-3.5" />} label="SPD" value={`${Math.round(data.airspeedKt)}`} unit="kt" />
        <Instrument icon={<Compass className="h-3.5 w-3.5" />} label="HDG" value={String(Math.round(data.headingDeg)).padStart(3, "0")} unit="°" />
      </motion.div>

      {/* Wind compass + leg + timer (top-right) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="absolute right-3 top-12 flex flex-col items-end gap-2"
      >
        <WindCompass fromDeg={data.windFromDeg} label={data.windLabel} />
        <motion.div
          key={data.leg}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Badge className={`glass-strong border border-sky/40 font-mono ${LEG_COLORS[data.leg]}`}>
            {LEG_LABELS[data.leg]}
          </Badge>
        </motion.div>
        <div className="glass flex items-center gap-1.5 rounded-md px-2 py-1 text-xs">
          <Timer className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-muted-foreground">{formatTime(data.flightTimeSec)}</span>
        </div>
      </motion.div>

      {/* Bottom-center: next call + spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="absolute bottom-20 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-3"
      >
        {data.nextCallLabel && (
          <motion.div
            key={data.nextCallLabel}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-gold flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs"
          >
            <Radio className="h-3.5 w-3.5 text-gold" />
            <span className="text-foreground">Next call: </span>
            <span className="font-mono text-gold glow-text-gold">{data.nextCallLabel}</span>
          </motion.div>
        )}
        <SpacingStatus status={data.status} minSep={data.minSeparationFt} />
      </motion.div>
    </div>
  );
}

function Instrument({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="glass flex items-center gap-2 rounded-lg px-2.5 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <div className="leading-none">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="font-mono text-sm font-semibold text-foreground">
          {value}
          <span className="ml-0.5 text-[9px] text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function WindCompass({ fromDeg, label }: { fromDeg: number; label: string }) {
  return (
    <div className="glass flex items-center gap-2 rounded-lg px-2.5 py-1.5">
      <div className="relative h-7 w-7">
        {/* Compass rose */}
        <div className="absolute inset-0 rounded-full border border-sky/30" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-0.5 text-[7px] text-muted-foreground">N</span>
        {/* Wind arrow pointing FROM */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: fromDeg }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <Wind className="h-4 w-4 text-sky" style={{ filter: "drop-shadow(0 0 4px rgba(62,146,204,0.6))" }} />
        </motion.div>
      </div>
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function SpacingStatus({
  status,
  minSep,
}: {
  status: "safe" | "warn" | "critical";
  minSep: number;
}) {
  if (status === "critical") {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="pulse-danger glass-strong flex items-center gap-1.5 rounded-full border border-destructive/60 px-3.5 py-1.5 text-xs font-bold text-destructive"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        NEAR MISS · {Math.round(minSep)} ft
      </motion.div>
    );
  }
  if (status === "warn") {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="glass-gold flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-gold"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        TRAFFIC · {Math.round(minSep)} ft
      </motion.div>
    );
  }
  return (
    <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground">
      <Plane className="h-3.5 w-3.5 text-sky" />
      Traffic {minSep > 9000 ? "clear" : `${Math.round(minSep)} ft`}
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
