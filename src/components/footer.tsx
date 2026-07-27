"use client";

import { useNav } from "@/lib/nav-store";
import type { ViewName } from "@/lib/nav-store";
import { FlightCourseLogo } from "./navbar";
import { Plane, Compass, Gauge, BookOpen, CheckSquare, Settings, Award, HelpCircle } from "lucide-react";

const FOOTER_LINKS: { label: string; view: ViewName; icon: React.ElementType }[] = [
  { label: "Learning Path", view: "path", icon: Compass },
  { label: "Cockpit Explorer", view: "cockpit", icon: Gauge },
  { label: "Glossary", view: "glossary", icon: BookOpen },
  { label: "Checklists", view: "checklists", icon: CheckSquare },
  { label: "Setup Guide", view: "setup", icon: Settings },
  { label: "Your Progress", view: "progress", icon: Award },
  { label: "FAQ", view: "faq", icon: HelpCircle },
];

export function Footer() {
  const navigate = useNav((s) => s.navigate);
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/30 backdrop-blur-sm relative overflow-hidden">
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, var(--color-sky), var(--color-gold), transparent)",
        opacity: 0.3,
      }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <FlightCourseLogo className="w-9 h-9" />
              <div>
                <div className="font-heading font-bold text-base leading-none">
                  FlightCourse Academy
                </div>
                <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-sky leading-none mt-0.5">
                  From Zero to Wheels Up
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              A flight simulation learning platform for total beginners. Real
              aviation knowledge, patient instruction, and zero experience
              required. Built for MSFS, X-Plane, and anyone who's ever looked up
              and wondered how.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(0, 4).map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-muted-foreground hover:text-sky transition-colors flex items-center gap-2 group"
                  >
                    <link.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More links */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">More</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(4).map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-muted-foreground hover:text-sky transition-colors flex items-center gap-2 group"
                  >
                    <link.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} FlightCourse Academy · For simulation training only
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono italic">
            "Aviate. Navigate. Communicate."
          </p>
        </div>
      </div>
    </footer>
  );
}
