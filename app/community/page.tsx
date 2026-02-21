"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_POSTS } from "@/lib/mock-data";

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "question", label: "질문" },
  { value: "info", label: "정보 공유" },
  { value: "experience", label: "경험담" },
] as const;

export default function CommunityPage() {
  const [category, setCategory] = useState("");

  const filtered = category
    ? MOCK_POSTS.filter((p) => p.category === category)
    : MOCK_POSTS;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">커뮤니티</h1>
      <p className="mb-6 text-[var(--muted)]">
        익명으로 고민을 나누고 다른 분들의 경험담을 읽어보세요.
      </p>

      <div className="mb-6 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-2 text-sm ${
              category === c.value
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)]/40"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex justify-end sm:mb-8">
        <button
          type="button"
          className="min-h-[44px] rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:bg-[var(--primary-light)] transition-colors active:scale-[0.98]"
        >
          글쓰기 (익명)
        </button>
      </div>

      <ul className="space-y-4">
        {filtered.map((p) => (
          <li key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <span className="text-xs text-[var(--muted)]">
              {p.category === "question" ? "질문" : p.category === "info" ? "정보 공유" : "경험담"}
            </span>
            <h2 className="mt-1 font-medium text-[var(--foreground)]">{p.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{p.content}</p>
            <p className="mt-3 flex gap-4 text-xs text-[var(--muted)]">
              <span>♥ {p.likeCount}</span>
              <span>댓글 {p.commentCount}</span>
              <span>{new Date(p.createdAt).toLocaleDateString("ko-KR")}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
