import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profile } from "@/lib/db/schema"
import type { Plan, Viewer } from "@/lib/access"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

/**
 * Resolves the current viewer (session user + their plan) or null when signed
 * out. Server components call this directly; server actions use getUserId().
 */
export async function getViewer(): Promise<Viewer | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const rows = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1)

  let row = rows[0]
  if (!row) {
    // First request after sign-up: create the profile row lazily.
    const inserted = await db
      .insert(profile)
      .values({ userId: session.user.id })
      .onConflictDoNothing()
      .returning()
    row = inserted[0]
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    plan: (row?.plan as Plan) ?? "free",
    planExpiresAt: row?.planExpiresAt ?? null,
  }
}

export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}
