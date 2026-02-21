"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, type Review } from "@/lib/supabase";

export default function ReviewSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showList, setShowList] = useState(false);
    const [nickname, setNickname] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitDone, setSubmitDone] = useState(false);
    const [error, setError] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showList) fetchReviews();
    }, [showList]);

    async function fetchReviews() {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error && data) setReviews(data as Review[]);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!nickname.trim() || !content.trim()) {
            setError("닉네임과 한줄평을 모두 입력해주세요.");
            return;
        }
        if (content.length > 80) {
            setError("한줄평은 80자 이내로 작성해주세요.");
            return;
        }
        setLoading(true);
        setError("");
        const { error: insertError } = await supabase
            .from("reviews")
            .insert([{ nickname: nickname.trim(), content: content.trim() }]);
        setLoading(false);
        if (insertError) {
            setError("저장 중 오류가 발생했어요. 다시 시도해주세요.");
        } else {
            setSubmitDone(true);
            setNickname("");
            setContent("");
        }
    }

    function openModal() {
        setShowModal(true);
        setSubmitDone(false);
        setError("");
        setNickname("");
        setContent("");
    }

    function closeModal() {
        setShowModal(false);
        setSubmitDone(false);
    }

    function formatDate(iso: string) {
        const d = new Date(iso);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    }

    return (
        <>
            {/* 버튼 영역 */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                justifyContent: "center",
                padding: "16px 50px 0",
                flexWrap: "wrap",
            }}>
                <button onClick={openModal} style={btnStyle()}>
                    단이에게 한줄평 남기기 ✍️
                </button>
                <button
                    onClick={() => {
                        setShowList((v) => !v);
                    }}
                    style={btnStyle()}
                >
                    {showList ? "💬 다른 사람이 쓴 리뷰 닫기" : `💬 다른 사람이 쓴 리뷰 보기 ${reviews.length > 0 ? `(${reviews.length})` : ""}`}
                </button>
            </div>

            {/* 리뷰 목록 */}
            {showList && (
                <div style={{
                    margin: "12px 50px",
                    borderRadius: "12px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    maxHeight: "240px",
                    overflowY: "auto",
                    padding: "8px 0",
                }}>
                    {reviews.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#9ca3af", padding: "20px", fontSize: "14px" }}>
                            아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요! 🌱
                        </p>
                    ) : (
                        reviews.map((r) => (
                            <div key={r.id} style={{
                                padding: "10px 16px",
                                borderBottom: "1px solid #f3f4f6",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 600, fontSize: "13px", color: "#374151" }}>
                                        {r.nickname}
                                    </span>
                                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>{formatDate(r.created_at)}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: "14px", color: "#4b5563", lineHeight: 1.5 }}>
                                    {r.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* 작성 모달 */}
            {showModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    style={{
                        position: "fixed", inset: 0, zIndex: 1000,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "20px",
                    }}
                >
                    <div
                        ref={modalRef}
                        style={{
                            background: "#fff", borderRadius: "20px",
                            padding: "28px 24px", width: "100%", maxWidth: "380px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                        }}
                    >
                        {submitDone ? (
                            <div style={{ textAlign: "center", padding: "16px 0" }}>
                                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
                                <p style={{ fontWeight: 700, fontSize: "17px", color: "#1f2937", marginBottom: 8 }}>
                                    리뷰가 등록됐어요!
                                </p>
                                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
                                    소중한 의견 감사합니다 💚
                                </p>
                                <button
                                    onClick={() => { closeModal(); setShowList(true); fetchReviews(); }}
                                    style={btnStyle()}
                                >
                                    리뷰 목록 보기
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>
                                    한줄평 남기기 ✍️
                                </h2>
                                <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#6b7280" }}>
                                    익명으로 솔직한 한줄평을 남겨주세요
                                </p>
                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div>
                                        <label style={labelStyle}>닉네임</label>
                                        <input
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="익명의 두피인"
                                            maxLength={20}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>
                                            한줄평 <span style={{ color: "#9ca3af", fontWeight: 400 }}>({content.length}/80)</span>
                                        </label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="이 서비스를 한 마디로 표현한다면?"
                                            maxLength={80}
                                            rows={3}
                                            style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                                        />
                                    </div>
                                    {error && (
                                        <p style={{ margin: 0, fontSize: "13px", color: "#ef4444" }}>{error}</p>
                                    )}
                                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            style={btnStyle("modal-cancel")}
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{ ...btnStyle("modal-submit"), opacity: loading ? 0.7 : 1 }}
                                        >
                                            {loading ? "등록 중..." : "등록하기"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

function btnStyle(variant: "default" | "cancel" | "modal-submit" | "modal-cancel" = "default") {
    if (variant === "cancel") {
        return {
            minHeight: "44px",
            padding: "10px 20px",
            borderRadius: "12px",
            border: "none",
            background: "#f3f4f6",
            color: "#374151",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            transition: "opacity 0.15s, transform 0.1s",
        } as React.CSSProperties;
    }
    if (variant === "modal-cancel") {
        return {
            minHeight: "44px",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            background: "#f3f4f6",
            color: "#374151",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            flex: 1,
            transition: "opacity 0.15s, transform 0.1s",
        } as React.CSSProperties;
    }
    if (variant === "modal-submit") {
        return {
            minHeight: "44px",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            background: "#94AC3A",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            flex: 1,
            transition: "opacity 0.15s, transform 0.1s",
        } as React.CSSProperties;
    }
    return {
        minHeight: "44px",
        padding: "10px 20px",
        borderRadius: "12px",
        border: "1px solid #ddd",
        background: "#ffffff",
        color: "#161616",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
        transition: "opacity 0.15s, transform 0.1s",
    } as React.CSSProperties;
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "14px",
    color: "#1f2937",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#f9fafb",
};
