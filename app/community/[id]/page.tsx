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
    const [editImagePreview, setEditImagePreview] = useState<string>("");
    const [editImageSize, setEditImageSize] = useState("medium");
    const [editImageAlign, setEditImageAlign] = useState("center");
    const [editBlocks, setEditBlocks] = useState<any[]>([]);
    const [activeEditImageId, setActiveEditImageId] = useState<string | null>(null);

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
        setEditImageSize(postData.image_size || "medium");
        setEditImageAlign(postData.image_align || "center");

        // 블록 데이터 초기화
        if (postData.content.includes("[IMAGE]")) {
            const parts = postData.content.split("[IMAGE]");
            setEditBlocks([
                { id: 't1', type: 'text', value: parts[0] || "" },
                { id: 'img', type: 'image', value: postData.image_url },
                { id: 't2', type: 'text', value: parts[1] || "" }
            ]);
        } else {
            setEditBlocks([{ id: 't1', type: 'text', value: postData.content }]);
            if (postData.image_url) {
                // 이미지는 있지만 태그는 없는 경우 (최상단 배치로 초기화)
                setEditBlocks([
                    { id: 'img', type: 'image', value: postData.image_url },
                    { id: 't1', type: 'text', value: postData.content }
                ]);
            }
        }

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

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const preview = reader.result as string;
                setEditImagePreview(preview);

                // 이미지가 이미 있으면 교체, 없으면 중간에 추가
                const hasImage = editBlocks.find(b => b.type === 'image');
                if (hasImage) {
                    setEditBlocks(editBlocks.map(b => b.type === 'image' ? { ...b, value: preview } : b));
                } else {
                    const newBlocks = [...editBlocks];
                    newBlocks.splice(1, 0, { id: 'img-' + Date.now(), type: 'image', value: preview });
                    setEditBlocks(newBlocks);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const moveEditImage = (direction: 'up' | 'down') => {
        const imgIndex = editBlocks.findIndex(b => b.type === 'image');
        if (imgIndex === -1) return;

        const newBlocks = [...editBlocks];
        if (direction === 'up' && imgIndex > 0) {
            const temp = newBlocks[imgIndex];
            newBlocks[imgIndex] = newBlocks[imgIndex - 1];
            newBlocks[imgIndex - 1] = temp;
        } else if (direction === 'down' && imgIndex < editBlocks.length - 1) {
            const temp = newBlocks[imgIndex];
            newBlocks[imgIndex] = newBlocks[imgIndex + 1];
            newBlocks[imgIndex + 1] = temp;
        }
        setEditBlocks(newBlocks);
    };

    const handleEditDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('index', index.toString());
    };

    const handleEditDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleEditDrop = (e: React.DragEvent, dropIndex: number) => {
        const dragIndex = parseInt(e.dataTransfer.getData('index'));
        if (dragIndex === dropIndex) return;

        const newBlocks = [...editBlocks];
        const [movedBlock] = newBlocks.splice(dragIndex, 1);
        newBlocks.splice(dropIndex, 0, movedBlock);
        setEditBlocks(newBlocks);
    };

    const handleUpdatePost = async () => {
        if (!editForm.title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        const combinedContent = editBlocks.map(b => b.type === 'image' ? '[IMAGE]' : b.value).join('\n');
        if (!combinedContent.trim()) {
            alert("내용을 입력해주세요.");
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
                content: combinedContent,
                category: editForm.category,
                image_url: finalImageUrl,
                image_size: editImageSize,
                image_align: editImageAlign
            }).eq("id", id);

            if (error) {
                console.error("Update error:", error);
                alert("수정에 실패했습니다: " + error.message);
            } else {
                alert("성공적으로 수정되었습니다! 🎉");
                setIsEditing(false);
                setEditImageFile(null);
                setEditImagePreview("");
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
                    <div className="flex flex-col gap-4 rounded-2xl border-2 border-[var(--primary)] bg-white p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-bold text-[var(--foreground)]">게시글 수정하기</h2>
                            <span className="text-xs text-[var(--muted)]">이미지를 클릭하여 크기와 위치를 조절하세요.</span>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">카테고리</label>
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--primary)] focus:outline-none"
                                >
                                    {isAdmin && <option value="notice">공지사항</option>}
                                    <option value="question">질문</option>
                                    <option value="info">정보 공유</option>
                                    <option value="experience">경험담</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">사진 변경</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditImageChange}
                                    className="w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--primary-pale)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--primary)] hover:file:bg-[var(--primary)] hover:file:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">제목</label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-lg font-bold focus:border-[var(--primary)] focus:outline-none"
                            />
                        </div>

                        {/* 시각적 블록 편집기 영역 (수정 모드) */}
                        <div className="rounded-xl border border-[var(--border)] bg-gray-50/30 p-4 space-y-4 min-h-[400px]">
                            {editBlocks.map((block, idx) => {
                                if (block.type === 'image') {
                                    const sizeClasses: any = { small: 'w-1/3', medium: 'w-2/3', large: 'w-full' };
                                    const alignClasses: any = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' };

                                    return (
                                        <div key={block.id} className="relative group py-2">
                                            <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => moveEditImage('up')} className="p-1 bg-white border rounded shadow-sm hover:bg-gray-50">▲</button>
                                                <button type="button" onClick={() => moveEditImage('down')} className="p-1 bg-white border rounded shadow-sm hover:bg-gray-50">▼</button>
                                            </div>

                                            <div
                                                className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${activeEditImageId === block.id ? 'border-[var(--primary)] ring-4 ring-[var(--primary-pale)]' : 'border-transparent hover:border-gray-300'} ${sizeClasses[editImageSize]} ${alignClasses[editImageAlign]}`}
                                                onClick={() => setActiveEditImageId(activeEditImageId === block.id ? null : block.id)}
                                            >
                                                <img src={block.value} alt="Preview" className="w-full h-auto" />

                                                {activeEditImageId === block.id && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in zoom-in duration-200">
                                                        <div className="bg-white rounded-xl p-3 shadow-xl space-y-3" onClick={e => e.stopPropagation()}>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold text-gray-400 text-center">크기 선택</p>
                                                                <div className="flex gap-1">
                                                                    {['small', 'medium', 'large'].map(s => (
                                                                        <button key={s} type="button" onClick={() => setEditImageSize(s)} className={`px-3 py-1 text-[10px] rounded-md border ${editImageSize === s ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                                                            {s === 'small' ? '작게' : s === 'medium' ? '중간' : '크게'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold text-gray-400 text-center">정렬</p>
                                                                <div className="flex gap-1">
                                                                    {['left', 'center', 'right'].map(a => (
                                                                        <button key={a} type="button" onClick={() => setEditImageAlign(a)} className={`px-3 py-1 text-[10px] rounded-md border ${editImageAlign === a ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                                                            {a === 'left' ? '왼쪽' : a === 'center' ? '가운데' : '오른쪽'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <button type="button" onClick={() => setActiveEditImageId(null)} className="w-full py-1.5 text-xs font-bold bg-gray-100 rounded-lg hover:bg-gray-200">확인</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <textarea
                                        key={block.id}
                                        value={block.value}
                                        onChange={(e) => {
                                            const newBlocks = [...editBlocks];
                                            newBlocks[idx].value = e.target.value;
                                            setEditBlocks(newBlocks);
                                        }}
                                        className="w-full min-h-[100px] bg-transparent resize-none border-none focus:ring-0 text-base leading-relaxed placeholder:text-gray-300"
                                    />
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button onClick={() => { setIsEditing(false); setEditImageFile(null); setEditImagePreview(""); }} className="rounded-lg bg-gray-200 px-6 py-2 font-bold transition-all hover:bg-gray-300">취소</button>
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

                        {/* 내용 랜더링 (이미지 배치 로직 포함) */}
                        <div className="mt-8 w-full leading-relaxed text-[var(--foreground)] text-base sm:text-lg">
                            {(() => {
                                const sizeClasses: Record<string, string> = {
                                    small: "w-[180px] sm:w-[260px]",
                                    medium: "w-[320px] sm:w-[480px]",
                                    large: "w-full"
                                };

                                const alignClasses: Record<string, string> = {
                                    left: "float-left mr-5 mb-5",
                                    center: "mx-auto block my-8 clear-both",
                                    right: "float-right ml-5 mb-5"
                                };

                                const currentSize = sizeClasses[post.image_size || 'medium'] || sizeClasses.medium;
                                const currentAlign = alignClasses[post.image_align || 'center'] || alignClasses.center;

                                const imageElement = post.image_url ? (
                                    <div className={`${currentSize} ${currentAlign} overflow-hidden rounded-xl border border-[var(--border)] bg-gray-50 shadow-sm`}>
                                        <img
                                            src={post.image_url}
                                            alt="첨부 이미지"
                                            className="h-auto w-full object-contain"
                                        />
                                    </div>
                                ) : null;

                                if (post.image_url && post.content.includes("[IMAGE]")) {
                                    const parts = post.content.split("[IMAGE]");
                                    return (
                                        <div className="whitespace-pre-wrap">
                                            {parts[0]}
                                            {imageElement}
                                            {parts[1]}
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {imageElement}
                                        <div className="whitespace-pre-wrap clear-both">{post.content}</div>
                                    </>
                                );
                            })()}
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
