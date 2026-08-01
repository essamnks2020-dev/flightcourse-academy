-- FlightCourse Academy schema. Safe to re-run.

/* ---------------------------------------------------------------------------
 * Better Auth core tables (camelCase columns to match its defaults).
 * ------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

/* ---------------------------------------------------------------------------
 * Application tables. Every row carries userId for per-query scoping.
 * ------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS "profile" (
  "userId" text PRIMARY KEY,
  "plan" text NOT NULL DEFAULT 'free',
  "stripeCustomerId" text,
  "stripeSubscriptionId" text,
  "planExpiresAt" timestamp,
  "simPlatform" text,
  "goal" text,
  "xp" integer NOT NULL DEFAULT 0,
  "streakCount" integer NOT NULL DEFAULT 0,
  "longestStreak" integer NOT NULL DEFAULT 0,
  "lastActiveDate" text,
  "onboardedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "lesson_progress" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "moduleSlug" text NOT NULL,
  "lessonSlug" text NOT NULL,
  "status" text NOT NULL DEFAULT 'in_progress',
  "quizScore" integer,
  "quizTotal" integer,
  "secondsSpent" integer NOT NULL DEFAULT 0,
  "completedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "lesson_progress_unique"
  ON "lesson_progress" ("userId", "moduleSlug", "lessonSlug");

CREATE TABLE IF NOT EXISTS "user_badge" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "badgeSlug" text NOT NULL,
  "earnedAt" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_badge_unique"
  ON "user_badge" ("userId", "badgeSlug");

CREATE TABLE IF NOT EXISTS "bookmark" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "kind" text NOT NULL,
  "refSlug" text NOT NULL,
  "label" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "bookmark_unique"
  ON "bookmark" ("userId", "kind", "refSlug");

CREATE TABLE IF NOT EXISTS "logbook_entry" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "flightDate" text NOT NULL,
  "aircraft" text NOT NULL,
  "departure" text,
  "arrival" text,
  "durationMinutes" integer NOT NULL DEFAULT 0,
  "landings" integer NOT NULL DEFAULT 0,
  "notes" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "logbook_userId_idx" ON "logbook_entry" ("userId");

/* ---------------------------------------------------------------------------
 * Mini-game scores. One row per attempt; leaderboards read the best per user.
 * ------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS "game_score" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "gameSlug" text NOT NULL,
  "score" integer NOT NULL DEFAULT 0,
  "accuracy" integer,
  "durationSeconds" integer NOT NULL DEFAULT 0,
  "meta" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "game_score_user_game_idx"
  ON "game_score" ("userId", "gameSlug");
CREATE INDEX IF NOT EXISTS "game_score_leaderboard_idx"
  ON "game_score" ("gameSlug", "score" DESC);
