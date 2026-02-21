"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function OnboardingWithLogin() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 이메일이 없으면 기본값 사용
    const userEmail = email.trim() || `user_${Date.now()}@modam.app`;
    const userName = name.trim() || "사용자";
    login(userEmail, userName);
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8 md:py-12"
      style={{ background: "var(--onboarding-bg)" }}
    >
      {/* 모바일: 전체 화면 레이아웃 */}
      <div className="flex w-full min-h-screen flex-col md:hidden">
        {/* 로고 중앙 영역 */}
        <section className="flex flex-1 flex-col items-center justify-center px-4 pt-16 pb-8">
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/modam-icon.png"
              alt="모담"
              width={140}
              height={140}
              className="h-28 w-28 object-contain"
              priority
            />
            <span
              className="gradient-text-primary mt-3 bg-clip-text text-2xl font-bold tracking-tight text-transparent"
              style={{ fontFamily: "Pretendard, sans-serif" }}
            >
              MODAM
            </span>
            <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--primary-dark)]">
              AI 기반 탈모 자가진단 및 맞춤 관리
            </p>
          </div>
        </section>

        {/* 로그인 폼 */}
        <section className="px-5 pb-10 pt-6">
          <h2 className="mb-5 text-lg font-bold text-[var(--foreground)]">
            로그인
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-[var(--foreground)]">
              이메일
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)]"
                placeholder="you@example.com (선택)"
              />
            </label>
            <label className="text-sm font-semibold text-[var(--foreground)]">
              이름 (선택)
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)]"
                placeholder="홍길동"
              />
            </label>
            <button
              type="submit"
              className="min-h-[48px] rounded-xl bg-[var(--primary)] py-3 text-base font-semibold text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98]"
            >
              로그인
            </button>
          </form>
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-[var(--muted)]">
              <Link href="/find-account" className="font-medium text-[var(--primary)] underline hover:no-underline">
                아이디/비밀번호 찾기
              </Link>
            </p>
            <p className="text-sm text-[var(--muted)]">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="font-semibold text-[var(--primary)] underline hover:no-underline">
                회원가입
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* 데스크톱: 중앙 카드 레이아웃 */}
      <div className="hidden w-full max-w-md md:block">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-lg">
          {/* 로고 */}
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/modam-icon.png"
              alt="모담"
              width={120}
              height={120}
              className="h-24 w-24 object-contain"
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
          </div>

          {/* 로그인 폼 */}
          <h2 className="mb-6 text-xl font-bold text-[var(--foreground)]">
            로그인
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="text-sm font-semibold text-[var(--foreground)]">
              이메일
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)]"
                placeholder="you@example.com (선택)"
              />
            </label>
            <label className="text-sm font-semibold text-[var(--foreground)]">
              이름 (선택)
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)]"
                placeholder="홍길동"
              />
            </label>
            <button
              type="submit"
              className="min-h-[48px] rounded-xl bg-[var(--primary)] py-3 text-base font-semibold text-white hover:bg-[var(--primary-light)] transition-colors"
            >
              로그인
            </button>
          </form>
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-[var(--muted)]">
              <Link href="/find-account" className="font-medium text-[var(--primary)] underline hover:no-underline">
                아이디/비밀번호 찾기
              </Link>
            </p>
            <p className="text-sm text-[var(--muted)]">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="font-semibold text-[var(--primary)] underline hover:no-underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
