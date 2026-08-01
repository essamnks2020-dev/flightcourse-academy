"use client";

import { useNav } from "@/lib/nav-store";
import type { ViewName } from "@/lib/nav-store";
import { Logo } from "@/components/brand/logo";

const COLUMNS: { heading: string; links: { label: string; view: ViewName }[] }[] = [
  {
    heading: "Course",
    links: [
      { label: "Learning path", view: "path" },
      { label: "Cockpit explorer", view: "cockpit" },
      { label: "Glossary", view: "glossary" },
      { label: "Checklists", view: "checklists" },
    ],
  },
  {
    heading: "Training games",
    links: [
      { label: "Flare trainer", view: "flare" },
      { label: "Radio builder", view: "radio" },
      { label: "Pattern perfect", view: "pattern" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Your progress", view: "progress" },
      { label: "Setup guide", view: "setup" },
      { label: "FAQ", view: "faq" },
    ],
  },
];

export function Footer() {
  const navigate = useNav((s) => s.navigate);

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A structured flight-training course for simulator pilots. Ground
              school to IFR, in plain English.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-3">
              <p className="label-instrument text-muted-foreground">{col.heading}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.view}>
                    <button
                      onClick={() => navigate(link.view)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Built for MSFS, X-Plane, and anyone who has ever looked up and
            wondered how.
          </p>
          <p className="label-instrument text-muted-foreground">
            FlightCourse Academy · For simulation training only
          </p>
        </div>
      </div>
    </footer>
  );
}
