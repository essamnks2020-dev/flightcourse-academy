"use server"

import { gameBySlug } from "@/lib/content/games"
import { db } from "@/lib/db"
import { gameScore, profile } from "@/lib/db/schema"
import { nextStreak } from "@/lib/gamification"
import { getUserId } from "@/lib/session"
import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function ensureProfile(userId: string) {
  await db.insert(profile).values({ userId }).onConflictDoNothing()
}

export interface GameStat {
  gameSlug: string
  best: number
  bestAccuracy: number
  attempts: number
  lastPlayedAt: string | null
}

/** Personal bests per game for the signed-in user. */
export async function getGameStats(): Promise<GameStat[]> {
  const userId = await getUserId()

  const rows = await db
    .select({
      gameSlug: gameScore.gameSlug,
      best: sql<number>`max(${gameScore.score})::int`,
      bestAccuracy: sql<number>`coalesce(max(${gameScore.accuracy}), 0)::int`,
      attempts: sql<number>`count(*)::int`,
      lastPlayedAt: sql<string>`max(${gameScore.createdAt})::text`,
    })
    .from(gameScore)
    .where(eq(gameScore.userId, userId))
    .groupBy(gameScore.gameSlug)

  return rows
}

export interface GameRunResult {
  best: number
  isPersonalBest: boolean
  xpAwarded: number
  totalXp: number
  streakCount: number
  passed: boolean
}

/**
 * Records a completed run. XP is granted only the first time a player passes a
 * given game, so replaying to chase a high score can't farm XP.
 */
export async function submitGameRun(input: {
  gameSlug: string
  score: number
  accuracy: number
  durationSeconds: number
  today: string
}): Promise<GameRunResult> {
  const userId = await getUserId()
  const game = gameBySlug.get(input.gameSlug)
  if (!game) throw new Error("Unknown game")

  // Never trust client numbers: clamp to what the game can actually produce.
  const score = Math.max(0, Math.min(game.rounds, Math.round(input.score)))
  const accuracy = Math.max(0, Math.min(100, Math.round(input.accuracy)))
  const durationSeconds = Math.max(
    0,
    Math.min(game.seconds * 3, Math.round(input.durationSeconds)),
  )

  await ensureProfile(userId)

  const previous = await db
    .select({
      best: sql<number>`coalesce(max(${gameScore.score}), -1)::int`,
      passedBefore: sql<number>`count(*) filter (where ${gameScore.accuracy} >= ${game.passMark})::int`,
    })
    .from(gameScore)
    .where(
      and(eq(gameScore.userId, userId), eq(gameScore.gameSlug, input.gameSlug)),
    )

  const previousBest = previous[0]?.best ?? -1
  const passedBefore = (previous[0]?.passedBefore ?? 0) > 0
  const passed = accuracy >= game.passMark

  await db.insert(gameScore).values({
    userId,
    gameSlug: input.gameSlug,
    score,
    accuracy,
    durationSeconds,
  })

  const profileRows = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1)
  const current = profileRows[0]

  const xpAwarded = passed && !passedBefore ? game.xpReward : 0
  const streak = nextStreak(
    current?.lastActiveDate ?? null,
    input.today,
    current?.streakCount ?? 0,
  )
  const totalXp = (current?.xp ?? 0) + xpAwarded

  await db
    .update(profile)
    .set({
      xp: totalXp,
      streakCount: streak,
      longestStreak: Math.max(current?.longestStreak ?? 0, streak),
      lastActiveDate: input.today,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId))

  revalidatePath("/games")
  revalidatePath(`/games/${input.gameSlug}`)
  revalidatePath("/dashboard")

  return {
    best: Math.max(previousBest, score),
    isPersonalBest: score > previousBest,
    xpAwarded,
    totalXp,
    streakCount: streak,
    passed,
  }
}

export interface RecentRun {
  gameSlug: string
  score: number
  accuracy: number
  createdAt: Date
}

export async function getRecentRuns(limit = 5): Promise<RecentRun[]> {
  const userId = await getUserId()
  const rows = await db
    .select({
      gameSlug: gameScore.gameSlug,
      score: gameScore.score,
      accuracy: gameScore.accuracy,
      createdAt: gameScore.createdAt,
    })
    .from(gameScore)
    .where(eq(gameScore.userId, userId))
    .orderBy(desc(gameScore.createdAt))
    .limit(limit)

  return rows.map((r) => ({ ...r, accuracy: r.accuracy ?? 0 }))
}
