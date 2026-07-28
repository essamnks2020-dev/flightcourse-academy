export interface NavItem {
  href: string
  label: string
  description: string
}

/** Primary marketing + app navigation, shared by the header and the footer. */
export const primaryNav: NavItem[] = [
  {
    href: "/course",
    label: "Course",
    description: "All 16 modules, in flying order",
  },
  {
    href: "/games",
    label: "Drills",
    description: "Timed mini-games for cockpit skills",
  },
  {
    href: "/cockpit",
    label: "Cockpit",
    description: "Explore every instrument on the panel",
  },
  {
    href: "/glossary",
    label: "Glossary",
    description: "Plain-English aviation terms",
  },
  {
    href: "/setup",
    label: "Setup",
    description: "Pick a simulator and the right hardware",
  },
  {
    href: "/pricing",
    label: "Pricing",
    description: "Free modules and what Pro adds",
  },
]

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Learn",
    items: [
      primaryNav[0],
      primaryNav[1],
      primaryNav[2],
      {
        href: "/checklists",
        label: "Checklists",
        description: "Printable flows for the C172",
      },
    ],
  },
  {
    title: "Get started",
    items: [
      primaryNav[3],
      primaryNav[4],
      { href: "/sign-up", label: "Create account", description: "Free" },
      { href: "/dashboard", label: "Dashboard", description: "Your progress" },
    ],
  },
  {
    title: "About",
    items: [
      { href: "/faq", label: "FAQ", description: "Common questions" },
      {
        href: "/course/welcome-to-flight-simulation",
        label: "Start module 1",
        description: "No account needed",
      },
    ],
  },
]
