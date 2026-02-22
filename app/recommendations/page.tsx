"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDiagnoses } from "@/lib/diagnosis-store";
import { MANAGEMENT_GUIDES, MOCK_PRODUCTS, STAGE_LABELS } from "@/lib/mock-data";
import type { DiagnosisStage } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  shampoo: "샴푸",
  tonic: "토닉",
  supplement: "영양제",
  other: "기타",
};

export default function RecommendationsPage() {
  const [stage, setStage] = useState<DiagnosisStage | null>(null);

  useEffect(() => {
    const list = getDiagnoses();
    setStage(list[0]?.stage ?? "caution");
  }, []);

  const guide = stage ? MANAGEMENT_GUIDES.find((g) => g.stage === stage) : null;
  const products = MOCK_PRODUCTS.slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">맞춤 추천</h1>
        <p className="mx-auto max-w-2xl mt-4 text-[var(--muted)]">
          {stage ? (
            <>최근 진단 결과 기준: <strong className="text-[var(--foreground)]">{STAGE_LABELS[stage]}</strong></>
          ) : (
            "AI 진단을 먼저 진행하면 나에게 맞는 추천을 받을 수 있어요."
          )}
        </p>
      </div>

      {!stage && (
        <Link
          href="/diagnose"
          className="mb-8 inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-light)]"
        >
          AI 진단하기
        </Link>
      )}

      {guide && (
        <section className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">{guide.title}</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-[var(--foreground)]">
            {guide.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">추천 제품</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products?highlight=${p.id}`}
              className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/30 transition-all active:scale-[0.98]"
            >
              <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]/10">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--muted)] text-[10px]">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[var(--muted)]">{CATEGORY_LABELS[p.category]}</span>
                <h3 className="font-medium text-[var(--foreground)] truncate">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{p.description}</p>
                <p className="mt-2 text-xs">
                  <span className="text-[var(--primary)]">{p.priceRange}</span>
                  <span className="ml-2 text-[var(--muted)]">★ {p.rating}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/products" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
          제품 더 보기 →
        </Link>
      </section>
    </div>
  );
}
