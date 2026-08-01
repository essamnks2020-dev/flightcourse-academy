import { Logo } from "@/components/brand/logo"
import { footerNav } from "@/lib/nav"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-border bg-panel border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              A real syllabus for simulator pilots. Built by people who fly the
              sim seriously — not a playlist of unstructured videos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h2 className="label-instrument text-muted-foreground">
                  {group.title}
                </h2>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border mt-10 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            {`© ${new Date().getFullYear()} FlightCourse Academy. For simulator use only.`}
          </p>
          <p className="text-muted-foreground text-xs">
            Not for real-world flight training or navigation.
          </p>
        </div>
      </div>
    </footer>
  )
}
