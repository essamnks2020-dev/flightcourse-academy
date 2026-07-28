import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Instrument_Sans, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const instrument = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
})

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://flightcourse.academy"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FlightCourse Academy — Learn to fly in a flight simulator",
    template: "%s | FlightCourse Academy",
  },
  description:
    "A structured 16-module flight training course for flight simulator pilots. Ground school to IFR, with quizzes, checklists, a cockpit explorer and progress tracking.",
  keywords: [
    "flight simulator course",
    "learn to fly MSFS",
    "flight simulator training",
    "Cessna 172 tutorial",
    "X-Plane ground school",
    "virtual pilot training",
  ],
  generator: "v0.app",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "FlightCourse Academy",
    title: "FlightCourse Academy — Learn to fly in a flight simulator",
    description:
      "16 modules from cold cockpit to IFR approach. Quizzes, checklists, badges and a real syllabus for simulator pilots.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlightCourse Academy",
    description:
      "A real syllabus for flight simulator pilots. Ground school to IFR in 16 modules.",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b1220",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark bg-background ${body.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
