"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getDiagnoses } from "@/lib/diagnosis-store";
import { STAGE_LABELS } from "@/lib/mock-data";

export default function MypagePage() {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState<{ id: string; stage: string; createdAt: string }[]>([]);

  useEffect(() => {
    const list = getDiagnoses();
    setDiagnoses(
      list.map((d) => ({
        id: d.id,
        stage: STAGE_LABELS[d.stage] ?? d.stage,
        createdAt: d.createdAt,
      }))
    );
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-[var(--muted)]">로그인하면 진단 기록과 맞춤 추천을 볼 수 있어요.</p>
        <Link href="/login" className="mt-4 inline-block text-[var(--primary)]">
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">마이페이지</h1>
      </div>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">프로필</h2>
        <p className="text-[var(--foreground)]">{user.name}</p>
        <p className="text-sm text-[var(--muted)]">{user.email}</p>
      </section>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">진단 기록</h2>
        {diagnoses.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">아직 진단 기록이 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {diagnoses.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span>{d.stage}</span>
                <span className="text-[var(--muted)]">
                  {new Date(d.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <Link href={`/report?id=${d.id}`} className="text-[var(--primary)] hover:underline">
                  보기
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/diagnose" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
          새 진단하기
        </Link>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">설정</h2>
        <p className="text-sm text-[var(--muted)]">알림, 개인정보 수정 등은 추후 제공될 예정입니다.</p>
      </section>
    </div>
  );
}
