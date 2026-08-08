# AGENTS.md

## Cursor Cloud specific instructions

This is **FlightCourse Academy** — a single Next.js 16 (App Router) + React 19 web app for flight-simulator training (syllabus/quizzes, progress tracking, and interactive mini-games). It uses **Bun** as the package manager/runtime, **Prisma + SQLite** for persistence, and (optionally) NextAuth/LLM/TTS features that fail open when their API keys are absent.

### Runtime / tooling
- Use **Bun**, not npm/yarn/pnpm (only `bun.lock` is authoritative). Bun is installed at `~/.bun/bin/bun` and symlinked to `/usr/local/bin/bun`, so it is on `PATH` for non-interactive shells.
- Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`, `db:push`, `db:generate`, `db:migrate`, `db:reset`). The `.zscripts/` helpers (`dev.sh`, `build.sh`, `start.sh`) are for the packaged prod flow and hardcode `/home/z/my-project`; prefer the `package.json` scripts directly for development.

### Database path gotcha (important)
- `.env` sets `DATABASE_URL=file:/home/z/my-project/db/custom.db` — an absolute path from the original authoring machine, NOT the repo path. To make this resolve, `/home/z/my-project` is a **symlink to `/workspace`** (created during environment setup; persisted in the VM snapshot). It points at the repo's real `db/` folder, so `bun run db:push` and the app share the same SQLite file. If the symlink is missing, recreate it with `ln -sfn /workspace /home/z/my-project` before running `db:push` or the dev server, or the DB will fail to open.

### Running the app (development)
- `bun run dev` starts Next.js (Turbopack) on **http://localhost:3000** and tees output to `dev.log`. This is the only service you must run to exercise the product end to end (SQLite is an embedded file, not a separate server).
- `bun run db:push` syncs the Prisma schema and generates the client; run it after schema changes.
- Caddy (`Caddyfile`, port 81) and `mini-services/` are part of the packaged prod path only and are not needed for development (`mini-services/` is currently empty).

### Lint / build / test
- Lint: `bun run lint` (ESLint). Build: `bun run build` (note: `next.config.ts` sets `ignoreBuildErrors: true`, so TypeScript errors do not fail the build — ESLint is the main static gate).
- There is **no automated test suite** (no jest/vitest/playwright, no `test` script). Verify changes by running the dev server and exercising the UI / API routes.

### Optional / fail-open features
- AI Copilot (`/api/pilot-helper`), post-flight debrief (`/api/debrief`), and TTS (`/api/tts`) need external keys (`GEMINI_API_KEY` / `GROQ_API_KEY`, `z-ai-web-dev-sdk`) and return 503 with graceful fallbacks when unset. The Copilot tries Gemini first (`gemini-2.0-flash`), then Groq. OAuth sign-in (NextAuth Google/GitHub, `src/lib/auth.ts`) only activates when a provider's `*_CLIENT_ID`/`*_CLIENT_SECRET` **and** `NEXTAUTH_SECRET` are set; otherwise `/api/auth/providers` is `{}` and the app is fully usable signed-out (progress persists to the browser). For OAuth you also need `NEXTAUTH_URL` to match the site origin (e.g. `http://localhost:3000` locally) and the provider callback `.../api/auth/callback/{github|google}`. The `/api/funnel` analytics endpoint is in-process (in-memory ring buffer, no external dependency).

### Secrets gotcha
- `.env` is **tracked in git** (it only holds `DATABASE_URL`). Do NOT commit real API keys / OAuth secrets / `NEXTAUTH_SECRET` into it. Supply those through the environment (Cursor Secrets → injected as env vars on new VMs), not the committed `.env`. All the routes above read from `process.env`.
