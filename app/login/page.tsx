"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email.trim(), name.trim());
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <h1 className="mb-8 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
        로그인
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="text-sm font-semibold text-[var(--foreground)]">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)]"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          이름 (선택)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)]"
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
    </div>
  );
}
