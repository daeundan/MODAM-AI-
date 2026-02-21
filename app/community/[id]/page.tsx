"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CATEGORIES = [
    { value: "question", label: "질문" },
    { value: "info", label: "정보 공유" },
    { value: "experience", label: "경험담" },
] as const;

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        // 댓글 가져오기
        const { data: commentData, error: commentError } = await supabase
            .from("community_comments")
            .select("*")
            .eq("post_id", id)
            .order("created_at", { ascending: true });

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
                const { data: currentPost } = await supabase.from("community_posts").select("view_count").eq("id", id).single();
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
            const { data: currentPost } = await supabase.from("community_posts").select("like_count").eq("id", id).single();
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

        const { error: insertError } = await supabase.from("community_comments").insert({
            post_id: id,
            user_id: user.id,
            nickname: user.name,
            content: commentContent,
        });

        if (insertError) {
            alert("댓글 등록에 실패했습니다.");
            console.error(insertError);
        } else {
            setCommentContent("");

            // 댓글 수 실시간 업데이트
            const { count } = await supabase
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

    if (loading && !post) return <div className="py-20 text-center text-[var(--muted)]">로딩 중...</div>;
    if (!post) return null;

    return (
        <div className="mx-auto max-w-4xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[var(--primary-pale)] px-2 py-1 text-xs font-bold text-[var(--primary)]">
                            {CATEGORIES.find((c) => c.value === post.category)?.label || "경험담"}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                            {new Date(post.created_at).toLocaleDateString("ko-KR")}
                        </span>
                    </div>

                    <h1 className="mt-4 text-left text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                        {post.title}
                    </h1>

                    <div className="mt-4 flex w-full items-center justify-between border-b border-[var(--border)] pb-4 text-sm text-[var(--muted)]">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--foreground)]">@{post.nickname}</span>
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
                </div>

                <div className="mt-8 whitespace-pre-wrap leading-relaxed text-[var(--foreground)]">
                    {post.content}
                </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="mt-10">
                <h3 className="mb-4 text-lg font-bold">댓글 {comments.length}</h3>

                <ul className="space-y-4 mb-8">
                    {comments.length === 0 ? (
                        <li className="py-4 text-center text-sm text-[var(--muted)]">아직 댓글이 없습니다. 첫 의견을 남겨보세요!</li>
                    ) : (
                        comments.map((c) => (
                            <li key={c.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-bold text-[var(--primary)]">@{c.nickname}</span>
                                    <span className="text-[10px] text-[var(--muted)]">
                                        {new Date(c.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--muted)]">{c.content}</p>
                            </li>
                        ))
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
