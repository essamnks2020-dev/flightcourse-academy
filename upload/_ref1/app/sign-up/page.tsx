import { AuthForm } from "@/components/auth-form"
import { AuthShell } from "@/components/site/auth-shell"
import { auth } from "@/lib/auth"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Create your free account",
  description:
    "Create a free FlightCourse Academy account to track progress across the 16-module flight simulator syllabus.",
}

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  return (
    <AuthShell
      title="Start your training"
      subtitle="A free account saves your quiz scores, XP and streak. No card required."
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  )
}
