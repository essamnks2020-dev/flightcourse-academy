import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrument = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = "https://flightcourse.academy";

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
  authors: [{ name: "FlightCourse Academy" }],
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
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b1220",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${body.variable} ${instrument.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
