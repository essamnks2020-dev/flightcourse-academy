"use client";

import * as React from "react";
import { Chrome, Github, Plane, ArrowLeft, Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useNav } from "@/lib/nav-store";

const FREE_BENEFITS = [
  "Track your progress across 16 modules",
  "Earn XP, badges, and pilot ratings",
  "Sync your game scores",
  "Save your certificate name",
];

export default function SignInPage() {
  const navigate = useNav((s) => s.navigate);
  const [authAvailable, setAuthAvailable] = React.useState<"loading" | "available" | "unavailable">("loading");

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => {
        if (r.status === 404) { setAuthAvailable("unavailable"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data === null) return;
        if (data?.user) {
          // Already signed in — go home
          navigate("home");
          return;
        }
        setAuthAvailable("available");
      })
      .catch(() => setAuthAvailable("unavailable"));
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate("home")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </button>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "oklch(0.20 0.025 254 / 95%)",
            backdropFilter: "blur(20px)",
            border: "1px solid oklch(0.99 0.01 250 / 12%)",
          }}
        >
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <Logo />
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome aboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to track your progress and save your work
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-8 flex flex-col gap-2.5">
            {FREE_BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2.5 text-sm">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="size-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex flex-col gap-3">
            {authAvailable === "loading" && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <span className="size-3 rounded-full bg-muted animate-pulse" />
                Checking...
              </div>
            )}

            {authAvailable === "available" && (
              <>
                <a
                  href="/api/auth/signin/google"
                  className="flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "oklch(0.96 0.008 75)",
                    color: "oklch(0.18 0.01 60)",
                    border: "1px solid oklch(0.28 0.01 60 / 12%)",
                  }}
                >
                  <Chrome className="size-5 text-accent" />
                  Continue with Google
                </a>
                <a
                  href="/api/auth/signin/github"
                  className="flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-medium text-foreground transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "oklch(0.15 0.01 260)",
                    border: "1px solid oklch(0.99 0.01 250 / 15%)",
                  }}
                >
                  <Github className="size-5" />
                  Continue with GitHub
                </a>
              </>
            )}

            {authAvailable === "unavailable" && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <Plane className="size-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Sign-in coming soon</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    We&apos;re setting up account creation. You can still use the
                    full course — your progress saves to your browser.
                  </p>
                </div>
                <button
                  onClick={() => navigate("module", 1)}
                  className="fp-toggle-btn px-5 py-2.5 text-sm"
                >
                  <Plane className="size-4" />
                  Start without an account
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
            By signing in, you agree to our{" "}
            <button onClick={() => navigate("home")} className="text-accent hover:underline">
              Privacy Policy
            </button>
            . No password required — we use secure OAuth.
          </p>
        </div>

        {/* Below card */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          No account? No problem — the first 7 modules are free, no sign-up required.
        </p>
      </div>
    </div>
  );
}
