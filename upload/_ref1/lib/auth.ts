import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"

export const auth = betterAuth({
  database: pool,
  // Canonical origin. Requests arriving on any other trusted host (preview
  // deployments, the v0 sandbox, localhost) are still honoured via
  // trustedOrigins below.
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : (process.env.V0_RUNTIME_URL ?? "http://localhost:3000")),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  // The app is served from several hosts that aren't known at build time: the
  // v0 sandbox preview, Vercel preview deployments and localhost. Better Auth
  // supports wildcard patterns here, and will follow the request host for
  // cookies and self-referential links when it matches.
  trustedOrigins: [
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    // v0 sandbox preview + Vercel preview deployment hosts.
    "https://*.vercel.run",
    "https://*.vusercontent.net",
    "https://*.vercel.app",
    // Local development.
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    // The v0 preview renders the app inside a cross-site HTTPS iframe, which
    // requires SameSite=None; Secure cookies. On production (same-site) Lax is
    // both sufficient and safer.
    defaultCookieAttributes:
      process.env.VERCEL_ENV === "production"
        ? { sameSite: "lax" as const, secure: true }
        : { sameSite: "none" as const, secure: true },
  },
})
