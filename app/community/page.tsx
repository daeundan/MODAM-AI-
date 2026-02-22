"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "notice", label: "공지사항" },
  { value: "question", label: "질문" },
  { value: "info", label: "정보 공유" },
  { value: "experience", label: "경험담" },
] as const;

export default function CommunityPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [category, setCategory] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = profile?.username === "modamadmin";

  // 글쓰기 입력 상태
  const [newPost, setNewPost] = useState({
    title: "",
    category: "question",
    content: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
    window.addEventListener("focus", fetchPosts);
    return () => window.removeEventListener("focus", fetchPosts);
  }, [category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview("");
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("community_posts")
      .select("*");

    // 카테고리 필터링이 있는 경우
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
    } else if (data) {
      // 정렬 로직: 공지사항(notice)을 최상단으로, 그 다음은 최신순
      const sortedPosts = [...data].sort((a, b) => {
        if (a.category === "notice" && b.category !== "notice") return -1;
        if (a.category !== "notice" && b.category === "notice") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setPosts(sortedPosts);
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
    if (!user || isSubmitting) return;

    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    let uploadedImageUrl = "";

    try {
      // 1. 이미지 업로드 처리
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("community")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          // 버킷이 없을 때의 친절한 안내
          if (uploadError.message.includes("Bucket not found")) {
            alert("Supabase Storage에 'community' 버킷이 없습니다. 대시보드에서 생성해 주세요.");
          }
        } else {
          const { data: { publicUrl } } = supabase.storage.from("community").getPublicUrl(fileName);
          uploadedImageUrl = publicUrl;
        }
      }

      // 2. 게시글 저장
      const nickname = isAdmin ? "모담 관리자" : (profile?.nickname || "익명");
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        nickname: nickname,
        category: newPost.category,
        title: newPost.title,
        content: newPost.content,
        image_url: uploadedImageUrl
      });

      if (error) {
        alert("글 등록에 실패했습니다.");
      } else {
        alert("글이 성공적으로 등록되었습니다! 🎉");
        setIsModalOpen(false);
        setNewPost({ title: "", category: "question", content: "" });
        setImageFile(null);
        setImagePreview("");
        fetchPosts();
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-20 pb-6 sm:pt-24 sm:pb-12">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">커뮤니티</h1>
        <p className="mx-auto max-w-2xl text-[var(--muted)]">
          {isAdmin ? "관리자 권한으로 공지사항을 상단에 고정하고 게시물을 관리할 수 있습니다." : "익명으로 고민을 나누고 다른 분들의 경험담을 읽어보세요."}
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
          {posts.map((p) => {
            const isPostAdmin = p.nickname === "모담 관리자";
            const isNotice = p.category === "notice";
            return (
              <li key={p.id}>
                <Link
                  href={`/community/${p.id}`}
                  className={`card-lift relative block rounded-xl border p-5 transition-all ${isNotice
                    ? "border-orange-300 bg-orange-50/40 shadow-sm"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40"}`}
                >
                  {isNotice && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-tr-xl rounded-bl-xl shadow-sm">
                      PINNED
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${isNotice
                      ? "bg-orange-600 text-white"
                      : "bg-[var(--primary-pale)] text-[var(--primary)]"}`}>
                      {CATEGORIES.find((c) => c.value === p.category)?.label || "경험담"}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {new Date(p.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 mt-2">
                    <div className="flex-1">
                      <h2 className={`font-bold ${isNotice ? "text-orange-900" : "text-[var(--foreground)]"}`}>
                        {p.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                        {p.content}
                      </p>
                    </div>
                    {p.image_url && (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <img src={p.image_url} alt="Post image" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                    <span className={`font-bold ${isPostAdmin ? "text-orange-600" : "text-[var(--primary)]"}`}>
                      {isPostAdmin ? "" : "@"}{p.nickname}
                    </span>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {p.view_count || 0}
                      </span>
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3c1.74 0 3.285.792 4.312 2.046C13.03 3.792 14.575 3 16.312 3c2.974 0 5.438 2.322 5.438 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        {p.like_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {p.comment_count || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-6 flex justify-end sm:mb-8">
        <button
          type="button"
          onClick={handleWriteClick}
          className="gradient-primary min-h-[44px] rounded-lg px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
        >
          {isAdmin ? "공지 및 글쓰기" : "글쓰기 (익명)"}
        </button>
      </div>

      {/* 글쓰기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-in fade-in zoom-in rounded-2xl bg-white p-6 shadow-2xl duration-200">
            <h2 className="mb-4 text-xl font-bold">{isAdmin ? "새 게시물 작성 (관리자)" : "새 글 작성"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">카테고리</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--primary)] focus:outline-none"
                >
                  {isAdmin && <option value="notice">공지사항</option>}
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

              {/* 이미지 업로드 추가 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">이미지 첨부 (선택)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--primary-pale)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--primary)] hover:file:bg-[var(--primary)] hover:file:text-white"
                />

                {/* 이미지 미리보기 추가 */}
                {imagePreview && (
                  <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden border border-[var(--border)]">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-gray-50" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(""); }}
                      className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setImageFile(null);
                  }}
                  className="flex-1 rounded-lg border border-[var(--border)] py-3 font-medium transition-all hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gradient-primary flex-1 rounded-lg py-3 font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "등록 중..." : "등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
