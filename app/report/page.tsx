"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDiagnosisById, getDiagnoses } from "@/lib/diagnosis-store";
import { STAGE_LABELS, MANAGEMENT_GUIDES } from "@/lib/mock-data";
import type { DiagnosisResult } from "@/lib/types";
import Disclaimer from "@/components/Disclaimer";

function ReportContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [prevResult, setPrevResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    if (!id) return;
    const current = getDiagnosisById(id);
    setResult(current ?? null);
    if (current) {
      const all = getDiagnoses();
      const prev = all.find((d) => d.id !== id);
      setPrevResult(prev ?? null);
    }
  }, [id]);

  if (!id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-[var(--muted)]">진단 결과를 찾을 수 없습니다.</p>
        <Link href="/diagnose" className="mt-4 inline-block text-[var(--primary)]">
          AI 진단 다시 하기
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-[var(--muted)]">로딩 중…</p>
      </div>
    );
  }

  const stageKey = result.stage;
  const label = STAGE_LABELS[stageKey] ?? stageKey;
  const guide = MANAGEMENT_GUIDES.find((g) => g.stage === result.stage);
  const createdAt = new Date(result.createdAt);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">진단 리포트</h1>
      </div>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">
          진단 일시: {createdAt.toLocaleDateString("ko-KR")} {createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className={`mt-2 text-3xl font-bold stage-${stageKey}`} data-stage={stageKey}>
          결과: {label}
        </p>
        <p className="mt-2 text-[var(--muted)]">신뢰도: {(result.confidence * 100).toFixed(0)}%</p>
        <p className="mt-4 text-[var(--foreground)]">{result.summary}</p>
      </section>

      {prevResult && (
        <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">이전 결과와 비교</h2>
          <p className="text-sm text-[var(--muted)]">
            이전: {STAGE_LABELS[prevResult.stage]} ({new Date(prevResult.createdAt).toLocaleDateString("ko-KR")})
          </p>
          <p className="mt-1 text-sm">현재: {label}</p>
        </section>
      )}

      {guide && (
        <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">{guide.title}</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-[var(--foreground)]">
            {guide.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/recommendations"
          className="min-h-[44px] flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98]"
        >
          맞춤 추천 보기
        </Link>
        <Link
          href="/products"
          className="min-h-[44px] flex items-center justify-center rounded-lg border border-[var(--primary)] px-4 py-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors active:scale-[0.98]"
        >
          제품 둘러보기
        </Link>
        {result.stage === "risk" && (
          <Link
            href="/experts"
            className="min-h-[44px] flex items-center justify-center rounded-lg border border-amber-600 px-4 py-2 text-amber-700 hover:bg-amber-50 transition-colors active:scale-[0.98]"
          >
            전문가 상담 예약
          </Link>
        )}
      </div>

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-12 text-center text-[var(--muted)]">로딩 중…</div>}>
      <ReportContent />
    </Suspense>
  );
}
