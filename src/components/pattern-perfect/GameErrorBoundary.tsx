"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Error boundary around the canvas/game view. Canvas/WebAudio can legitimately
 * fail on some old devices/browsers — show a friendly fallback instead of a
 * blank screen or a hard crash.
 */
export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="glass-strong flex h-16 w-16 items-center justify-center rounded-2xl text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              The flight hit turbulence
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Something went wrong rendering the canvas or audio — this can happen
              on older browsers. Your progress is safe. Reload to try again.
            </p>
            {this.state.message && (
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
                {this.state.message}
              </p>
            )}
          </div>
          <Button onClick={() => window.location.reload()} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
