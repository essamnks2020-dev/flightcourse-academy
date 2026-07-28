"use client";

import { Volume2, VolumeX, Sun, Sunset, Moon, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeOfDay } from "@/lib/pattern/render";

interface Props {
  timeOfDay: TimeOfDay;
  setTimeOfDay: (t: TimeOfDay) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  compact?: boolean;
}

const TOD_OPTIONS: { value: TimeOfDay; icon: React.ReactNode; label: string }[] = [
  { value: "dawn", icon: <Sunrise className="h-3.5 w-3.5" />, label: "Dawn" },
  { value: "day", icon: <Sun className="h-3.5 w-3.5" />, label: "Day" },
  { value: "dusk", icon: <Sunset className="h-3.5 w-3.5" />, label: "Dusk" },
  { value: "night", icon: <Moon className="h-3.5 w-3.5" />, label: "Night" },
];

export function SettingsBar({ timeOfDay, setTimeOfDay, muted, setMuted, compact }: Props) {
  return (
    <div className={`glass flex items-center gap-1 rounded-full p-1 ${compact ? "text-xs" : "text-sm"}`}>
      {TOD_OPTIONS.map((opt) => {
        const active = opt.value === timeOfDay;
        return (
          <button
            key={opt.value}
            onClick={() => setTimeOfDay(opt.value)}
            title={opt.label}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${
              active
                ? "bg-gold/20 text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.icon}
            {!compact && <span className="text-xs">{opt.label}</span>}
          </button>
        );
      })}
      <div className="mx-1 h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMuted(!muted)}
        className="h-7 w-7 rounded-full p-0 text-muted-foreground hover:text-foreground"
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
