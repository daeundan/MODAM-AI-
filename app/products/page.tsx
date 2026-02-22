"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "shampoo", label: "샴푸" },
  { value: "tonic", label: "토닉" },
  { value: "supplement", label: "영양제" },
  { value: "other", label: "기타" },
];

const CATEGORY_STYLES: Record<string, string> = {
  shampoo: "bg-blue-50 text-blue-600 border-blue-100",
  tonic: "bg-emerald-50 text-emerald-600 border-emerald-100",
  supplement: "bg-purple-50 text-purple-600 border-purple-100",
  other: "bg-orange-50 text-orange-600 border-orange-100",
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = !category || p.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">제품 정보</h1>
        <p className="mx-auto max-w-2xl mt-4 text-[var(--muted)]">
          탈모 케어 제품을 검색하고 상세 정보를 확인하세요. 제휴 링크로 구매할 수 있습니다.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <input
          type="search"
          placeholder="제품명·성분 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((p) => {
          const categoryLabel = CATEGORY_OPTIONS.find((opt) => opt.value === p.category)?.label || p.category;
          const categoryStyle = CATEGORY_STYLES[p.category] || "bg-gray-50 text-gray-600 border-gray-100";

          return (
            <article
              key={p.id}
              className={`rounded-xl border bg-[var(--card)] p-4 sm:p-6 transition-all hover:shadow-md ${highlightId === p.id ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--border)]"
                }`}
            >
              <div className="flex gap-4 sm:gap-6">
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]/10 sm:w-32">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--muted)] text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-tight sm:text-[11px] ${categoryStyle}`}>
                        {categoryLabel}
                      </span>
                      <h2 className="mt-1 text-base font-bold text-[var(--foreground)] sm:text-lg">{p.name}</h2>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)] sm:text-sm">{p.description}</p>
                      <p className="mt-3 text-xs sm:text-sm">
                        <span className="text-[var(--muted)]">가격대:</span>
                        <span className="ml-1 font-semibold text-[var(--primary)]">{p.priceRange}</span>
                        <span className="mx-2 text-[var(--muted)]">·</span>
                        <span className="font-medium text-[var(--foreground)]">★ {p.rating}</span>
                        <span className="ml-1 text-[var(--muted)]">({p.reviewCount} 리뷰)</span>
                      </p>
                    </div>
                    <a
                      href={p.affiliateUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 hidden shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.95] sm:mt-0 sm:flex"
                    >
                      제휴몰에서 보기
                    </a>
                  </div>
                  {/* Mobile Button */}
                  <a
                    href={p.affiliateUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex w-full items-center justify-center rounded-lg bg-[var(--primary)] py-2 text-center text-sm font-medium text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98] sm:hidden"
                  >
                    제휴몰에서 보기
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-[var(--muted)]">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12 text-[var(--muted)]">로딩 중…</div>}>
      <ProductsContent />
    </Suspense>
  );
}
