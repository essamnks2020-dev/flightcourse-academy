"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ModuleProgress {
  quizScore: number; // best score 0-5
  quizAttempts: number;
  completedAt: string | null;
  startedAt: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or lucide name key
}

export const BADGES: Badge[] = [
  { id: "first-flight", name: "First Flight", description: "Completed your first module. Welcome aboard.", icon: "plane-takeoff" },
  { id: "cockpit-confident", name: "Cockpit Confident", description: "Mastered the six-pack instruments.", icon: "gauge" },
  { id: "wheels-up", name: "Wheels Up", description: "Completed your first takeoff lesson.", icon: "arrow-up" },
  { id: "wheels-down", name: "Wheels Down", description: "Landed your first traffic pattern. Smooth.", icon: "arrow-down" },
  { id: "first-radio", name: "First Solo Radio Call", description: "You sound like a pilot now. Niner, niner.", icon: "radio" },
  { id: "weather-wise", name: "Weather Wise", description: "Can read a METAR without breaking a sweat.", icon: "cloud-sun" },
  { id: "calm-storm", name: "Calm in the Storm", description: "Handled emergency procedures like a pro.", icon: "shield-alert" },
  { id: "cross-country", name: "Cross-Country Certified", description: "Planned and flew a full cross-country route.", icon: "route" },
  { id: "rated-pilot", name: "Rated Pilot", description: "Completed all 16 modules. From zero to wheels up.", icon: "award" },
];

// Module completion → badge mapping
export const MODULE_BADGES: Record<number, string> = {
  1: "first-flight",
  2: "cockpit-confident",
  7: "wheels-up",
  8: "wheels-down",
  11: "first-radio",
  12: "weather-wise",
  13: "calm-storm",
  14: "cross-country",
};

export const LICENSE_TIERS = [
  { name: "Student Pilot", minModules: 0, color: "#5B6B79" },
  { name: "Private Pilot Track", minModules: 4, color: "#3E92CC" },
  { name: "Instrument Track", minModules: 9, color: "#F2B134" },
  { name: "Rated", minModules: 15, color: "#0B1D3A" },
] as const;

interface ProgressState {
  moduleProgress: Record<number, ModuleProgress>;
  xp: number;
  badges: string[];
  certificateName: string | null;

  // Actions
  startModule: (moduleId: number) => void;
  submitQuiz: (moduleId: number, score: number, xpReward: number) => { newBadges: string[]; leveledUp: boolean };
  isModuleUnlocked: (moduleId: number, prerequisites: number[]) => boolean;
  isModuleCompleted: (moduleId: number) => boolean;
  getModuleProgress: (moduleId: number) => ModuleProgress | undefined;
  resetProgress: () => void;
  setCertificateName: (name: string) => void;
  getCompletedCount: () => number;
  getLicenseTier: () => (typeof LICENSE_TIERS)[number];
  getTotalXP: () => number;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      moduleProgress: {},
      xp: 0,
      badges: [],
      certificateName: null,

      startModule: (moduleId) => {
        set((state) => {
          const existing = state.moduleProgress[moduleId];
          if (existing?.startedAt) return state;
          return {
            moduleProgress: {
              ...state.moduleProgress,
              [moduleId]: {
                quizScore: 0,
                quizAttempts: 0,
                completedAt: null,
                startedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      submitQuiz: (moduleId, score, xpReward) => {
        const state = get();
        const existing = state.moduleProgress[moduleId] || {
          quizScore: 0,
          quizAttempts: 0,
          completedAt: null,
          startedAt: new Date().toISOString(),
        };

        const wasCompleted = existing.completedAt !== null;
        const isNowCompleted = score >= 3 && !wasCompleted;
        const newBestScore = Math.max(existing.quizScore, score);

        const newProgress: ModuleProgress = {
          quizScore: newBestScore,
          quizAttempts: existing.quizAttempts + 1,
          completedAt: isNowCompleted ? new Date().toISOString() : existing.completedAt,
          startedAt: existing.startedAt,
        };

        // Calculate XP — only award on first completion
        const xpGain = isNowCompleted ? xpReward : 0;
        const newXP = state.xp + xpGain;

        // Calculate new badges
        const newBadges: string[] = [];
        const earnedSet = new Set(state.badges);

        if (isNowCompleted && MODULE_BADGES[moduleId]) {
          const badgeId = MODULE_BADGES[moduleId];
          if (!earnedSet.has(badgeId)) {
            newBadges.push(badgeId);
            earnedSet.add(badgeId);
          }
        }

        // Check for "all modules completed" badge
        const completedCount = Object.values({
          ...state.moduleProgress,
          [moduleId]: newProgress,
        }).filter((m) => m.completedAt !== null).length;

        if (completedCount >= 16 && !earnedSet.has("rated-pilot")) {
          newBadges.push("rated-pilot");
          earnedSet.add("rated-pilot");
        }

        set({
          moduleProgress: { ...state.moduleProgress, [moduleId]: newProgress },
          xp: newXP,
          badges: Array.from(earnedSet),
        });

        return { newBadges, leveledUp: isNowCompleted };
      },

      isModuleUnlocked: (moduleId, prerequisites) => {
        // Module 1 is always unlocked
        if (moduleId === 1) return true;
        const state = get();
        // A module is unlocked if all prerequisites are completed
        return prerequisites.every((prereq) => {
          const p = state.moduleProgress[prereq];
          return p?.completedAt !== null && p?.completedAt !== undefined;
        });
      },

      isModuleCompleted: (moduleId) => {
        const p = get().moduleProgress[moduleId];
        return p?.completedAt !== null && p?.completedAt !== undefined;
      },

      getModuleProgress: (moduleId) => get().moduleProgress[moduleId],

      resetProgress: () => {
        set({ moduleProgress: {}, xp: 0, badges: [], certificateName: null });
      },

      setCertificateName: (name) => set({ certificateName: name }),

      getCompletedCount: () => {
        return Object.values(get().moduleProgress).filter((m) => m.completedAt !== null).length;
      },

      getLicenseTier: () => {
        const count = get().getCompletedCount();
        let tier = LICENSE_TIERS[0];
        for (const t of LICENSE_TIERS) {
          if (count >= t.minModules) tier = t;
        }
        return tier;
      },

      getTotalXP: () => get().xp,
    }),
    {
      name: "fp-progress",
    }
  )
);
