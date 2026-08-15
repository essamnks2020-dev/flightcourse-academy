'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Attempt, LandingQuality, ScenarioId } from '@/lib/aviation'
import { FREE_PLAYS_INITIAL, UNLOCK_PRICE, DAILY_SHARE_CAP } from '@/lib/aviation'
import { track } from '@/lib/funnel'
import { useProgress } from '@/lib/progress-store'

/**
 * FlightCourse shared progress store.
 * --------------------------------------------------------------
 * This is THE integration hub. The Landing Flare Trainer writes landing
 * results here; the Progress Dashboard reads from here; the free-play /
 * paywall / share-unlock economy lives here. Designed so a real backend
 * (Prisma leaderboard) can sync `attempts` / `bestScore` later without a
 * rewrite — every field is plain JSON-serializable.
 */

export interface Badge {
  id: string
  label: string
  description: string
  earnedAt: number
}

export interface ProgressState {
  // --- Landing history & stats ---
  attempts: Attempt[]
  bestScore: number
  bestQuality: LandingQuality | null
  totalLandings: number
  totalFlights: number
  greaserCount: number
  badges: Badge[]

  // --- Free-play economy ---
  freePlays: number
  freePlaysUsed: number
  unlimitedUnlocked: boolean
  bonusPlaysEarned: number
  sharesToday: number
  lastShareDate: string | null // YYYY-MM-DD

  // --- Identity ---
  playerId: string // anonymous client id for leaderboard sync (§3.1)

  // --- Settings ---
  scenario: ScenarioId // currently selected scenario (replaces crosswind boolean)
  soundOn: boolean // persisted mute state (§2.3)
  voiceCallouts: boolean // speechSynthesis altitude callouts (§2.4)
  reducedMotion: boolean // disables shake/particles/pulsing (§4.2/4.3)
  colorblindMode: boolean // numeric PAPI readout alongside lights (§4.2)

  // --- Actions ---
  canPlay: () => boolean
  consumePlay: () => boolean
  recordAttempt: (a: Attempt) => { newBadges: string[]; bonusGranted: boolean }
  grantShareBonus: () => boolean
  purchaseUnlock: () => void
  registerShare: () => boolean
  setScenario: (v: ScenarioId) => void
  setSound: (v: boolean) => void
  setVoiceCallouts: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
  setColorblindMode: (v: boolean) => void
  reset: () => void
}

export const BADGE_DEFS: Record<string, { label: string; description: string }> = {
  first_landing: { label: 'First Flight', description: 'Completed your first landing.' },
  greaser: { label: 'Greaser', description: 'Stuck a greaser — under 80 fpm touchdown.' },
  smooth_operator: { label: 'Smooth Operator', description: 'Five greaser landings.' },
  stall_recovery: { label: 'Stall Recovery', description: 'Landed safely after a stall on approach.' },
  crosswind_ace: { label: 'Crosswind Ace', description: 'Good-or-better landing in a crosswind.' },
  bounce_master: { label: 'Bounce Master', description: 'Recovered from a bounce to a clean landing.' },
  century_club: { label: 'Century Club', description: '25 total landings.' },
  unlocked: { label: 'Unlimited', description: 'Unlocked unlimited flare practice.' },
  sharpshooter: { label: 'Sharpshooter', description: 'Best score of 95+.' },
  night_ops: { label: 'Night Ops', description: 'Completed a landing at night.' },
  fog_landing: { label: 'Fog Pilot', description: 'Landed in low-visibility fog.' },
  short_field: { label: 'Short Field', description: 'Landed on the short grass strip.' },
  gusty_landing: { label: 'Gusty', description: 'Landed in gusty, turbulent conditions.' },
  consistent: { label: 'Consistent', description: '5 landings within a 15-point score band.' },
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

// Higher rank = better quality, for bestQuality tracking.
const QUALITY_ORDER: LandingQuality[] = [
  'crash',
  'stall',
  'porpoise',
  'bounce',
  'hard',
  'firm',
  'good',
  'greaser',
]
function qualityRank(q: LandingQuality): number {
  return QUALITY_ORDER.indexOf(q)
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      attempts: [],
      bestScore: 0,
      bestQuality: null,
      totalLandings: 0,
      totalFlights: 0,
      greaserCount: 0,
      badges: [],

      freePlays: FREE_PLAYS_INITIAL,
      freePlaysUsed: 0,
      unlimitedUnlocked: false,
      bonusPlaysEarned: 0,
      sharesToday: 0,
      lastShareDate: null,

      playerId: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36),
      scenario: 'dusk',
      soundOn: true,
      voiceCallouts: false,
      reducedMotion: false,
      colorblindMode: false,

      canPlay: () => {
        const s = get()
        return s.unlimitedUnlocked || s.freePlays > 0
      },

      consumePlay: () => {
        const s = get()
        if (s.unlimitedUnlocked) {
          track.gameStart(s.freePlays, true, s.scenario === 'crosswind')
          set({ totalFlights: s.totalFlights + 1 })
          return true
        }
        if (s.freePlays <= 0) {
          track.paywallHit(0)
          return false
        }
        const remaining = s.freePlays - 1
        set({
          freePlays: remaining,
          freePlaysUsed: s.freePlaysUsed + 1,
          totalFlights: s.totalFlights + 1,
        })
        track.gameStart(remaining, s.unlimitedUnlocked, s.scenario === 'crosswind')
        return true
      },

      recordAttempt: (a) => {
        const s = get()
        const next = [a, ...s.attempts].slice(0, 50)
        const newBest = Math.max(s.bestScore, a.score)
        const newBadges: string[] = []

        const grant = (id: string) => {
          if (!s.badges.find((b) => b.id === id) && !newBadges.includes(id)) {
            newBadges.push(id)
            track.badgeEarned(id)
          }
        }

        if (s.totalLandings === 0) grant('first_landing')
        if (a.quality === 'greaser') {
          grant('greaser')
          if (s.greaserCount + 1 >= 5) grant('smooth_operator')
        }
        if (a.stalled && a.quality !== 'crash' && a.quality !== 'stall') {
          grant('stall_recovery')
        }
        if (a.crosswind && ['greaser', 'good', 'firm'].includes(a.quality)) {
          grant('crosswind_ace')
        }
        if (a.bounces >= 1 && ['greaser', 'good', 'firm'].includes(a.quality)) {
          grant('bounce_master')
        }
        if (s.totalLandings + 1 >= 25) grant('century_club')
        if (newBest >= 95) grant('sharpshooter')

        // Scenario-specific badges (§3.3)
        if (a.scenarioId === 'night' && a.quality !== 'crash') grant('night_ops')
        if (a.scenarioId === 'fog' && a.quality !== 'crash') grant('fog_landing')
        if (a.scenarioId === 'short-field' && a.quality !== 'crash') grant('short_field')
        if (a.scenarioId === 'gusty' && a.quality !== 'crash') grant('gusty_landing')

        // Consistency badge: 5 landings within a 15-point score band (§3.3)
        if (s.attempts.length >= 4) {
          const last5 = s.attempts.slice(0, 4).map((x) => x.score).concat(a.score)
          const band = Math.max(...last5) - Math.min(...last5)
          if (band <= 15) grant('consistent')
        }

        // Leaderboard submission (§3.1) — fire-and-forget, graceful degradation.
        // The API route already handles DB-unavailable by returning a non-error
        // status with `{ ok: false, error: 'db_unavailable' }`.
        if (typeof window !== 'undefined') {
          fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: s.playerId,
              score: a.score,
              quality: a.quality,
              touchdownVSI: a.touchdownVSI,
              touchdownAirspeed: a.touchdownAirspeed,
              touchdownDistance: a.touchdownDistance,
              flareAltitude: a.flareAltitude,
              bounces: a.bounces,
              stalled: a.stalled,
              crosswind: a.crosswind,
              durationMs: a.duration,
              totalLandings: s.totalLandings + 1,
            }),
          }).then(() => {
            track.leaderboardSubmit(a.score, a.quality)
          }).catch(() => {
            // Silent — offline-first, the game never depends on this
          })
        }

        const newBadgesObj: Badge[] = newBadges.map((id) => ({
          id,
          label: BADGE_DEFS[id]?.label ?? id,
          description: BADGE_DEFS[id]?.description ?? '',
          earnedAt: Date.now(),
        }))

        // Completing a landing grants a bonus play ONLY on the first landing
        // (a welcome bonus that hooks new pilots). After that, the ongoing
        // growth lever is sharing — which keeps the "5 free plays, then
        // $4.99" backstop real while sharing remains the acquisition channel.
        let freePlays = s.freePlays
        let bonusPlaysEarned = s.bonusPlaysEarned
        let bonusGranted = false
        if (!s.unlimitedUnlocked) {
          const isFirst = s.totalLandings === 0
          if (isFirst) {
            freePlays += 2
            bonusPlaysEarned += 2
            bonusGranted = true
            track.bonusPlayGranted('first_landing', freePlays)
          }
        }

        const bestQuality =
          s.bestQuality === null
            ? a.quality
            : qualityRank(a.quality) > qualityRank(s.bestQuality)
              ? a.quality
              : s.bestQuality

        set({
          attempts: next,
          bestScore: newBest,
          bestQuality,
          totalLandings: s.totalLandings + 1,
          greaserCount: s.greaserCount + (a.quality === 'greaser' ? 1 : 0),
          badges: [...s.badges, ...newBadgesObj],
          freePlays,
          bonusPlaysEarned,
        })

        track.gameComplete(a.quality, a.score, a.bounces, a.stalled, a.crosswind, a.duration)

        // Bridge: award XP in the MAIN progress store for good landings, so
        // landings count toward license tiers alongside module quizzes.
        // Greaser = 5 XP, good = 3 XP, firm = 2 XP (about 1/4 of a module's XP).
        if (['greaser', 'good', 'firm'].includes(a.quality)) {
          const xpGain = a.quality === 'greaser' ? 5 : a.quality === 'good' ? 3 : 2
          useProgress.setState((s) => ({ xp: s.xp + xpGain }))
        }

        return { newBadges, bonusGranted }
      },

      grantShareBonus: () => {
        const s = get()
        if (s.unlimitedUnlocked) return false
        set({
          freePlays: s.freePlays + 1,
          bonusPlaysEarned: s.bonusPlaysEarned + 1,
        })
        track.bonusPlayGranted('share', s.freePlays + 1)
        return true
      },

      registerShare: () => {
        const s = get()
        const today = todayKey()
        const sameDay = s.lastShareDate === today
        const countToday = sameDay ? s.sharesToday : 0
        if (countToday >= DAILY_SHARE_CAP) return false
        set({ sharesToday: countToday + 1, lastShareDate: today })
        return true
      },

      purchaseUnlock: () => {
        const s = get()
        const has = s.badges.find((b) => b.id === 'unlocked')
        const badges = has
          ? s.badges
          : [
              ...s.badges,
              {
                id: 'unlocked',
                label: BADGE_DEFS.unlocked.label,
                description: BADGE_DEFS.unlocked.description,
                earnedAt: Date.now(),
              },
            ]
        set({ unlimitedUnlocked: true, badges })
        if (!has) track.badgeEarned('unlocked')
        track.unlockPurchased(UNLOCK_PRICE)
      },

      setScenario: (v) => set({ scenario: v }),
      setSound: (v) => set({ soundOn: v }),
      setVoiceCallouts: (v) => set({ voiceCallouts: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setColorblindMode: (v) => set({ colorblindMode: v }),

      reset: () =>
        set({
          attempts: [],
          bestScore: 0,
          bestQuality: null,
          totalLandings: 0,
          totalFlights: 0,
          greaserCount: 0,
          badges: [],
          freePlays: FREE_PLAYS_INITIAL,
          freePlaysUsed: 0,
          unlimitedUnlocked: false,
          bonusPlaysEarned: 0,
          sharesToday: 0,
          lastShareDate: null,
          // keep playerId + settings on reset — only wipe progress
        }),
    }),
    {
      name: 'flightcourse-progress',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // v2 migration: crosswind boolean → scenario id; add new settings + playerId
      migrate: (persisted: unknown, version: number) => {
        const s = (persisted ?? {}) as Record<string, unknown>
        if (version < 2) {
          if (s.crosswind === true) s.scenario = 'crosswind'
          else s.scenario = 'dusk'
          delete s.crosswind
          if (!s.playerId) {
            s.playerId =
              typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2) + Date.now().toString(36)
          }
          if (s.voiceCallouts === undefined) s.voiceCallouts = false
          if (s.reducedMotion === undefined) s.reducedMotion = false
          if (s.colorblindMode === undefined) s.colorblindMode = false
        }
        return s as unknown as ProgressState
      },
    },
  ),
)
