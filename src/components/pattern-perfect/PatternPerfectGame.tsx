"use client";

import * as React from "react";
import { LogoMark } from "@/components/brand/logo";

/**
 * PatternPerfectGame — loads the Pattern Perfect traffic pattern simulator.
 * The game is a self-contained HTML file with vanilla JS. We load it in an
 * iframe to preserve the exact game logic and styling.
 */
export function PatternPerfectGame() {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-background">
          <div className="animate-ai-spin-up">
            <LogoMark className="size-14" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="label-instrument text-primary">Entering the pattern</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full bg-primary"
                  style={{
                    animation: `pulse 1.2s ${i * 0.2}s infinite ease-in-out`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <iframe
        src="/pattern-perfect-game.html"
        className="absolute inset-0 h-full w-full border-0"
        title="Pattern Perfect — FlightCourse Academy"
        onLoad={() => setLoaded(true)}
        allow="microphone; autoplay"
      />
    </div>
  );
}
