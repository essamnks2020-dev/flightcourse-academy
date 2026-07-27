/**
 * Shared FlightCourse progress store (Zustand + localStorage persistence).
 *
 * Tracks completion of all three mini-games and the combined "First Solo" badge.
 * The combined-badge logic is ORDER-INDEPENDENT: it unlocks the moment all three
 * games have at least one completion, regardless of which was finished first or
 * whether the others are even built yet (no error if a game is still locked).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GameId = "landing-flare" | "radio-call" | "pattern-perfect";

export type PatternGrade =
  | "textbook"
  | "solid"
  | "needs-work"
  | "redo";

export const GRADE_LABELS: Record<PatternGrade, string> = {
  textbook: "Textbook pattern!",
  solid: "Solid pattern",
  "needs-work": "Needs work",
  redo: "Redo required",
};

export interface GameProgress {
  completed: boolean;
  bestScore: number; // 0-100
  bestGrade?: PatternGrade; // pattern-perfect only
  attempts: number;
  lastPlayedAt: number | null;
}

export interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon?: string;
}

export interface PatternAchievements {
  cleanRectangle: boolean; // track score > 88%
  radioPerfect: boolean; // all radio calls correct in one flight
  trafficSafe: boolean; // no spacing warnings in one flight
  speedDemon: boolean; // completed under 90s
  textbookCount: number; // number of textbook grades
}

/** Per-category score history across recent flights (for weak-area tracking). */
export interface CategoryAttempt {
  category: "entry" | "track" | "altitude" | "turn-timing" | "radio" | "sequencing";
  score: number; // 0-100
  ts: number;
}

export interface FocusArea {
  category: CategoryAttempt["category"];
  label: string;
  missCount: number; // recent flights scoring < 55
  recentAvg: number; // average of last N
}

interface ProgressState {
  games: Record<GameId, GameProgress>;
  /** Free attempts remaining across the suite (share-to-earn adds more). */
  freeAttempts: number;
  /** Whether the player has earned the bonus attempt from sharing a track. */
  shareBonusClaimed: boolean;
  /** Funnel counters (mirror of server-side, for local display). */
  events: Record<string, number>;
  /** XP + level progression (pattern-perfect awards XP per flight). */
  xp: number;
  level: number;
  /** Consecutive flights scoring ≥70. */
  streak: number;
  bestStreak: number;
  /** Pattern-specific achievements. */
  achievements: PatternAchievements;
  /** Per-category score history (recent flights) for weak-area tracking. */
  categoryHistory: CategoryAttempt[];
  /** Persisted user settings (survive reload). */
  settings: { timeOfDay: "dawn" | "day" | "dusk" | "night"; muted: boolean };

  // actions
  recordCompletion: (game: GameId, score: number, grade?: PatternGrade) => void;
  registerAttempt: (game: GameId) => void;
  spendAttempt: () => boolean;
  claimShareBonus: () => void;
  setSetting: (key: "timeOfDay" | "muted", value: string | boolean) => void;
  recordEvent: (name: string) => void;
  /** Record a pattern-perfect flight result with rich detail for XP/achievements. */
  recordPatternFlight: (r: {
    score: number;
    grade: PatternGrade;
    flightTimeSec: number;
    trackPct: number;
    radioPerfect: boolean;
    noWarnings: boolean;
    categoryScores?: CategoryAttempt[];
  }) => void;
  /** Preview-only: mark an unbuilt game as completed so the First Solo badge
   *  logic can be verified from any completion order. No-op on pattern-perfect. */
  previewComplete: (game: GameId) => void;
  resetAll: () => void;
  isFirstSoloUnlocked: () => boolean;
  badges: () => BadgeInfo[];
  levelProgress: () => { current: number; needed: number; pct: number };
  focusAreas: () => FocusArea[];
}

const emptyGame = (): GameProgress => ({
  completed: false,
  bestScore: 0,
  attempts: 0,
  lastPlayedAt: null,
});

const STARTING_ATTEMPTS = 5;

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      games: {
        "landing-flare": emptyGame(),
        "radio-call": emptyGame(),
        "pattern-perfect": emptyGame(),
      },
      freeAttempts: STARTING_ATTEMPTS,
      shareBonusClaimed: false,
      events: {},
      xp: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      achievements: {
        cleanRectangle: false,
        radioPerfect: false,
        trafficSafe: false,
        speedDemon: false,
        textbookCount: 0,
      },
      categoryHistory: [],
      settings: { timeOfDay: "dusk", muted: false },

      recordCompletion: (game, score, grade) =>
        set((s) => {
          const prev = s.games[game];
          return {
            games: {
              ...s.games,
              [game]: {
                completed: true,
                bestScore: Math.max(prev.bestScore, score),
                bestGrade: grade ?? prev.bestGrade,
                attempts: prev.attempts + 1,
                lastPlayedAt: Date.now(),
              },
            },
          };
        }),

      registerAttempt: (game) =>
        set((s) => {
          const prev = s.games[game];
          return {
            games: {
              ...s.games,
              [game]: {
                ...prev,
                attempts: prev.attempts + 1,
                lastPlayedAt: Date.now(),
              },
            },
          };
        }),

      spendAttempt: () => {
        if (get().freeAttempts <= 0) return false;
        set((s) => ({ freeAttempts: s.freeAttempts - 1 }));
        return true;
      },

      claimShareBonus: () =>
        set((s) =>
          s.shareBonusClaimed
            ? s
            : {
                shareBonusClaimed: true,
                freeAttempts: s.freeAttempts + 1,
              },
        ),

      setSetting: (key, value) =>
        set((s) => ({
          settings: {
            ...s.settings,
            [key]: value,
          },
        })),

      recordEvent: (name) =>
        set((s) => ({
          events: { ...s.events, [name]: (s.events[name] ?? 0) + 1 },
        })),

      recordPatternFlight: (r) =>
        set((s) => {
          const xpGain = Math.round(r.score * 10) + (r.grade === "textbook" ? 200 : 0);
          const newXp = s.xp + xpGain;
          const newLevel = Math.floor(newXp / 1000) + 1;
          const passed = r.score >= 70 && r.grade !== "redo";
          const newStreak = passed ? s.streak + 1 : 0;
          const newBestStreak = Math.max(s.bestStreak, newStreak);
          const ach = { ...s.achievements };
          if (r.trackPct >= 88) ach.cleanRectangle = true;
          if (r.radioPerfect) ach.radioPerfect = true;
          if (r.noWarnings) ach.trafficSafe = true;
          if (r.flightTimeSec < 90 && r.grade !== "redo") ach.speedDemon = true;
          if (r.grade === "textbook") ach.textbookCount += 1;
          // Append per-category scores to history (capped to last ~60 entries).
          const newHistory = r.categoryScores
            ? [...s.categoryHistory, ...r.categoryScores].slice(-60)
            : s.categoryHistory;
          return {
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            bestStreak: newBestStreak,
            achievements: ach,
            categoryHistory: newHistory,
          };
        }),

      previewComplete: (game) => {
        if (game === "pattern-perfect") return; // pattern-perfect is played for real
        set((s) => {
          const prev = s.games[game];
          if (prev.completed) return s;
          return {
            games: {
              ...s.games,
              [game]: {
                completed: true,
                bestScore: 100,
                attempts: 1,
                lastPlayedAt: Date.now(),
              },
            },
          };
        });
      },

      resetAll: () =>
        set({
          games: {
            "landing-flare": emptyGame(),
            "radio-call": emptyGame(),
            "pattern-perfect": emptyGame(),
          },
          freeAttempts: STARTING_ATTEMPTS,
          shareBonusClaimed: false,
          events: {},
          xp: 0,
          level: 1,
          streak: 0,
          bestStreak: 0,
          achievements: {
            cleanRectangle: false,
            radioPerfect: false,
            trafficSafe: false,
            speedDemon: false,
            textbookCount: 0,
          },
          categoryHistory: [],
          settings: { timeOfDay: "dusk", muted: false },
        }),

      isFirstSoloUnlocked: () => {
        const g = get().games;
        return (
          g["landing-flare"].completed &&
          g["radio-call"].completed &&
          g["pattern-perfect"].completed
        );
      },

      badges: () => {
        const g = get().games;
        const ach = get().achievements;
        const firstSolo =
          g["landing-flare"].completed &&
          g["radio-call"].completed &&
          g["pattern-perfect"].completed;
        return [
          {
            id: "landing-flare",
            title: "Landing Flare",
            description: "Grease one on. Complete the Landing Flare Trainer.",
            unlocked: g["landing-flare"].completed,
          },
          {
            id: "radio-call",
            title: "Radio Call Builder",
            description: "Talk like a pilot. Complete the Radio Call Builder.",
            unlocked: g["radio-call"].completed,
          },
          {
            id: "pattern-perfect",
            title: "Pattern Perfect",
            description: "Fly a clean, called, sequenced traffic pattern.",
            unlocked: g["pattern-perfect"].completed,
          },
          {
            id: "clean-rectangle",
            title: "Clean Rectangle",
            description: "Score 88%+ on ground track in a single flight.",
            unlocked: ach.cleanRectangle,
          },
          {
            id: "radio-perfect",
            title: "Radio Perfect",
            description: "Answer every radio call correctly in one flight.",
            unlocked: ach.radioPerfect,
          },
          {
            id: "traffic-safe",
            title: "Traffic Safe",
            description: "Complete a flight with zero spacing warnings.",
            unlocked: ach.trafficSafe,
          },
          {
            id: "speed-demon",
            title: "Speed Demon",
            description: "Complete the pattern in under 90 seconds.",
            unlocked: ach.speedDemon,
          },
          {
            id: "first-solo",
            title: "First Solo",
            description:
              "Clear all three FlightCourse mini-games. The combined badge.",
            unlocked: firstSolo,
          },
        ];
      },

      levelProgress: () => {
        const { xp, level } = get();
        const currentLevelXp = (level - 1) * 1000;
        const nextLevelXp = level * 1000;
        const current = xp - currentLevelXp;
        const needed = nextLevelXp - currentLevelXp;
        return { current, needed, pct: Math.round((current / needed) * 100) };
      },

      focusAreas: () => {
        const history = get().categoryHistory;
        const labels: Record<CategoryAttempt["category"], string> = {
          entry: "45° entry",
          track: "Ground track",
          altitude: "Altitude discipline",
          "turn-timing": "Turn timing",
          radio: "Radio calls",
          sequencing: "Traffic sequencing",
        };
        const cats: CategoryAttempt["category"][] = [
          "entry",
          "track",
          "altitude",
          "turn-timing",
          "radio",
          "sequencing",
        ];
        return cats
          .map((cat) => {
            const recent = history.filter((h) => h.category === cat).slice(-5);
            if (recent.length === 0) return null;
            const missCount = recent.filter((r) => r.score < 55).length;
            const recentAvg = Math.round(recent.reduce((a, b) => a + b.score, 0) / recent.length);
            return { category: cat, label: labels[cat], missCount, recentAvg };
          })
          .filter((f): f is FocusArea => f !== null && f.missCount > 0)
          .sort((a, b) => b.missCount - a.missCount);
      },
    }),
    {
      name: "flightcourse-progress-v2",
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
);
