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
    border: "border-sky",
    bg: "bg-sky/5",
    iconBg: "bg-sky/15 text-sky",
    label: "Note",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-gold",
    bg: "bg-gold/5",
    iconBg: "bg-gold/20 text-gold-dark",
    label: "Common Mistake",
  },
  tip: {
    icon: Lightbulb,
    border: "border-gold",
    bg: "bg-gold/5",
    iconBg: "bg-gold/15 text-gold-dark",
    label: "Try It",
  },
};

export function CalloutBox({ variant, title, children, className }: CalloutBoxProps) {
  const c = config[variant];
  const Icon = c.icon;
  return (
    <div
      className={cn(
        "fp-bezel relative p-4 sm:p-5 my-6",
        c.border,
        c.bg,
        className
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-9 h-9 flex items-center justify-center",
            c.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {c.label}
            </span>
          </div>
          <h4 className="font-heading font-semibold text-base mb-1.5">{title}</h4>
          <div className="text-sm text-muted-foreground leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_li]:mb-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
