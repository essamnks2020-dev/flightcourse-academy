import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Create your account — FlightCourse Academy",
  description:
    "Create a free FlightCourse Academy account to save progress, earn badges, and sync your training-game scores.",
};

export default function SignUpPage() {
  return <AuthCard mode="sign-up" />;
}
