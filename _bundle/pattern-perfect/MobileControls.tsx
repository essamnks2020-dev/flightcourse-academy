"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plane } from "lucide-react";

interface Props {
  onPress: (side: "left" | "right" | "level", pressed: boolean) => void;
}

/**
 * Touch-first bank controls. Glassmorphic thumb pads with press-glow.
 * pointer-events + touch-none prevent scroll/zoom fights.
 */
export function MobileControls({ onPress }: Props) {
  const bind = (side: "left" | "right" | "level") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onPress(side, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      onPress(side, false);
    },
    onPointerLeave: () => onPress(side, false),
    onPointerCancel: () => onPress(side, false),
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:hidden">
      <motion.button
        {...bind("left")}
        whileTap={{ scale: 0.92 }}
        aria-label="Bank left"
        className="glass-strong pointer-events-auto flex h-20 w-20 touch-none select-none items-center justify-center rounded-2xl border border-sky/40 text-sky active:bg-sky/30"
      >
        <ChevronLeft className="h-9 w-9" />
      </motion.button>
      <motion.button
        {...bind("level")}
        whileTap={{ scale: 0.9 }}
        aria-label="Level wings"
        className="glass pointer-events-auto mb-1 flex h-14 w-14 touch-none select-none items-center justify-center rounded-full border border-border text-muted-foreground active:bg-gold/20"
      >
        <Plane className="h-5 w-5" />
      </motion.button>
      <motion.button
        {...bind("right")}
        whileTap={{ scale: 0.92 }}
        aria-label="Bank right"
        className="glass-strong pointer-events-auto flex h-20 w-20 touch-none select-none items-center justify-center rounded-2xl border border-sky/40 text-sky active:bg-sky/30"
      >
        <ChevronRight className="h-9 w-9" />
      </motion.button>
    </div>
  );
}
