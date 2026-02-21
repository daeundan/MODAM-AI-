"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function OnboardingWithLogin({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const isLogin = mode === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = email.trim() || `user_${Date.now()}@modam.app`;
    const userName = name.trim() || (isLogin ? "사용자" : "새로운 사용자");
    login(userEmail, userName);
    router.push("/");
    router.refresh();
  };

  const BrandingSection = () => (
    <section className="mb-8 flex flex-col items-center">
      <Image
        src="/assets/img/opacity-logo.png"
        alt="모담"
        width={160}
        height={60}
        className="h-14 w-auto object-contain mb-2"
        priority
      />
      <span
        className="gradient-text-primary mt-3 bg-clip-text text-2xl font-bold tracking-tight text-transparent"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        MODAM
      </span>
      <p className="mt-2 text-center text-xs font-medium uppercase tracking-wider text-[var(--primary-dark)]">
        AI 기반 탈모 자가진단 및 맞춤 관리
      </p>
    </section>
  );

  const FormSection = ({ isMobile }: { isMobile: boolean }) => (
    <section className={isMobile ? "px-2" : ""}>
      <h2 className="mb-5 text-center text-xl font-extrabold text-[var(--foreground)] md:text-2xl">
        {isLogin ? "로그인" : "회원가입"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-[var(--foreground)]">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--foreground)] bg-[var(--background)]`}
            placeholder="you@example.com (선택)"
          />
        </label>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          {isLogin ? "이름 (선택)" : "이름"}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--foreground)] bg-[var(--background)]`}
            placeholder="홍길동"
          />
        </label>
        <div className="relative mt-8">
          {/* 말풍선 안내 (데모 유도) */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-gentle-bounce cursor-pointer whitespace-nowrap rounded-full bg-[#333333] px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95">
            회원가입 없이 바로 체험하세요! 👆🏻
            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#333333]" />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-xl bg-[var(--primary)] py-3 text-base font-semibold text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98]"
          >
            {isLogin ? "로그인" : "시작하기"}
          </button>
        </div>
      </form>
      <div className="mt-6 space-y-3 text-center">
        {isLogin && (
          <p className="text-sm text-[var(--muted)]">
            <Link href="/find-account" className="font-medium text-[var(--primary)] underline hover:no-underline">
              아이디/비밀번호 찾기
            </Link>
          </p>
        )}
        <p className="text-sm text-[var(--muted)]">
          {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
          <button
            onClick={() => setMode(isLogin ? "signup" : "login")}
            className="font-semibold text-[var(--primary)] underline hover:no-underline"
          >
            {isLogin ? "회원가입" : "로그인"}
          </button>
        </p>
      </div>
    </section>
  );

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8 md:py-12"
      style={{ background: "var(--onboarding-bg)" }}
    >
      <div className="w-full max-w-md">
        <BrandingSection />
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-lg">
          <FormSection isMobile={true} />
        </div>
      </div>
    </div>
  );
}
