"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CATEGORIES = [
    { value: "notice", label: "공지사항" },
    { value: "question", label: "질문" },
    { value: "info", label: "정보 공유" },
    { value: "experience", label: "경험담" },
] as const;

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, profile } = useAuth();

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 수정 모드 상태
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: "", content: "", category: "question" });
    const [editImageFile, setEditImageFile] = useState<File | null>(null);

    const isAdmin = profile?.username === "modamadmin";

    useEffect(() => {
        if (id) {
            // 1. 조회수 먼저 증가
            incrementViewCount().then(() => {
                // 2. 그 다음 데이터 로드 (증가된 조회수를 가져오기 위해)
                fetchPostAndComments();
            });
        }
    }, [id]);

    const fetchPostAndComments = async () => {
        // 포스트 가져오기
        const { data: postData, error: postError } = await supabase
            .from("community_posts")
            .select("*")
            .eq("id", id)
            .single();

        if (postError) {
            console.error("포스트를 불러오는 중 에러 발생:", postError.message);
            alert("존재하지 않는 게시글이거나 삭제된 게시글입니다.");
            router.push("/community");
            return;
        }
        setPost(postData);
        setEditForm({ title: postData.title, content: postData.content, category: postData.category });

        // 댓글 가져오기
        const { data: commentData, error: commentError } = await (supabase
            .from("community_comments")
            .select("*")
            .eq("post_id", id)
            .order("created_at", { ascending: true }) as any);

        if (commentError) {
            console.error("댓글을 불러오는 중 에러 발생:", commentError.message);
        } else {
            setComments(commentData || []);
        }
        setLoading(false);
    };

    const incrementViewCount = async () => {
        if (!id) return;
        try {
            // RPC 시도
            const { error: rpcError } = await supabase.rpc("increment_view_count", { post_id: id });

            if (rpcError) {
                // RPC 실패 시 수동 업데이트
                const { data: currentPost }: any = await supabase.from("community_posts").select("view_count").eq("id", id).single();
                if (currentPost) {
                    await supabase.from("community_posts").update({ view_count: (currentPost.view_count || 0) + 1 }).eq("id", id);
                }
            }
        } catch (e) {
            console.error("조회수 증가 에러:", e);
        }
    };

    const handleLike = async () => {
        if (!id || !post) return;

        // UI 즉시 반영 (낙관적 업데이트)
        setPost({ ...post, like_count: (post.like_count || 0) + 1 });

        try {
            const { data: currentPost }: any = await supabase.from("community_posts").select("like_count").eq("id", id).single();
            const { error } = await supabase
                .from("community_posts")
                .update({ like_count: (currentPost?.like_count || 0) + 1 })
                .eq("id", id);

            if (error) throw error;
        } catch (e) {
            console.error("좋아요 에러:", e);
            // 에러 시 복구는 생략
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("댓글을 쓰려면 로그인해주세요! 🔒");
            return;
        }
        if (!commentContent.trim()) return;

        setIsSubmitting(true);

        const nickname = isAdmin ? "모담 관리자" : (profile?.nickname || "익명");

        const { error: insertError } = await supabase.from("community_comments").insert({
            post_id: id,
            user_id: user.id,
            nickname: nickname,
            content: commentContent,
        });

        if (insertError) {
            alert("댓글 등록에 실패했습니다.");
            console.error(insertError);
        } else {
            setCommentContent("");

            // 댓글 수 실시간 업데이트
            const { count }: any = await supabase
                .from("community_comments")
                .select("*", { count: "exact", head: true })
                .eq("post_id", id);

            if (count !== null) {
                await supabase.from("community_posts").update({ comment_count: count }).eq("id", id);
            }

            fetchPostAndComments();
        }
        setIsSubmitting(false);
    };

    const handleDeletePost = async () => {
        if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

        const { error } = await supabase.from("community_posts").delete().eq("id", id);
        if (error) {
            console.error("Delete post error:", error);
            alert("삭제에 실패했습니다: " + error.message);
        } else {
            alert("게시글이 삭제되었습니다.");
            router.push("/community");
        }
    };

    const handleUpdatePost = async () => {
        if (!editForm.title.trim() || !editForm.content.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImageUrl = post.image_url;

            // 새로운 이미지가 선택된 경우 업로드
            if (editImageFile) {
                const fileExt = editImageFile.name.split(".").pop();
                const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("community")
                    .upload(fileName, editImageFile);

                if (uploadError) {
                    console.error("Image update upload error:", uploadError);
                } else {
                    const { data: { publicUrl } } = supabase.storage.from("community").getPublicUrl(fileName);
                    finalImageUrl = publicUrl;
                }
            }

            const { error } = await supabase.from("community_posts").update({
                title: editForm.title,
                content: editForm.content,
                category: editForm.category,
                image_url: finalImageUrl
            }).eq("id", id);

            if (error) {
                console.error("Update error:", error);
                alert("수정에 실패했습니다: " + error.message);
            } else {
                alert("성공적으로 수정되었습니다! 🎉");
                setIsEditing(false);
                setEditImageFile(null);
                await fetchPostAndComments();
            }
        } catch (err) {
            console.error("Update catch error:", err);
            alert("수정 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("이 댓글을 삭제하시겠습니까?")) return;

        const { error } = await supabase.from("community_comments").delete().eq("id", commentId);
        if (error) {
            console.error("Delete comment error:", error);
            alert("댓글 삭제 실패: " + error.message);
        } else {
            fetchPostAndComments();
        }
    };

    if (loading && !post) return <div className="py-20 text-center text-[var(--muted)]">로딩 중...</div>;
    if (!post) return null;

    const isPostAdmin = post.nickname === "모담 관리자";

    return (
        <div className="mx-auto max-w-4xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
            <div className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${isPostAdmin ? "border-orange-200 bg-orange-50/20" : "border-[var(--border)] bg-[var(--card)]"}`}>
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400">제목</label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 p-2 text-xl font-bold focus:outline-[var(--primary)]"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400">카테고리</label>
                            <select
                                value={editForm.category}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 p-2"
                            >
                                <option value="notice">공지사항</option>
                                <option value="question">질문</option>
                                <option value="info">정보 공유</option>
                                <option value="experience">경험담</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400">내용</label>
                            <textarea
                                rows={10}
                                value={editForm.content}
                                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 p-2 focus:outline-[var(--primary)]"
                            />
                        </div>

                        {/* 수정 모드 이미지 업로드 추가 */}
                        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-gray-300 p-4">
                            <label className="text-sm font-bold">이미지 변경</label>
                            {post.image_url && !editImageFile && (
                                <p className="text-xs text-blue-500">현재 이미지가 등록되어 있습니다.</p>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                                className="text-xs"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button onClick={() => { setIsEditing(false); setEditImageFile(null); }} className="rounded-lg bg-gray-200 px-6 py-2 font-bold transition-all hover:bg-gray-300">취소</button>
                            <button onClick={handleUpdatePost} disabled={isSubmitting} className="gradient-primary rounded-lg px-6 py-2 font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50">
                                {isSubmitting ? "수정 중..." : "수정완료"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-start">
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`rounded-md px-2 py-1 text-xs font-bold ${isPostAdmin ? "bg-orange-500 text-white" : "bg-[var(--primary-pale)] text-[var(--primary)]"}`}>
                                    {CATEGORIES.find((c) => c.value === post.category)?.label || "경험담"}
                                </span>
                                <span className="text-xs text-[var(--muted)]">
                                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                                </span>
                            </div>

                            {isAdmin && (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 hover:underline">수정</button>
                                    <button onClick={handleDeletePost} className="text-xs text-red-500 hover:underline">삭제</button>
                                </div>
                            )}
                        </div>

                        <h1 className="mt-4 text-left text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                            {post.title}
                        </h1>

                        <div className="mt-4 flex w-full items-center justify-between border-b border-[var(--border)] pb-4 text-sm text-[var(--muted)]">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${isPostAdmin ? "text-orange-600" : "text-[var(--foreground)]"}`}>
                                    {isPostAdmin ? "" : "@"}{post.nickname}
                                </span>
                                <span className="text-[var(--border)]">|</span>
                                <span>조회수 {post.view_count || 0}</span>
                            </div>
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-red-500 transition-all hover:bg-red-100 active:scale-90"
                            >
                                <span className="text-lg">♥</span>
                                <span className="font-bold">{post.like_count || 0}</span>
                            </button>
                        </div>

                        {/* 첨부 이미지 표시 */}
                        {post.image_url && (
                            <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-gray-50 shadow-sm">
                                <img
                                    src={post.image_url}
                                    alt="게시글 첨부 이미지"
                                    className="h-auto w-full object-contain max-h-[600px] mx-auto"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        )}

                        <div className="mt-8 w-full whitespace-pre-wrap leading-relaxed text-[var(--foreground)] text-base sm:text-lg">
                            {post.content}
                        </div>
                    </div>
                )}
            </div>

            {/* 댓글 섹션 */}
            <div className="mt-10">
                <h3 className="mb-4 text-lg font-bold">댓글 {comments.length}</h3>

                <ul className="space-y-4 mb-8">
                    {comments.length === 0 ? (
                        <li className="py-4 text-center text-sm text-[var(--muted)]">아직 댓글이 없습니다. 첫 의견을 남겨보세요!</li>
                    ) : (
                        comments.map((c) => {
                            const isCommentAdmin = c.nickname === "모담 관리자";
                            return (
                                <li key={c.id} className={`rounded-xl border p-4 ${isCommentAdmin ? "border-orange-200 bg-orange-50/20" : "border-[var(--border)] bg-white"}`}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${isCommentAdmin ? "text-orange-600" : "text-[var(--primary)]"}`}>
                                                {isCommentAdmin ? "" : "@"}{c.nickname}
                                            </span>
                                            {isCommentAdmin && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[8px] font-bold text-orange-600">ADMIN</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-[var(--muted)]">
                                                {new Date(c.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
                                            </span>
                                            {isAdmin && (
                                                <button onClick={() => handleDeleteComment(c.id)} className="text-[10px] text-red-400 hover:text-red-600">삭제</button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-[var(--muted)]">{c.content}</p>
                                </li>
                            );
                        })
                    )}
                </ul>

                {/* 댓글 입력창 */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                            disabled={!user || isSubmitting}
                            rows={3}
                            className="w-full resize-none bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={!user || isSubmitting || !commentContent.trim()}
                                className="gradient-primary rounded-lg px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                {isSubmitting ? "등록 중..." : "댓글 등록"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
