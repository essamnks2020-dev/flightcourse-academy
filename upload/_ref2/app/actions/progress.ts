"use server"

import { courseModules, moduleBySlug } from "@/lib/content/course"
import { gameBySlug } from "@/lib/content/games"
import { db } from "@/lib/db"
import {
  gameScore,
  lessonProgress,
  logbookEntry,
  profile,
  userBadge,
} from "@/lib/db/schema"
import { evaluateBadges, nextStreak } from "@/lib/gamification"
import { getUserId } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/** Ensures a profile row exists before we update counters against it. */
async function ensureProfile(userId: string) {
  await db.insert(profile).values({ userId }).onConflictDoNothing()
}

export interface ProgressSnapshot {
  completedSlugs: string[]
  inProgressSlugs: string[]
  quizScores: Record<string, { score: number; total: number }>
  xp: number
  streakCount: number
  longestStreak: number
  badgeSlugs: string[]
  logbookCount: number
}

export async function getProgress(): Promise<ProgressSnapshot> {
  const userId = await getUserId()
  await ensureProfile(userId)

  const [rows, profileRows, badgeRows, logCount] = await Promise.all([
    db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId)),
    db.select().from(profile).where(eq(profile.userId, userId)).limit(1),
    db.select().from(userBadge).where(eq(userBadge.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(logbookEntry)
      .where(eq(logbookEntry.userId, userId)),
  ])

  const quizScores: ProgressSnapshot["quizScores"] = {}
  for (const r of rows) {
    if (r.quizScore != null && r.quizTotal != null) {
      quizScores[r.moduleSlug] = { score: r.quizScore, total: r.quizTotal }
    }
  }

  return {
    completedSlugs: rows
      .filter((r) => r.status === "completed")
      .map((r) => r.moduleSlug),
    inProgressSlugs: rows
      .filter((r) => r.status === "in_progress")
      .map((r) => r.moduleSlug),
    quizScores,
    xp: profileRows[0]?.xp ?? 0,
    streakCount: profileRows[0]?.streakCount ?? 0,
    longestStreak: profileRows[0]?.longestStreak ?? 0,
    badgeSlugs: badgeRows.map((b) => b.badgeSlug),
    logbookCount: logCount[0]?.count ?? 0,
  }
}

/** Marks a module opened so the dashboard can show "continue where you left off". */
export async function startModule(moduleSlug: string) {
  const userId = await getUserId()
  if (!moduleBySlug.has(moduleSlug)) throw new Error("Unknown module")
  await ensureProfile(userId)

  await db
    .insert(lessonProgress)
    .values({ userId, moduleSlug, lessonSlug: "main", status: "in_progress" })
    .onConflictDoNothing()
}

export interface CompleteResult {
  xp: number
  streakCount: number
  newBadges: string[]
  alreadyComplete: boolean
}

/**
 * Completes a module. Idempotent: XP is only granted the first time, so
 * re-taking a quiz can improve a score without inflating XP.
 */
export async function completeModule(
  moduleSlug: string,
  quiz: { score: number; total: number },
  today: string,
): Promise<CompleteResult> {
  const userId = await getUserId()
  const mod = moduleBySlug.get(moduleSlug)
  if (!mod) throw new Error("Unknown module")
  await ensureProfile(userId)

  const existing = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.moduleSlug, moduleSlug),
      ),
    )
    .limit(1)

  const alreadyComplete = existing[0]?.status === "completed"
  const bestScore = Math.max(existing[0]?.quizScore ?? 0, quiz.score)

  await db
    .insert(lessonProgress)
    .values({
      userId,
      moduleSlug,
      lessonSlug: "main",
      status: "completed",
      quizScore: quiz.score,
      quizTotal: quiz.total,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        lessonProgress.userId,
        lessonProgress.moduleSlug,
        lessonProgress.lessonSlug,
      ],
      set: {
        status: "completed",
        quizScore: bestScore,
        quizTotal: quiz.total,
        completedAt: existing[0]?.completedAt ?? new Date(),
        updatedAt: new Date(),
      },
    })

  const profileRows = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1)
  const current = profileRows[0]

  const streak = nextStreak(
    current?.lastActiveDate ?? null,
    today,
    current?.streakCount ?? 0,
  )
  const gainedXp = alreadyComplete ? 0 : mod.xpReward
  const newXp = (current?.xp ?? 0) + gainedXp

  await db
    .update(profile)
    .set({
      xp: newXp,
      streakCount: streak,
      longestStreak: Math.max(current?.longestStreak ?? 0, streak),
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId))

  const newBadges = await syncBadges(userId)

  revalidatePath("/dashboard")
  revalidatePath(`/course/${moduleSlug}`)
  revalidatePath("/course")

  return { xp: newXp, streakCount: streak, newBadges, alreadyComplete }
}

/** Recomputes badge eligibility and inserts any newly earned ones. */
export async function syncBadges(userId: string): Promise<string[]> {
  const [rows, profileRows, existing, logCount, gameRows] = await Promise.all([
    db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId)),
    db.select().from(profile).where(eq(profile.userId, userId)).limit(1),
    db.select().from(userBadge).where(eq(userBadge.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(logbookEntry)
      .where(eq(logbookEntry.userId, userId)),
    db
      .select({
        gameSlug: gameScore.gameSlug,
        bestAccuracy: sql<number>`coalesce(max(${gameScore.accuracy}), 0)::int`,
        runs: sql<number>`count(*)::int`,
      })
      .from(gameScore)
      .where(eq(gameScore.userId, userId))
      .groupBy(gameScore.gameSlug),
  ])

  // A drill counts as passed once its own pass mark has been beaten.
  const gamesPassed = gameRows.filter((g) => {
    const def = gameBySlug.get(g.gameSlug)
    return def ? g.bestAccuracy >= def.passMark : false
  }).length
  const perfectGames = gameRows.filter((g) => g.bestAccuracy >= 100).length
  const gameRuns = gameRows.reduce((sum, g) => sum + g.runs, 0)

  const completed = rows.filter((r) => r.status === "completed")
  const completedModuleIds = completed
    .map((r) => courseModules.find((m) => m.slug === r.moduleSlug)?.id)
    .filter((id): id is number => typeof id === "number")

  const perfectQuizzes = completed.filter(
    (r) => r.quizTotal != null && r.quizScore === r.quizTotal,
  ).length

  const eligible = evaluateBadges({
    completedModuleIds,
    xp: profileRows[0]?.xp ?? 0,
    streakCount: profileRows[0]?.streakCount ?? 0,
    perfectQuizzes,
    logbookEntries: logCount[0]?.count ?? 0,
    gamesPassed,
    perfectGames,
    gameRuns,
  })

  const owned = new Set(existing.map((b) => b.badgeSlug))
  const fresh = eligible.filter((slug) => !owned.has(slug))

  if (fresh.length > 0) {
    await db
      .insert(userBadge)
      .values(fresh.map((badgeSlug) => ({ userId, badgeSlug })))
      .onConflictDoNothing()
  }

  return fresh
}

/** Records activity for streak purposes without completing anything. */
export async function touchStreak(today: string) {
  const userId = await getUserId()
  await ensureProfile(userId)

  const rows = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1)
  const current = rows[0]
  if (current?.lastActiveDate === today) return

  const streak = nextStreak(
    current?.lastActiveDate ?? null,
    today,
    current?.streakCount ?? 0,
  )

  await db
    .update(profile)
    .set({
      streakCount: streak,
      longestStreak: Math.max(current?.longestStreak ?? 0, streak),
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId))
}

export async function resetProgress() {
  const userId = await getUserId()
  await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId))
  await db.delete(userBadge).where(eq(userBadge.userId, userId))
  await db
    .update(profile)
    .set({ xp: 0, streakCount: 0, lastActiveDate: null, updatedAt: new Date() })
    .where(eq(profile.userId, userId))
  revalidatePath("/dashboard")
}
