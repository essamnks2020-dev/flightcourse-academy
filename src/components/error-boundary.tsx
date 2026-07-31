"use client";

import * as React from "react";
import { LogoMark } from "@/components/brand/logo";

/**
 * Global error boundary — catches any unhandled error in the React tree
 * and shows a friendly fallback instead of a white screen.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("FlightCourse error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
          <LogoMark className="size-16" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              The page hit an unexpected error. Try refreshing — your progress is
              saved locally and won&apos;t be lost.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="fp-toggle-btn px-5 py-2.5 text-sm"
            >
              Refresh page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.href = "/";
              }}
              className="fp-outline-btn px-5 py-2.5 text-sm"
            >
              Go home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
