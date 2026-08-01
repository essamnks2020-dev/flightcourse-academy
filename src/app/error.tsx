"use client";

import { LogoMark } from "@/components/brand/logo";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <LogoMark className="size-16" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
          The page hit an unexpected error. Your progress is saved locally.
          Try again, or go back to the home page.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="fp-toggle-btn px-5 py-2.5 text-sm">
          Try again
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="fp-outline-btn px-5 py-2.5 text-sm"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
