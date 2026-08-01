import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SCENARIOS,
  BASE_SCENARIO_IDS,
  READBACK_SCENARIO_IDS,
} from "@/lib/scenarios";

export type ScenarioType = "initial-call" | "readback";

export interface ScenarioResult {
  scenarioId: string;
  bestScore: number; // 0 | 50 | 75 | 100
  lastScore: number;
  hintsUsed: number; // hints used on the best-scoring attempt
  attempts: number;
  completed: boolean; // completed (incl. give-up)
  firstTryClear: boolean; // ever cleared with 0 hints on first check
  spokeIt: boolean; // say-it challenge completed
}

export interface RadioState {
  results: Record<string, ScenarioResult>;
  currentStreak: number; // consecutive first-try clears
  bestStreak: number;
  lastScenarioId: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: number;
}

export type FunnelEventType =
  | "scenario-start"
  | "hint-used"
  | "give-up"
  | "scenario-complete"
  | "share-tapped"
  | "streak-milestone"
  | "say-it-attempt"
  | "say-it-complete";

export interface FunnelEvent {
  id: string;
  type: FunnelEventType;
  scenarioId?: string;
  payload?: Record<string, unknown>;
  ts: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
}

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
  {
    id: "first-contact",
    title: "First Contact",
    description: "Complete your first radio scenario.",
  },
  {
    id: "sharp-ears",
    title: "Sharp Ears",
    description: "Clear a readback challenge with zero hints.",
  },
  {
    id: "on-frequency",
    title: "On Frequency",
    description: "Complete all 10 base call scenarios.",
  },
  {
    id: "readback-pro",
    title: "Readback Pro",
    description: "Complete both readback challenges.",
  },
  {
    id: "hot-streak-3",
    title: "Hot Streak",
    description: "Reach a 3-scenario first-try streak.",
  },
  {
    id: "streak-5",
    title: "Five Straight",
    description: "Reach a 5-scenario first-try streak.",
  },
  {
    id: "streak-7",
    title: "Seven-Up",
    description: "Reach a 7-scenario first-try streak.",
  },
  {
    id: "mic-shy-no-more",
    title: "Mic Shy No More",
    description: "Earn 5 total first-try clears.",
  },
  {
    id: "perfect-run",
    title: "Perfect Run",
    description: "Clear every scenario with zero hints.",
  },
  {
    id: "all-cleared",
    title: "All Clear",
    description: "Complete all 12 scenarios.",
  },
  {
    id: "on-the-air",
    title: "On the Air",
    description: "Complete the Say-It challenge on any scenario.",
  },
];

interface StoreState {
  radio: RadioState;
  achievements: Achievement[];
  events: FunnelEvent[];
  _hasHydrated: boolean;

  recordScenarioResult: (input: {
    scenarioId: string;
    score: number;
    hintsUsed: number;
    firstTryClear: boolean;
    gaveUp: boolean;
    spokeIt?: boolean;
  }) => { newAchievements: Achievement[]; streakMilestone: number | null };

  markSpokeIt: (scenarioId: string) => void;
  logEvent: (type: FunnelEventType, payload?: Record<string, unknown>) => void;
  resetRadio: () => void;
  resetAll: () => void;
  setHydrated: () => void;
}

const MAX_EVENTS = 120;

function emptyRadio(): RadioState {
  return {
    results: {},
    currentStreak: 0,
    bestStreak: 0,
    lastScenarioId: null,
  };
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function recomputeTotals(results: Record<string, ScenarioResult>) {
  let totalScore = 0;
  let scenariosCompleted = 0;
  let firstTryClears = 0;
  for (const id of Object.keys(results)) {
    const r = results[id];
    totalScore += r.bestScore;
    if (r.completed) scenariosCompleted += 1;
    if (r.firstTryClear) firstTryClears += 1;
  }
  return { totalScore, scenariosCompleted, firstTryClears };
}

export function selectTotals(radio: RadioState) {
  return recomputeTotals(radio.results);
}

export function selectAllCompleted(radio: RadioState) {
  return SCENARIOS.every((s) => radio.results[s.id]?.completed);
}

function deriveNewAchievements(
  results: Record<string, ScenarioResult>,
  currentStreak: number,
  bestStreak: number,
  alreadyEarned: Set<string>,
): string[] {
  const earned: string[] = [];
  const has = (id: string) => alreadyEarned.has(id) || earned.includes(id);
  const totals = recomputeTotals(results);

  if (totals.scenariosCompleted >= 1 && !has("first-contact"))
    earned.push("first-contact");

  // sharp-ears: any readback cleared first-try (0 hints)
  const sharpEars = READBACK_SCENARIO_IDS.some(
    (id) => results[id]?.firstTryClear,
  );
  if (sharpEars && !has("sharp-ears")) earned.push("sharp-ears");

  const baseDone = BASE_SCENARIO_IDS.every(
    (id) => results[id]?.completed,
  );
  if (baseDone && !has("on-frequency")) earned.push("on-frequency");

  const readbackDone = READBACK_SCENARIO_IDS.every(
    (id) => results[id]?.completed,
  );
  if (readbackDone && !has("readback-pro")) earned.push("readback-pro");

  const peakStreak = Math.max(currentStreak, bestStreak);
  if (peakStreak >= 3 && !has("hot-streak-3")) earned.push("hot-streak-3");
  if (peakStreak >= 5 && !has("streak-5")) earned.push("streak-5");
  if (peakStreak >= 7 && !has("streak-7")) earned.push("streak-7");

  if (totals.firstTryClears >= 5 && !has("mic-shy-no-more"))
    earned.push("mic-shy-no-more");

  const allDone = SCENARIOS.every((s) => results[s.id]?.completed);
  if (allDone && !has("all-cleared")) earned.push("all-cleared");

  const perfect = SCENARIOS.every(
    (s) => results[s.id]?.firstTryClear,
  );
  if (perfect && !has("perfect-run")) earned.push("perfect-run");

  return earned;
}

function milestoneForStreak(streak: number): number | null {
  if ([3, 5, 7, 10, 12].includes(streak)) return streak;
  return null;
}

export const useFlightStore = create<StoreState>()(
  persist(
    (set, get) => ({
      radio: emptyRadio(),
      achievements: [],
      events: [],
      _hasHydrated: false,

      recordScenarioResult: ({
        scenarioId,
        score,
        hintsUsed,
        firstTryClear,
        gaveUp,
        spokeIt,
      }) => {
        let newAchievements: Achievement[] = [];
        let streakMilestone: number | null = null;

        set((state) => {
          const prev = state.radio.results[scenarioId];
          const completed = gaveUp ? true : score > 0 ? true : prev?.completed ?? false;

          const better =
            !prev || score > prev.bestScore || (score === prev.bestScore && hintsUsed < prev.hintsUsed);

          const result: ScenarioResult = prev
            ? {
                scenarioId,
                bestScore: Math.max(prev.bestScore, score),
                lastScore: score,
                hintsUsed: better ? hintsUsed : prev.hintsUsed,
                attempts: prev.attempts + 1,
                completed,
                firstTryClear: prev.firstTryClear || firstTryClear,
                spokeIt: prev.spokeIt || !!spokeIt,
              }
            : {
                scenarioId,
                bestScore: score,
                lastScore: score,
                hintsUsed,
                attempts: 1,
                completed,
                firstTryClear,
                spokeIt: !!spokeIt,
              };

          // Streak: a NEW first-try clear (a scenario not previously
          // first-tried) advances the streak by 1. Replaying an already-
          // first-tried scenario does NOT advance (prevents inflation by
          // replaying easy scenarios). Any non-first-try outcome resets to 0.
          const wasAlreadyFirstTried = !!prev?.firstTryClear;
          const isNewFirstTry = firstTryClear && !wasAlreadyFirstTried;
          let currentStreak: number;
          if (firstTryClear && isNewFirstTry) {
            currentStreak = state.radio.currentStreak + 1;
          } else if (firstTryClear) {
            // replay of an already-first-tried scenario: hold the streak
            currentStreak = state.radio.currentStreak;
          } else {
            currentStreak = 0;
          }
          const bestStreak = Math.max(state.radio.bestStreak, currentStreak);

          const results = { ...state.radio.results, [scenarioId]: result };

          const alreadyEarned = new Set(state.achievements.map((a) => a.id));
          const earnedIds = deriveNewAchievements(
            results,
            currentStreak,
            bestStreak,
            alreadyEarned,
          );

          newAchievements = earnedIds.map((id) => {
            const def = ACHIEVEMENT_CATALOG.find((a) => a.id === id)!;
            return {
              id,
              title: def.title,
              description: def.description,
              earnedAt: Date.now(),
            };
          });

          streakMilestone = firstTryClear
            ? milestoneForStreak(currentStreak)
            : null;

          return {
            radio: {
              results,
              currentStreak,
              bestStreak,
              lastScenarioId: scenarioId,
            },
            achievements: [...state.achievements, ...newAchievements],
          };
        });

        return { newAchievements, streakMilestone };
      },

      markSpokeIt: (scenarioId) => {
        set((state) => {
          const prev = state.radio.results[scenarioId];
          if (!prev) return state;
          const alreadyHasOnAir = state.achievements.some(
            (a) => a.id === "on-the-air",
          );
          const results = {
            ...state.radio.results,
            [scenarioId]: { ...prev, spokeIt: true },
          };
          let achievements = state.achievements;
          if (!alreadyHasOnAir) {
            const def = ACHIEVEMENT_CATALOG.find((a) => a.id === "on-the-air")!;
            achievements = [
              ...achievements,
              {
                id: "on-the-air",
                title: def.title,
                description: def.description,
                earnedAt: Date.now(),
              },
            ];
          }
          return { radio: { ...state.radio, results }, achievements };
        });
      },

      logEvent: (type, payload) => {
        const ev: FunnelEvent = {
          id: uid(),
          type,
          payload,
          ts: Date.now(),
        };
        if (typeof console !== "undefined" && console.debug) {
          console.debug("[FlightCourse funnel]", type, payload ?? {});
        }
        set((state) => ({
          events: [...state.events, ev].slice(-MAX_EVENTS),
        }));
      },

      resetRadio: () => set({ radio: emptyRadio() }),

      resetAll: () =>
        set({ radio: emptyRadio(), achievements: [], events: [] }),

      setHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: "flightcourse-store-v1",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return window.localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Skip automatic hydration so the FIRST client render matches the
      // server render (store = empty defaults on both). We manually
      // rehydrate after mount in a useEffect — this eliminates the
      // SSR/client hydration mismatch that Zustand persist otherwise
      // causes when localStorage has data.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (s) => ({
        radio: s.radio,
        achievements: s.achievements,
        events: s.events,
      }),
    },
  ),
);

/**
 * Mastery model: a scenario is "mastered" when first-tried with zero hints.
 * "Needs review" = completed but not yet first-tried (used hints / gave up),
 * OR never attempted. These power the spaced-review surfacing on the menu.
 */
export function selectNeedsReview(radio: RadioState): string[] {
  return SCENARIOS.filter((s) => {
    const r = radio.results[s.id];
    return !r || (r.completed && !r.firstTryClear);
  }).map((s) => s.id);
}

export function selectMasteredCount(radio: RadioState): number {
  return SCENARIOS.filter((s) => radio.results[s.id]?.firstTryClear).length;
}

/** The single most relevant scenario to review next (oldest non-mastered). */
export function selectNextReview(radio: RadioState): string | null {
  const needs = selectNeedsReview(radio);
  if (needs.length === 0) return null;
  return needs[0];
}
