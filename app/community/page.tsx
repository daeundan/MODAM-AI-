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
  const [sortBy, setSortBy] = useState("latest"); // latest, views, likes, comments

  const isAdmin = profile?.username === "modamadmin";

  // 글쓰기 입력 상태
  const [newPost, setNewPost] = useState({
    title: "",
    category: "question",
    content: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageSize, setImageSize] = useState("medium"); // small, medium, large
  const [imageAlign, setImageAlign] = useState("center"); // left, center, right
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 편집기 내부 블록 관리 (시각적 드래그앤드롭용)
  const [blocks, setBlocks] = useState<any[]>([
    { id: 't1', type: 'text', value: '' }
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    window.addEventListener("focus", fetchPosts);
    return () => window.removeEventListener("focus", fetchPosts);
  }, [category, sortBy]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);

        // 이미지가 이미 있으면 교체, 없으면 중간에 추가
        const hasImage = blocks.find(b => b.type === 'image');
        if (hasImage) {
          setBlocks(blocks.map(b => b.type === 'image' ? { ...b, value: preview } : b));
        } else {
          // 텍스트 블록 중간에 삽입 (이미지 블록 추가)
          const newBlocks = [...blocks];
          // 첫 번째 텍스트 블록 다음에 삽입
          newBlocks.splice(1, 0, { id: 'img-' + Date.now(), type: 'image', value: preview });
          setBlocks(newBlocks);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview("");
      // 이미지 블록 제거
      setBlocks(blocks.filter(b => b.type !== 'image'));
    }
  };

  // 블록 순서 변경
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    if (blocks.length <= 1) return;
    const blockToDelete = blocks[index];

    // 이미지 블록 삭제 시 파일 상태도 초기화
    if (blockToDelete.type === 'image') {
      setImageFile(null);
      setImagePreview("");
    }

    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('index'));
    if (dragIndex === dropIndex) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(dropIndex, 0, movedBlock);
    setBlocks(newBlocks);
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
      // 정렬 로직 적용
      let sortedPosts = [...data];

      // 1. 공지사항(notice)을 항상 최상단에 (필터링되지 않은 경우에만 또는 공지사항 필터일 때)
      // 여기서는 전체 보기 혹은 공지사항 필터일 때 상단 고정
      sortedPosts.sort((a, b) => {
        if (a.category === "notice" && b.category !== "notice") return -1;
        if (a.category !== "notice" && b.category === "notice") return 1;

        // 정렬 기준 적용
        if (sortBy === "views") return (b.view_count || 0) - (a.view_count || 0);
        if (sortBy === "likes") return (b.like_count || 0) - (a.like_count || 0);
        if (sortBy === "comments") return (b.comment_count || 0) - (a.comment_count || 0);
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

    // 블록들을 하나의 텍스트로 합침 (이미지는 [IMAGE] 태그로 변환)
    const combinedContent = blocks.map(b => b.type === 'image' ? '[IMAGE]' : b.value).join('\n');

    if (!newPost.title.trim() || !combinedContent.trim()) {
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
        content: combinedContent,
        image_url: uploadedImageUrl,
        image_size: imageSize,
        image_align: imageAlign
      });

      if (error) {
        alert("글 등록에 실패했습니다.");
      } else {
        alert("글이 성공적으로 등록되었습니다! 🎉");
        setIsModalOpen(false);
        setNewPost({ title: "", category: "question", content: "" });
        setImageFile(null);
        setImagePreview("");
        setBlocks([{ id: 't1', type: 'text', value: '' }]);
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

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* 카테고리 드롭다운 */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] pl-4 pr-10 py-2.5 text-sm font-bold text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none transition-all cursor-pointer hover:bg-gray-50/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* 정렬 드롭다운 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] pl-4 pr-10 py-2.5 text-sm font-bold text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none transition-all cursor-pointer hover:bg-gray-50/50"
            >
              <option value="latest">최신순</option>
              <option value="views">조회수순</option>
              <option value="likes">좋아요순</option>
              <option value="comments">댓글순</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWriteClick}
          className="gradient-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          글쓰기
        </button>
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
                        {p.content === "[IMAGE]" ? "(사진 게시물)" : p.content.replace("[IMAGE]", "")}
                      </p>
                    </div>
                    {p.image_url && (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-inner bg-gray-50">
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
                      <span className="flex items-center gap-1 text-[var(--primary)] font-medium bg-[var(--primary-pale)] px-2 py-0.5 rounded-md">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 스마트 블록 글쓰기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl animate-in fade-in zoom-in rounded-2xl bg-white p-6 shadow-2xl duration-200 my-8">
            <h2 className="mb-4 text-xl font-bold">{isAdmin ? "새 게시물 작성 (관리자)" : "새 글 작성"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
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
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-[var(--muted)]">사진 첨부</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--primary-pale)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--primary)] hover:file:bg-[var(--primary)] hover:file:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">제목</label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-lg font-bold focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              {/* 시각적 블록 편집기 영역 */}
              <div className="rounded-xl border border-[var(--border)] bg-gray-50/30 p-4 min-h-[400px]">
                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Editor Preview & Edit</label>

                {blocks.map((block, idx) => {
                  if (block.type === 'image') {
                    const sizeClasses: any = { small: 'w-1/3', medium: 'w-2/3', large: 'w-full' };
                    // 에러 수정을 위해 float 클래스 적용
                    const alignClasses: any = {
                      left: 'float-left mr-4 mb-4',
                      center: 'mx-auto block mb-4 clear-both',
                      right: 'float-right ml-4 mb-4'
                    };

                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`relative group ${imageAlign === 'center' ? 'clear-both' : 'z-10'} my-2`}
                      >
                        {/* 위치 이동 및 삭제 버튼 */}
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button type="button" onClick={() => moveBlock(idx, 'up')} className="p-1 bg-white border rounded shadow-sm hover:bg-gray-50 flex items-center justify-center text-[10px]">▲</button>
                          <button type="button" onClick={() => moveBlock(idx, 'down')} className="p-1 bg-white border rounded shadow-sm hover:bg-gray-50 flex items-center justify-center text-[10px]">▼</button>
                          <div className="cursor-grab p-1 bg-gray-100 border rounded shadow-sm text-[8px] flex items-center justify-center">☰</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteBlock(idx)}
                          className="absolute -top-1 -right-1 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 active:scale-95"
                        >
                          <span className="text-xs font-bold">×</span>
                        </button>

                        <div
                          className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${activeBlockId === block.id ? 'border-[var(--primary)] ring-4 ring-[var(--primary-pale)]' : 'border-transparent hover:border-gray-300'} ${sizeClasses[imageSize]} ${alignClasses[imageAlign]}`}
                          onClick={() => setActiveBlockId(activeBlockId === block.id ? null : block.id)}
                        >
                          <img src={block.value} alt="Preview" className="w-full h-auto" />

                          {/* 이미지 설정 오버레이 */}
                          {activeBlockId === block.id && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in zoom-in duration-200 z-20">
                              <div className="bg-white rounded-xl p-3 shadow-xl space-y-3" onClick={e => e.stopPropagation()}>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 text-center uppercase">Size</p>
                                  <div className="flex gap-1 justify-center">
                                    {['small', 'medium', 'large'].map(s => (
                                      <button key={s} type="button" onClick={() => setImageSize(s)} className={`px-3 py-1 text-[10px] rounded-md border transition-all ${imageSize === s ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--primary)]'}`}>
                                        {s === 'small' ? '작게' : s === 'medium' ? '중간' : '크게'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-400 text-center uppercase">Align</p>
                                  <div className="flex gap-1 justify-center">
                                    {['left', 'center', 'right'].map(a => (
                                      <button key={a} type="button" onClick={() => setImageAlign(a)} className={`px-3 py-1 text-[10px] rounded-md border transition-all ${imageAlign === a ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--primary)]'}`}>
                                        {a === 'left' ? '왼쪽' : a === 'center' ? '가운데' : '오른쪽'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <button type="button" onClick={() => setActiveBlockId(null)} className="w-full py-2 text-xs font-bold bg-[var(--primary)] text-white rounded-lg hover:opacity-90 shadow-md">설정 완료</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                })}

                {/* 하단 텍스트 블록 자동 추가 (항상 마지막은 텍스트여야 함) */}
                {blocks[blocks.length - 1]?.type === 'image' && (
                  <button
                    type="button"
                    onClick={() => setBlocks([...blocks, { id: Date.now().toString(), type: 'text', value: '' }])}
                    className="w-full py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    + 여기에 텍스트 추가
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
        </div >
      )
      }
    </div >
  );
}
