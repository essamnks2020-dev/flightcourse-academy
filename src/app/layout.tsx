import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlightCourse Academy — From Zero to Wheels Up",
  description:
    "Learn to fly in a flight simulator (MSFS, X-Plane) from absolute zero. Cockpit basics, aerodynamics, controls, procedures, navigation, radio comms, weather, and emergencies — taught with patience and real aviation standards.",
  keywords: [
    "flight simulator",
    "learn to fly",
    "MSFS",
    "X-Plane",
    "flight training",
    "aviation",
    "Cessna 172",
    "VFR",
    "pilot training",
  ],
  authors: [{ name: "FlightCourse Academy" }],
  openGraph: {
    title: "FlightCourse Academy — From Zero to Wheels Up",
    description:
      "A flight simulation learning website for total beginners. 16 modules, 50+ terms, interactive cockpit, real checklists.",
    siteName: "FlightCourse Academy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${inter.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
