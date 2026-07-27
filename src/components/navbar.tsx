"use client";

import * as React from "react";
import { Plane, Compass, Gauge, Gamepad2, Radio, Map, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useNav } from "@/lib/nav-store";
import { useProgress } from "@/lib/progress-store";
import type { ViewName } from "@/lib/nav-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; view: ViewName; icon: React.ElementType }[] = [
  { label: "Home", view: "home", icon: Plane },
  { label: "Learning Path", view: "path", icon: Compass },
  { label: "Cockpit", view: "cockpit", icon: Gauge },
  { label: "Glossary", view: "glossary", icon: Compass },
  { label: "Checklists", view: "checklists", icon: Compass },
  { label: "Setup", view: "setup", icon: Compass },
  { label: "Progress", view: "progress", icon: Gauge },
  { label: "Flare Trainer", view: "flare", icon: Gamepad2 },
  { label: "Radio Builder", view: "radio", icon: Radio },
  { label: "Pattern Perfect", view: "pattern", icon: Map },
  { label: "Progress", view: "progress", icon: Gauge },
  { label: "FAQ", view: "faq", icon: Compass },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const navigate = useNav((s) => s.navigate);
  const currentView = useNav((s) => s.view);
  const xp = useProgress((s) => s.xp);
  const completedCount = useProgress((s) => s.getCompletedCount());

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2.5 group flex-shrink-0 transition-transform hover:scale-[1.02]"
          aria-label="FlightCourse Academy home"
        >
          <FlightCourseLogo className="w-9 h-9 transition-transform group-hover:rotate-6 duration-500" />
          <div className="hidden sm:block text-left">
            <div className="font-heading font-bold text-base leading-none tracking-tight">
              FlightCourse
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-sky leading-none mt-0.5">
              Academy
            </div>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 fp-glass rounded-full px-2 py-1">
          {NAV_ITEMS.slice(0, 6).map((item) => (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={cn(
                "relative px-3.5 py-1.5 text-sm font-medium transition-all rounded-full",
                currentView === item.view
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {currentView === item.view && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-sky"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* XP indicator */}
          <button
            onClick={() => navigate("progress")}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 fp-glass rounded-full hover:border-gold/50 transition-all group"
          >
            <Gauge className="w-4 h-4 text-gold group-hover:text-gold-light transition-colors" />
            <div className="text-left">
              <div className="text-xs font-mono font-bold leading-none">
                {(xp / 10).toFixed(1)}h
              </div>
              <div className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground leading-none mt-0.5">
                logged
              </div>
            </div>
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center border border-border hover:border-sky/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden w-9 h-9 flex items-center justify-center border border-border"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  navigate(item.view);
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 text-sm font-medium border transition-colors",
                  currentView === item.view
                    ? "border-sky text-sky bg-sky/5"
                    : "border-border text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="col-span-2 mt-1 px-3 py-2 border border-border flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Hours logged
              </span>
              <span className="font-mono font-bold text-gold">{(xp / 10).toFixed(1)}h</span>
            </div>
            <div className="col-span-2 px-3 py-2 border border-border flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Modules complete
              </span>
              <span className="font-mono font-bold text-sky">{completedCount}/16</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function FlightCourseLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fp-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3E92CC" />
          <stop offset="100%" stopColor="#F2B134" />
        </linearGradient>
        <linearGradient id="fp-sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3E92CC" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3E92CC" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="fp-glow" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#F2B134" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#F2B134" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Ambient glow */}
      <circle cx="20" cy="20" r="18" fill="url(#fp-glow)" />
      {/* Outer ring — gradient */}
      <circle cx="20" cy="20" r="18" fill="none" stroke="url(#fp-ring-grad)" strokeWidth="1.5" />
      {/* Sky half — gradient fill */}
      <path d="M 2 20 A 18 18 0 0 1 38 20 Z" fill="url(#fp-sky-grad)" />
      {/* Ground half */}
      <path d="M 2 20 A 18 18 0 0 0 38 20 Z" fill="#0B1D3A" opacity="0.1" className="dark:fill-[#3E92CC] dark:opacity-[0.06]" />
      {/* Horizon line — gold with subtle glow */}
      <line x1="2" y1="20" x2="38" y2="20" stroke="#F2B134" strokeWidth="1.5" />
      <line x1="2" y1="20" x2="38" y2="20" stroke="#F2B134" strokeWidth="3" opacity="0.2" />
      {/* Compass tick marks */}
      <line x1="20" y1="3" x2="20" y2="7" stroke="#F2B134" strokeWidth="1.5" />
      <line x1="20" y1="33" x2="20" y2="37" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="3" y1="20" x2="7" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="33" y1="20" x2="37" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Flight path arrow — gradient stroke */}
      <path d="M 12 24 Q 20 8 28 24" fill="none" stroke="#3E92CC" strokeWidth="2" strokeLinecap="round" />
      <path d="M 12 24 Q 20 8 28 24" fill="none" stroke="#6FB3DE" strokeWidth="3" strokeLinecap="round" opacity="0.2" />
      {/* Arrow tip */}
      <polygon points="28,24 25,20 28,21 31,20" fill="#3E92CC" />
      <circle cx="28" cy="24" r="1.5" fill="#F2B134" />
    </svg>
  );
}
