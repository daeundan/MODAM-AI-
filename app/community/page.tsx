"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "question", label: "질문" },
  { value: "info", label: "정보 공유" },
  { value: "experience", label: "경험담" },
] as const;

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 글쓰기 입력 상태
  const [newPost, setNewPost] = useState({
    title: "",
    category: "question",
    content: "",
  });

  useEffect(() => {
    fetchPosts();

    // 페이지 포커스 시(뒤로가기 등) 데이터 갱신
    window.addEventListener("focus", fetchPosts);
    return () => window.removeEventListener("focus", fetchPosts);
  }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleWriteClick = () => {
    if (!user) {
      alert("글을 쓰려면 먼저 로그인해주세요! 🔒");
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      nickname: user.name,
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
    });

    if (error) {
      alert("글 등록에 실패했습니다. 다시 시도해주세요.");
      console.error(error);
    } else {
      alert("글이 성공적으로 등록되었습니다! 🎉");
      setIsModalOpen(false);
      setNewPost({ title: "", category: "question", content: "" });
      fetchPosts();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-20 pb-6 sm:pt-24 sm:pb-12">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">커뮤니티</h1>
        <p className="mx-auto max-w-2xl text-[var(--muted)]">
          익명으로 고민을 나누고 다른 분들의 경험담을 읽어보세요.
        </p>
      </div>

      <div className="mb-6 flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${category === c.value
              ? "bg-[var(--primary)] text-white shadow-md"
              : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)]/40"
              }`}
          >
            {c.label}
          </button>
        ))}
      </div>



      {loading ? (
        <div className="py-20 text-center text-[var(--muted)]">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center text-[var(--muted)]">
          등록된 게시글이 없습니다. 첫 번째 글을 작성해보세요!
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/community/${p.id}`}
                className="card-lift block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--primary)]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[var(--primary-pale)] px-2 py-1 text-[10px] font-bold text-[var(--primary)]">
                    {CATEGORIES.find((c) => c.value === p.category)?.label || "경험담"}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {new Date(p.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <h2 className="mt-2 font-bold text-[var(--foreground)]">{p.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                  {p.content}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                  <span className="font-medium text-[var(--primary)]">@{p.nickname}</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {p.view_count || 0}
                    </span>
                    <span>♥ {p.like_count || 0}</span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      {p.comment_count || 0}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex justify-end sm:mb-8">
        <button
          type="button"
          onClick={handleWriteClick}
          className="gradient-primary min-h-[44px] rounded-lg px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
        >
          글쓰기 (익명)
        </button>
      </div>
      {/* 글쓰기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-in fade-in zoom-in rounded-2xl bg-white p-6 shadow-2xl duration-200">
            <h2 className="mb-4 text-xl font-bold">새 글 작성</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">카테고리</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="question">질문</option>
                  <option value="info">정보 공유</option>
                  <option value="experience">경험담</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">제목</label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">내용</label>
                <textarea
                  rows={6}
                  placeholder="내용을 입력하세요"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-[var(--border)] py-3 font-medium transition-all hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="gradient-primary flex-1 rounded-lg py-3 font-bold text-white shadow-lg transition-all hover:opacity-90"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
