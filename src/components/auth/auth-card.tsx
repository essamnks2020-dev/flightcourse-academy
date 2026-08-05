"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowLeft, Check, Chrome, Github, Plane, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * AuthCard — shared sign-in / sign-up surface.
 * Discovers configured OAuth providers from NextAuth at runtime, degrades to
 * an honest "coming soon" state when none are set up, and surfaces OAuth
 * errors from the ?error= query param.
 */

type ProviderMap = Record<string, { id: string; name: string }>;

const SIGNIN_BENEFITS = [
  "Track progress across all 16 modules",
  "Earn XP, badges, and pilot ratings",
  "Sync scores from all three training games",
  "Save your certificate name",
];

const OAUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Could not start the sign-in flow. Please try again.",
  OAuthCallback: "The provider could not verify you. Please try again.",
  OAuthCreateAccount: "We could not create your account. Try a different method.",
  Callback: "Something went wrong during sign-in. Please try again.",
  AccessDenied: "You declined the sign-in request.",
  Default: "Sign-in did not complete. Please try again.",
};

function ProviderButton({ id, name }: { id: string; name: string }) {
  const isGoogle = id === "google";
  const isGitHub = id === "github";
  const [pending, setPending] = React.useState(false);
  return (
    <button
      disabled={pending}
      onClick={() => {
        setPending(true);
        // POST-based flow (CSRF-protected) — a plain GET link bounces back
        // to the custom sign-in page with ?error=<provider>.
        signIn(id, { callbackUrl: "/" }).catch(() => setPending(false));
      }}
      className={cn(
        "interactive flex w-full items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        pending && "opacity-60 pointer-events-none",
        isGoogle
          ? "bg-foreground text-background border border-border"
          : "bg-muted/60 text-foreground border border-border"
      )}
    >
      {isGoogle && <Chrome className="size-5 text-accent" aria-hidden="true" />}
      {isGitHub && <Github className="size-5" aria-hidden="true" />}
      {pending ? "Contacting Google…" : `Continue with ${name}`}
    </button>
  );
}

function AuthCardInner({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const params = useSearchParams();
  const oauthError = params.get("error");
  const [providers, setProviders] = React.useState<ProviderMap | null>(null);
  const [state, setState] = React.useState<"loading" | "ready" | "empty">("loading");

  React.useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: ProviderMap) => {
        const map = data && typeof data === "object" ? data : {};
        setProviders(map);
        setState(Object.keys(map).length ? "ready" : "empty");
      })
      .catch(() => setState("empty"));
  }, []);

  const isSignUp = mode === "sign-up";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Horizon glow behind the card */}
      <div className="bg-horizon pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </button>

        <div className="glass rounded-2xl p-8">
          {/* Brand + headline */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Logo />
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {isSignUp ? "Create your logbook" : "Welcome back, pilot"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isSignUp
                  ? "One tap with Google or GitHub — no passwords to forget."
                  : "Sign in to pick up right where you left off."}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <ul className="mb-8 flex flex-col gap-2.5">
            {SIGNIN_BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="size-3 text-primary" aria-hidden="true" />
                </span>
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>

          {/* OAuth error, if any */}
          {oauthError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
            >
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {OAUTH_ERRORS[oauthError] ?? OAUTH_ERRORS.Default}
            </div>
          )}

          {/* Provider actions */}
          <div className="flex flex-col gap-3">
            {state === "loading" && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <span className="size-3 animate-pulse rounded-full bg-muted" />
                Checking sign-in options…
              </div>
            )}

            {state === "ready" &&
              providers &&
              Object.values(providers).map((p) => (
                <ProviderButton key={p.id} id={p.id} name={p.name} />
              ))}

            {state === "empty" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <Plane className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">Accounts are being provisioned</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    You can use the entire course right now — progress saves to
                    this browser and moves to your account later.
                  </p>
                </div>
                <Link href="/" className="fp-toggle-btn px-5 py-2.5 text-sm">
                  <Plane className="size-4" aria-hidden="true" />
                  Start without an account
                </Link>
              </div>
            )}
          </div>

          {/* Mode switch + privacy */}
          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium text-accent hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/sign-up" className="font-medium text-accent hover:underline">
                  Create an account
                </Link>
              </>
            )}
          </p>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Secure OAuth, no passwords. See our{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          The first 7 modules are free — no account required.
        </p>
      </div>
    </div>
  );
}

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <span className="size-3 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <AuthCardInner mode={mode} />
    </React.Suspense>
  );
}
