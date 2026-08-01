import { AuthForm } from "@/components/auth-form"
import { AuthShell } from "@/components/site/auth-shell"
import { auth } from "@/lib/auth"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to FlightCourse Academy to pick up where you left off.",
}

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  return (
    <AuthShell
      title="Welcome back to the flight deck"
      subtitle="Sign in to resume your syllabus, keep your streak alive and see your rank."
    >
      <AuthForm mode="sign-in" />
    </AuthShell>
  )
}
