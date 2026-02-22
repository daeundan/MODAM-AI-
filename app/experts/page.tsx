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
            className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--primary)]/30 hover:shadow-md sm:p-5"
          >
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Smaller Expert Image - Rounded Square */}
              <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/5 sm:w-28">
                {e.imageUrl ? (
                  <img
                    src={e.imageUrl}
                    alt={e.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--muted)] text-[10px]">
                    No Photo
                  </div>
                )}
              </div>

              {/* Expert Info */}
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-[var(--foreground)] sm:text-xl">{e.name}</h2>
                      <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                        {e.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{e.hospital}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--muted)] sm:text-sm">
                      {e.specialty}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="font-bold text-orange-500">★ {e.rating}</span>
                      {e.consultFee && (
                        <>
                          <span className="text-[var(--muted)]">·</span>
                          <span className="font-semibold text-[var(--primary)]">{e.consultFee}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden shrink-0 flex-col gap-2 sm:flex">
                    <a
                      href="#"
                      className="min-w-[120px] rounded-lg bg-[var(--primary)] px-4 py-2 text-center text-sm font-bold text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.95]"
                    >
                      상담 예약
                    </a>
                    <a
                      href="#"
                      className="min-w-[120px] rounded-lg border border-[var(--border)] px-4 py-2 text-center text-sm font-semibold hover:bg-[var(--background)] transition-colors active:scale-[0.95]"
                    >
                      정보 보기
                    </a>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="mt-4 flex gap-2 sm:hidden">
                  <a
                    href="#"
                    className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-center text-xs font-bold text-white active:scale-[0.98]"
                  >
                    상담 예약
                  </a>
                  <a
                    href="#"
                    className="flex-1 rounded-lg border border-[var(--border)] py-2 text-center text-xs font-semibold active:scale-[0.98]"
                  >
                    상세 정보
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
