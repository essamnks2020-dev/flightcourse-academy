"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { LayoutDashboard, LogOut, Sparkles, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function UserMenu({
  name,
  email,
  isPro,
}: {
  name: string
  email: string
  isPro: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "P"

  async function handleSignOut() {
    setPending(true)
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 pl-1.5"
            aria-label="Account menu"
          />
        }
      >
        <span className="bg-secondary text-secondary-foreground flex size-7 items-center justify-center rounded-full text-[0.6875rem] font-semibold">
          {initials}
        </span>
        <span className="hidden max-w-24 truncate sm:inline">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {email}
          </span>
          <span className="label-instrument text-primary mt-1">
            {isPro ? "Pro member" : "Free plan"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard className="size-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/course" />}>
          <User className="size-4" />
          My course
        </DropdownMenuItem>
        {!isPro ? (
          <DropdownMenuItem render={<Link href="/pricing" />}>
            <Sparkles className="size-4" />
            Upgrade to Pro
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={pending}>
          <LogOut className="size-4" />
          {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
