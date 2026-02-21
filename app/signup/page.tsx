"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email.trim(), name.trim() || email.split("@")[0]);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:py-12">
      <h1 className="mb-8 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">회원가입</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium text-[var(--muted)]">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="text-sm font-medium text-[var(--muted)]">
          이름
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"
            placeholder="홍길동"
          />
        </label>
        <button
          type="submit"
          className="min-h-[44px] rounded-lg bg-[var(--primary)] py-2.5 text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98]"
        >
          가입하기
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-[var(--primary)] underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
