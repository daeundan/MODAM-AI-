"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import OnboardingWithLogin from "@/components/OnboardingWithLogin";
import HomeDashboard from "@/components/HomeDashboard";

export default function Home() {
  const { user, isReady, isGuest } = useAuth();

  useEffect(() => {
    console.log("Home State:", { isReady, user: user?.id, isGuest });
  }, [isReady, user, isGuest]);

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" style={{ background: "var(--onboarding-bg)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <OnboardingWithLogin />;
  }

  return <HomeDashboard />;
}
