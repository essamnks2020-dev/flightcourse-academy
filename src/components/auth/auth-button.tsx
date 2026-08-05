"use client";

import * as React from "react";
import { Chrome, Github, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AuthButton — Google/GitHub sign-in via NextAuth.
 * Gracefully degrades to "Coming soon" if NextAuth isn't configured
 * (env vars missing). Never crashes.
 */
export function AuthButton() {
  const [state, setState] = React.useState<"loading" | "available" | "unavailable">("loading");
  const [session, setSession] = React.useState<any>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    // Probe the NextAuth session endpoint
    fetch("/api/auth/session")
      .then((r) => {
        if (r.status === 404) {
          setState("unavailable");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data === null) return;
        setState("available");
        setSession(data);
      })
      .catch(() => setState("unavailable"));
  }, []);

  // Loading state
  if (state === "loading") {
    return (
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
        <span className="size-3 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  // Unavailable — still route to the sign-in page, which explains the state
  if (state === "unavailable") {
    return (
      <a
        href="/sign-in"
        className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
        title="Sign-in options"
      >
        <User className="size-3.5" />
        <span className="hidden md:inline">Sign in</span>
      </a>
    );
  }

  // Available + signed in
  if (session?.user) {
    const email = session.user.email || "";
    const name = session.user.name || email.split("@")[0];
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium transition-colors hover:border-primary/40"
        >
          <div className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline max-w-[80px] truncate">{name}</span>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="glass absolute right-0 top-full mt-2 w-48 rounded-xl p-1.5 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium truncate">{name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{email}</p>
              </div>
              <button
                onClick={() => {
                  window.location.href = "/api/auth/signout";
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Available + not signed in — link to sign-in page
  return (
    <a
      href="/sign-in"
      className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:text-primary hover:scale-105 active:scale-95"
    >
      <User className="size-3.5" />
      <span className="hidden md:inline">Sign in</span>
    </a>
  );
}
