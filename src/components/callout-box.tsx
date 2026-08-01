"use client";

import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutBoxProps {
  variant: "info" | "warning" | "tip";
  title: string;
  children: React.ReactNode;
  className?: string;
}

const config = {
  info: {
    icon: Info,
    label: "Note",
    iconClass: "text-accent",
    labelClass: "text-accent",
    ring: "border-accent/30",
    tint: "bg-accent/5",
  },
  warning: {
    icon: AlertTriangle,
    label: "Common Mistake",
    iconClass: "text-destructive",
    labelClass: "text-destructive",
    ring: "border-destructive/30",
    tint: "bg-destructive/5",
  },
  tip: {
    icon: Lightbulb,
    label: "Try It",
    iconClass: "text-primary",
    labelClass: "text-primary",
    ring: "border-primary/30",
    tint: "bg-primary/5",
  },
} as const;

export function CalloutBox({ variant, title, children, className }: CalloutBoxProps) {
  const c = config[variant];
  const Icon = c.icon;
  return (
    <div
      className={cn(
        "glass my-6 rounded-xl p-4 sm:p-5",
        c.ring,
        c.tint,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", c.iconClass)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className={cn("label-instrument mb-1.5", c.labelClass)}>{c.label}</p>
          <h4 className="mb-1.5 font-semibold tracking-tight">{title}</h4>
          <div className="text-sm leading-relaxed text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_li]:mb-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
