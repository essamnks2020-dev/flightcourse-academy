"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useNav } from "@/lib/nav-store";
import { useProgress } from "@/lib/progress-store";
import { useMounted } from "@/hooks/use-mounted";
import type { ViewName } from "@/lib/nav-store";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/logo";
import { AuthButton } from "@/components/auth/auth-button";
import {
  Sun,
  Moon,
  Menu,
  X,
  Gamepad2,
  Gauge,
  Plane,
  Radio,
  Map,
  ChevronDown,
} from "lucide-react";

// Backward-compat: older views import FlightCourseLogo from navbar.
export const FlightCourseLogo = LogoMark;

const PRIMARY_NAV: { label: string; view: ViewName }[] = [
  { label: "Course", view: "path" },
  { label: "Cockpit", view: "cockpit" },
  { label: "Glossary", view: "glossary" },
  { label: "Checklists", view: "checklists" },
  { label: "Setup", view: "setup" },
  { label: "Progress", view: "progress" },
  { label: "FAQ", view: "faq" },
];

const GAMES: { label: string; view: ViewName; icon: React.ElementType; blurb: string }[] = [
  { label: "Flare Trainer", view: "flare", icon: Plane, blurb: "Land without bouncing" },
  { label: "Radio Builder", view: "radio", icon: Radio, blurb: "Say it right, first time" },
  { label: "Pattern Perfect", view: "pattern", icon: Map, blurb: "Fly the traffic pattern" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [gamesOpen, setGamesOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const navigate = useNav((s) => s.navigate);
  const currentView = useNav((s) => s.view);
  const xp = useProgress((s) => s.xp);
  const completedCount = useProgress((s) => s.getCompletedCount());
  const gamesRef = React.useRef<HTMLDivElement>(null);
  const mobileButtonRef = React.useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and returns focus to its trigger.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const go = (view: ViewName) => {
    navigate(view);
    setMobileOpen(false);
    setGamesOpen(false);
  };

  const FOCUS =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => go("home")}
          className="shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="FlightCourse Academy home"
        >
          <Logo />
        </button>

        {/* Desktop nav */}
        <nav aria-label="Main" className="ml-2 hidden items-center gap-0.5 md:flex">
          {PRIMARY_NAV.map((item) => (
            <button
              key={item.view}
              onClick={() => go(item.view)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                FOCUS,
                currentView === item.view
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {item.label}
            </button>
          ))}

          {/* Games dropdown */}
          <div
            ref={gamesRef}
            className="relative"
            onBlur={(e) => {
              if (!gamesRef.current?.contains(e.relatedTarget as Node)) {
                setGamesOpen(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setGamesOpen(false);
            }}
          >
            <button
              onClick={() => setGamesOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                FOCUS,
                GAMES.some((g) => g.view === currentView)
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              aria-expanded={gamesOpen}
              aria-haspopup="menu"
            >
              <Gamepad2 className="size-4" aria-hidden="true" />
              Games
              <ChevronDown className={cn("size-3.5 transition-transform", gamesOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {gamesOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border p-1.5 shadow-2xl animate-fade-up"
                style={{
                  background: "linear-gradient(160deg, oklch(0.26 0.03 253 / 96%) 0%, oklch(0.21 0.028 253 / 97%) 100%)",
                  backdropFilter: "blur(20px) saturate(150%)",
                }}
              >
                {GAMES.map((g) => (
                  <button
                    key={g.view}
                    role="menuitem"
                    onClick={() => go(g.view)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted",
                      FOCUS,
                      currentView === g.view && "bg-muted"
                    )}
                  >
                    <g.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{g.label}</span>
                      <span className="text-xs text-muted-foreground leading-tight">{g.blurb}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* XP / progress readout */}
          <button
            onClick={() => go("progress")}
            className={cn(
              "hidden sm:flex items-center gap-2.5 rounded-full border border-border px-3 py-1.5 transition-colors hover:border-primary/40",
              FOCUS
            )}
          >
            <Gauge className="size-4 text-primary" aria-hidden="true" />
            <span className="flex items-baseline gap-1.5">
              <span className="nums text-xs font-semibold">{completedCount}/16</span>
              <span className="label-instrument text-muted-foreground">modules</span>
            </span>
          </button>

          {/* Auth button */}
          <AuthButton />

          {/* Theme toggle — circular wipe reveal (from portfolio) */}
          {mounted && (
            <button
              onClick={(e) => {
                const x = e.clientX;
                const y = e.clientY;
                if ((window as any).toggleThemeWithWipe) {
                  (window as any).toggleThemeWithWipe(x, y);
                } else {
                  setTheme(theme === "dark" ? "light" : "dark");
                }
              }}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border border-border transition-all hover:border-primary/40 hover:text-primary hover:scale-105 active:scale-95",
                FOCUS
              )}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            ref={mobileButtonRef}
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border border-border md:hidden",
              FOCUS
            )}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-5 px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-1.5">
              {PRIMARY_NAV.map((item) => (
                <button
                  key={item.view}
                  onClick={() => go(item.view)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    FOCUS,
                    currentView === item.view
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div>
              <p className="label-instrument text-muted-foreground px-1 pb-1.5">Training games</p>
              <div className="grid gap-1.5">
                {GAMES.map((g) => (
                  <button
                    key={g.view}
                    onClick={() => go(g.view)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      FOCUS,
                      currentView === g.view
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <g.icon className="size-4 text-primary" aria-hidden="true" />
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass flex items-center justify-between rounded-lg px-3 py-2.5">
              <span className="label-instrument text-muted-foreground">Hours logged</span>
              <span className="nums text-sm font-semibold text-primary">{(xp / 10).toFixed(1)} h</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
