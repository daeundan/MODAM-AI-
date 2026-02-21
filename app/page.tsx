"use client";

import { useAuth } from "@/lib/auth-context";
import OnboardingWithLogin from "@/components/OnboardingWithLogin";
import HomeDashboard from "@/components/HomeDashboard";

export default function Home() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" style={{ background: "var(--onboarding-bg)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <OnboardingWithLogin />;
  }

  return <HomeDashboard />;
}
