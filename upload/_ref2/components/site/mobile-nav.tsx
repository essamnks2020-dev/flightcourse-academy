"use client"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { primaryNav } from "@/lib/nav"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[19rem] p-0">
        <SheetHeader className="border-border border-b px-5 py-4">
          <SheetTitle className="text-left">
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="hover:bg-muted flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors"
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-muted-foreground text-xs">
                {item.description}
              </span>
            </Link>
          ))}
        </nav>
        <div className="border-border mt-auto flex flex-col gap-2 border-t p-4">
          {signedIn ? (
            <Button
              render={<Link href="/dashboard" />}
              className="h-10 w-full"
              onClick={() => setOpen(false)}
            >
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button
                render={<Link href="/sign-up" />}
                className="h-10 w-full"
                onClick={() => setOpen(false)}
              >
                Start free
              </Button>
              <Button
                variant="outline"
                render={<Link href="/sign-in" />}
                className="h-10 w-full"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
