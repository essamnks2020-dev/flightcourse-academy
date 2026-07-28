"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Radio, Waves } from "lucide-react";
import type { ScenarioToken } from "@/lib/scenarios";
import { TxWordBlock } from "./word-block";
import { SignalBars } from "@/components/flightcourse/instruments";
import { cn } from "@/lib/utils";

interface Props {
  tx: ScenarioToken[];
  hintedIds: Set<string>;
  lockedIds: Set<string>;
  dragEnabled: boolean;
  vibe: "idle" | "over" | "correct" | "wrong";
  station: string;
  callsign: string;
  activeFreq: string;
  divergenceIndex: number | null;
  pickedUpId: string | null;
  onBlockTap: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function TransmissionArea({
  tx,
  hintedIds,
  lockedIds,
  dragEnabled,
  vibe,
  station,
  callsign,
  activeFreq,
  divergenceIndex,
  pickedUpId,
  onBlockTap,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: "tx-area" });

  const dataAttr =
    vibe === "correct"
      ? { "data-correct": "true" }
      : vibe === "wrong"
        ? { "data-wrong": "true" }
        : {};

  const ids = tx.map((t) => `tx-${t.id}`);
  const live = vibe === "correct" || vibe === "wrong" ? false : true;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-sky-soft/80">
          <Radio className="size-3.5" />
          TRANSMISSION BUILDER
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <SignalBars idle={tx.length === 0} />
            {tx.length > 0 ? `${tx.length} placed` : "empty"}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        {...dataAttr}
        data-over={isOver ? "true" : "false"}
        className={cn(
          "tx-area rounded-xl p-3 sm:p-4 min-h-[128px] flex flex-wrap content-start gap-2 transition-colors",
          vibe === "wrong" && "animate-shake",
        )}
        aria-label="Transmission area: drop or tap blocks here to build your radio call"
      >
        {tx.length === 0 ? (
          <div className="w-full text-center py-7 text-sm text-slate-400">
            <Waves className="size-5 mx-auto mb-2 text-sky-soft/40" />
            <p className="font-mono text-sky-soft/60">
              {dragEnabled ? "Drag blocks here" : "Tap blocks"} to build your transmission…
            </p>
            <p className="text-xs mt-1.5 text-slate-400">
              Address <span className="text-sky-soft">{station}</span> as{" "}
              <span className="text-sky-soft">{callsign}</span>
            </p>
          </div>
        ) : (
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            {tx.map((t, i) => (
              <TxWordBlock
                key={t.id}
                token={t}
                draggable={dragEnabled}
                hinted={hintedIds.has(t.id)}
                locked={lockedIds.has(t.id)}
                isDivergence={divergenceIndex === i}
                isPickedUp={pickedUpId === t.id}
                canUp={i > 0 && !lockedIds.has(t.id)}
                canDown={i < tx.length - 1 && !lockedIds.has(t.id)}
                onTap={() => onBlockTap(t.id)}
                onRemove={() => onRemove(t.id)}
                onMoveUp={() => onMoveUp(t.id)}
                onMoveDown={() => onMoveDown(t.id)}
              />
            ))}
          </SortableContext>
        )}
      </div>

      {/* Live transcript readout */}
      <div className="lcd-screen rounded-lg px-3 py-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-widest text-emerald-300/60">
            LIVE TRANSCRIPT
          </span>
          <span className="text-[10px] font-mono text-emerald-300/50 tabular-nums">
            {activeFreq} MHz
          </span>
        </div>
        <p
          className={cn(
            "font-mono text-sm sm:text-base leading-relaxed min-h-[1.6em]",
            tx.length === 0 ? "text-emerald-300/30" : "text-emerald-200",
            vibe === "correct" && "text-emerald-300",
            vibe === "wrong" && "text-red-300",
          )}
        >
          {tx.length === 0 ? (
            <span className="fc-cursor">…</span>
          ) : (
            <span className={live ? "fc-cursor" : undefined}>
              {tx.map((t) => t.text).join(" ")}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
