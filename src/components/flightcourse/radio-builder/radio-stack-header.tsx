"use client";

import * as React from "react";
import { Radio, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { isMuted, setMuted } from "@/lib/audio";
import { SignalBars } from "@/components/flightcourse/instruments";

interface Props {
  activeFreq: string;
  standbyFreq: string;
  station: string;
  callsignShort: string;
  transmitting?: boolean;
  channelLabel?: string;
}

export function RadioStackHeader({
  activeFreq,
  standbyFreq,
  station,
  callsignShort,
  transmitting = false,
  channelLabel = "COM1",
}: Props) {
  const [muted, setMutedState] = React.useState(false);
  React.useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  return (
    <div className="fc-bezel fc-bezel-rivets rounded-2xl p-3 sm:p-4 relative select-none animate-rise">
      {/* screws */}
      <span className="fc-screw absolute top-2.5 left-2.5" />
      <span className="fc-screw absolute top-2.5 right-2.5" />
      <span className="fc-screw absolute bottom-2.5 left-2.5" />
      <span className="fc-screw absolute bottom-2.5 right-2.5" />

      <div className="flex items-stretch gap-3 sm:gap-4">
        {/* Frequency LCD */}
        <div className="lcd-screen lcd-flicker rounded-xl px-4 py-3 sm:px-6 sm:py-4 flex-1 min-w-0 relative">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] sm:text-xs text-emerald-300/70 font-mono tracking-widest">
              {channelLabel}
            </span>
            <span className="flex items-center gap-2">
              <SignalBars idle={!transmitting} />
              <span className="text-[10px] sm:text-xs text-emerald-300/70 font-mono tracking-widest">
                {callsignShort}
              </span>
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] text-emerald-400/60 font-mono tracking-widest mb-0.5">
                ACTIVE
              </div>
              <div className="font-mono text-2xl sm:text-4xl font-bold tabular-nums leading-none truncate">
                {activeFreq}
              </div>
            </div>
            <div className="text-right min-w-0">
              <div className="text-[9px] sm:text-[10px] text-emerald-400/60 font-mono tracking-widest mb-0.5">
                STBY
              </div>
              <div className="font-mono text-sm sm:text-lg text-emerald-300/70 tabular-nums leading-none truncate">
                {standbyFreq}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full transition-all",
                transmitting ? "bg-red-400 animate-tx" : "bg-emerald-400/40",
              )}
            />
            <span className="text-[9px] sm:text-[10px] text-emerald-300/70 font-mono tracking-widest truncate">
              TX → {station.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Side controls */}
        <div className="flex flex-col justify-between gap-2 w-16 sm:w-20">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute audio" : "Mute audio"}
              className="fc-bezel rounded-lg h-9 w-9 grid place-items-center text-sky-200 hover:text-sky-100 transition-colors"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
          <div className="fc-bezel rounded-lg h-12 sm:h-14 grid place-items-center text-sky-200/80 relative overflow-hidden">
            <Radio className={cn("size-5 sm:size-6 transition-colors", transmitting && "text-gold")} />
            {transmitting && (
              <span className="absolute inset-0 fc-sweep rounded-lg" style={{ background: "conic-gradient(from 0deg, transparent, rgba(242,177,52,0.18), transparent 40%)" }} />
            )}
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-sky-200/30" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
