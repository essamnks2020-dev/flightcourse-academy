"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Lock,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import type { ScenarioToken } from "@/lib/scenarios";
import { SLOT_META } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface BlockProps {
  token: ScenarioToken;
  draggable: boolean;
  hinted?: boolean;
  locked?: boolean;
}

const shellBase =
  "word-block relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm sm:text-[15px] font-mono leading-snug cursor-pointer select-none touch-manipulation";

function Grip({ className }: { className?: string }) {
  return <GripVertical className={cn("size-3.5 opacity-40", className)} aria-hidden />;
}

/** Small colored dot indicating the block's phrase-anatomy slot/role. */
function SlotDot({ token, hinted }: { token: ScenarioToken; hinted?: boolean }) {
  const meta = SLOT_META[token.slot];
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{
        background: meta.accent,
        boxShadow: hinted
          ? `0 0 0 2px rgba(242,177,52,0.5), 0 0 8px ${meta.accent}`
          : `0 0 6px ${meta.accent}99`,
      }}
      aria-label={meta.label}
      title={`${meta.short}: ${meta.role}`}
    />
  );
}

/* ---------- Pool block (draggable source) ---------- */
export function PoolWordBlock({
  token,
  draggable,
  hinted,
  onAdd,
}: BlockProps & { onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool-${token.id}`,
    data: { tokenId: token.id, container: "pool" },
    disabled: !draggable,
  });
  const elRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <button
      ref={(node) => {
        elRef.current = node;
        setNodeRef(node);
      }}
      type="button"
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      onClick={() => {
        onAdd();
        const el = elRef.current;
        if (el) {
          el.classList.remove("is-snapping");
          void el.offsetWidth;
          el.classList.add("is-snapping");
        }
      }}
      data-placed="false"
      data-hinted={hinted ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
      className={cn(shellBase, "animate-snap")}
      aria-label={`Add block: ${token.text}. Role: ${SLOT_META[token.slot].label}`}
    >
      <span className="fc-spark" />
      <SlotDot token={token} hinted={hinted} />
      {draggable && <Grip />}
      <Plus className="size-3.5 text-sky-soft/70" aria-hidden />
      <span>{token.text}</span>
    </button>
  );
}

/* ---------- Transmission block (sortable, reorderable/removable) ---------- */
export function TxWordBlock({
  token,
  draggable,
  hinted,
  locked,
  onRemove,
  onMoveUp,
  onMoveDown,
  canUp,
  canDown,
  isDivergence,
  isPickedUp,
  onTap,
}: BlockProps & {
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canUp: boolean;
  canDown: boolean;
  isDivergence?: boolean;
  isPickedUp?: boolean;
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `tx-${token.id}`,
      data: { tokenId: token.id, container: "tx" },
      disabled: !draggable || locked,
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(draggable && !locked ? attributes : {})}
      {...(draggable && !locked ? listeners : {})}
      data-placed="true"
      data-hinted={hinted ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
      data-pickedup={isPickedUp ? "true" : "false"}
      className={cn(
        shellBase,
        "animate-snap group",
        isDivergence && "fc-divergence",
        isPickedUp && "fc-pickedup",
      )}
      role="button"
      tabIndex={0}
      aria-label={`Placed block: ${token.text}. Role: ${SLOT_META[token.slot].label}. ${
        locked
          ? "Locked (hinted)."
          : isPickedUp
            ? "Picked up — tap another block to swap."
            : "Tap to pick up and swap. Press Delete to remove."
      }${isDivergence ? " This block is in the wrong position." : ""}`}
      onClick={() => {
        if (!locked) onTap();
      }}
      onKeyDown={(e) => {
        if (locked) return;
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          onRemove();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          if (canUp) onMoveUp();
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          if (canDown) onMoveDown();
        }
      }}
    >
      <span className="fc-spark" />
      <SlotDot token={token} hinted={hinted} />
      {draggable && !locked && <Grip className="cursor-grab" />}
      {locked && <Lock className="size-3.5 text-gold" aria-hidden />}

      <span className={cn(locked && "text-amber-50")}>{token.text}</span>

      {!locked && (
        <span className="ml-1 inline-flex items-center opacity-50 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <span
            role="button"
            tabIndex={-1}
            aria-label="Move up"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            className={cn(
              "grid place-items-center h-7 w-7 rounded text-sky-soft/80 hover:bg-sky/20",
              !canUp && "opacity-30 pointer-events-none",
            )}
          >
            <ChevronUp className="size-4" />
          </span>
          <span
            role="button"
            tabIndex={-1}
            aria-label="Move down"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className={cn(
              "grid place-items-center h-7 w-7 rounded text-sky-soft/80 hover:bg-sky/20",
              !canDown && "opacity-30 pointer-events-none",
            )}
          >
            <ChevronDown className="size-4" />
          </span>
          <span
            role="button"
            tabIndex={-1}
            aria-label="Remove block"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="grid place-items-center h-7 w-7 rounded text-red-300/80 hover:bg-red-500/20"
          >
            <X className="size-4" />
          </span>
        </span>
      )}
    </div>
  );
}

/* ---------- DragOverlay ghost ---------- */
export function DragGhost({ token }: { token: ScenarioToken }) {
  return (
    <div className={cn(shellBase, "rotate-2 scale-105")} data-dragging="true">
      <SlotDot token={token} />
      <Grip />
      <span>{token.text}</span>
    </div>
  );
}
