"use client";

import * as React from "react";
import { LogoMark } from "@/components/brand/logo";
import { attachGameBridge } from "@/lib/game-bridge";

/**
 * RadioBuilder — loads the user-authored Radio Builder game.
 * The game is a self-contained HTML file with vanilla JS. We load it in an
 * iframe to preserve the exact game logic and styling.
 */
export function RadioBuilder() {
  const [loaded, setLoaded] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => attachGameBridge(iframeRef.current, "radio"), []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-background">
          <div className="animate-ai-spin-up">
            <LogoMark className="size-14" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="label-instrument text-primary">Tuning the radio</p>
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
        ref={iframeRef}
        src="/radio-builder-game.html"
        className="absolute inset-0 h-full w-full border-0"
        title="Radio Builder — FlightCourse Academy"
        onLoad={() => setLoaded(true)}
        allow="microphone; autoplay"
      />
    </div>
  );
}
