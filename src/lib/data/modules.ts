import { modules18 } from "./modules-1-8";
import { modules916 } from "./modules-9-16";
import type { ModuleContent } from "@/lib/content-types";

export const allModules: ModuleContent[] = [...modules18, ...modules916].sort(
  (a, b) => a.id - b.id
);

export function getModule(id: number): ModuleContent | undefined {
  return allModules.find((m) => m.id === id);
}

export function getNextModule(id: number): ModuleContent | undefined {
  return allModules.find((m) => m.id === id + 1);
}

export function getPrevModule(id: number): ModuleContent | undefined {
  return allModules.find((m) => m.id === id - 1);
}

export const TOTAL_MODULES = allModules.length;
export const TOTAL_XP = allModules.reduce((sum, m) => sum + m.xpReward, 0);

// Category colors for visual grouping
export const CATEGORY_COLORS: Record<string, string> = {
  "Getting Started": "#3E92CC",
  Cockpit: "#6FB3DE",
  Aerodynamics: "#F2B134",
  "Flight Controls": "#E89B2C",
  Procedures: "#3E92CC",
  "Ground Operations": "#84939F",
  "Flight Maneuvers": "#F2B134",
  Navigation: "#3E92CC",
  Communications: "#6FB3DE",
  Weather: "#84939F",
  "Instrument Flying": "#5B6B79",
  Aircraft: "#0B1D3A",
};
