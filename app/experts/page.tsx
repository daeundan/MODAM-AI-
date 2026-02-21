import Link from "next/link";
import { MOCK_EXPERTS } from "@/lib/mock-data";

export default function ExpertsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
      <div className="mb-8 text-center">
        <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">전문가 상담</h1>
        <p className="mx-auto max-w-2xl text-[var(--muted)]">
          탈모 전문의·상담사와 연결해 신뢰할 수 있는 상담을 받아보세요. 온라인/오프라인 예약이 가능합니다.
        </p>
      </div>

      <div className="space-y-6">
        {MOCK_EXPERTS.map((e) => (
          <article
            key={e.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{e.name}</h2>
                <p className="text-sm font-medium text-[var(--primary)]">{e.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{e.hospital}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">전문: {e.specialty}</p>
                <p className="mt-2 text-sm">
                  ★ {e.rating}
                  {e.consultFee && ` · ${e.consultFee}`}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="#"
                  className="min-h-[44px] flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98]"
                >
                  상담 예약
                </a>
                <a
                  href="#"
                  className="min-h-[44px] flex items-center justify-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--background)] transition-colors active:scale-[0.98]"
                >
                  병원 정보
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
