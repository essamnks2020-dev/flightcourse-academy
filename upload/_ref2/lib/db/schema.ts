import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

/* ---------------------------------------------------------------------------
 * Better Auth tables — column names must stay camelCase to match its defaults.
 * ------------------------------------------------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

/* ---------------------------------------------------------------------------
 * Application tables. Every table carries a plain `userId` for scoping.
 * ------------------------------------------------------------------------- */

export const profile = pgTable("profile", {
  userId: text("userId").primaryKey(),
  plan: text("plan").default("free").notNull(),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  planExpiresAt: timestamp("planExpiresAt"),
  simPlatform: text("simPlatform"),
  goal: text("goal"),
  xp: integer("xp").default(0).notNull(),
  streakCount: integer("streakCount").default(0).notNull(),
  longestStreak: integer("longestStreak").default(0).notNull(),
  lastActiveDate: text("lastActiveDate"),
  onboardedAt: timestamp("onboardedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  moduleSlug: text("moduleSlug").notNull(),
  lessonSlug: text("lessonSlug").notNull(),
  status: text("status").default("in_progress").notNull(),
  quizScore: integer("quizScore"),
  quizTotal: integer("quizTotal"),
  secondsSpent: integer("secondsSpent").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const userBadge = pgTable("user_badge", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  badgeSlug: text("badgeSlug").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
})

export const bookmark = pgTable("bookmark", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  kind: text("kind").notNull(),
  refSlug: text("refSlug").notNull(),
  label: text("label"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})

/** One row per mini-game attempt. Personal bests are derived, not stored. */
export const gameScore = pgTable("game_score", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  gameSlug: text("gameSlug").notNull(),
  score: integer("score").default(0).notNull(),
  /** Percentage of rounds answered correctly, 0-100. */
  accuracy: integer("accuracy"),
  durationSeconds: integer("durationSeconds").default(0).notNull(),
  meta: text("meta"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})

export const logbookEntry = pgTable("logbook_entry", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  flightDate: text("flightDate").notNull(),
  aircraft: text("aircraft").notNull(),
  departure: text("departure"),
  arrival: text("arrival"),
  durationMinutes: integer("durationMinutes").default(0).notNull(),
  landings: integer("landings").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})
