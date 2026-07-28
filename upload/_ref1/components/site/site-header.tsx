import { Logo } from "@/components/brand/logo"
import { MobileNav } from "@/components/site/mobile-nav"
import { UserMenu } from "@/components/site/user-menu"
import { Button } from "@/components/ui/button"
import { isPro } from "@/lib/access"
import { primaryNav } from "@/lib/nav"
import { getViewer } from "@/lib/session"
import Link from "next/link"

export async function SiteHeader() {
  const viewer = await getViewer()
  const pro = isPro(viewer)

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="focus-visible:ring-ring shrink-0 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
        >
          <Logo />
          <span className="sr-only">FlightCourse Academy home</span>
        </Link>

        <nav
          aria-label="Main"
          className="ml-2 hidden items-center gap-1 md:flex"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {viewer ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/dashboard" />}
                className="hidden sm:inline-flex"
              >
                Dashboard
              </Button>
              <UserMenu name={viewer.name} email={viewer.email} isPro={pro} />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/sign-in" />}
                className="hidden sm:inline-flex"
              >
                Sign in
              </Button>
              <Button size="sm" render={<Link href="/sign-up" />}>
                Start free
              </Button>
            </>
          )}
          <MobileNav signedIn={Boolean(viewer)} />
        </div>
      </div>
    </header>
  )
}
