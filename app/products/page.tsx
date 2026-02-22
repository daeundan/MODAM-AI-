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
        {filtered.map((p) => (
          <article
            key={p.id}
            className={`rounded-xl border bg-[var(--card)] p-6 ${highlightId === p.id ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--border)]"
              }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="text-xs text-[var(--muted)]">{p.category}</span>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{p.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{p.description}</p>
                <p className="mt-2 text-sm">
                  가격대: <span className="text-[var(--primary)]">{p.priceRange}</span>
                  {" · "}
                  ★ {p.rating} (리뷰 {p.reviewCount}개)
                </p>
              </div>
              <a
                href={p.affiliateUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 shrink-0 min-h-[44px] flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-center text-sm text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98] sm:mt-0"
              >
                제휴몰에서 보기
              </a>
            </div>
          </article>
        ))}
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
