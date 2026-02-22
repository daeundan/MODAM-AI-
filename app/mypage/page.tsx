"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getDiagnoses } from "@/lib/diagnosis-store";
import { STAGE_LABELS } from "@/lib/mock-data";

export default function MypagePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [diagnoses, setDiagnoses] = useState<{ id: string; stage: string; createdAt: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editNick, setEditNick] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  useEffect(() => {
    const list = getDiagnoses();
    setDiagnoses(
      list.map((d) => ({
        id: d.id,
        stage: STAGE_LABELS[d.stage] ?? d.stage,
        createdAt: d.createdAt,
      }))
    );

    if (profile) {
      setEditNick(profile.nickname || "");
      setEditPhone(profile.phone_number || "");
      setEditAddress(profile.address || "");
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: editNick,
        phone_number: editPhone,
        address: editAddress,
      })
      .eq("id", user.id);

    if (error) {
      alert("업데이트 실패: " + error.message);
    } else {
      await refreshProfile();
      setIsEditing(false);
      alert("프로필이 업데이트되었습니다.");
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      alert("이미지 업로드 실패: " + uploadError.message);
    } else {
      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update Profile Table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        alert("프로필 정보 업데이트 실패: " + updateError.message);
      } else {
        await refreshProfile();
        alert("프로필 이미지가 변경되었습니다.");
      }
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gray-100 p-6">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold">로그인이 필요합니다</h2>
        <p className="mb-8 text-[var(--muted)]">회원가입 후 진단 기록과 맞춤 서비스를 이용해보세요.</p>
        <Link href="/login" className="w-full rounded-xl bg-[var(--primary)] px-8 py-3 font-bold text-white transition-all hover:bg-[var(--primary-light)]">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-12 sm:pt-28">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">마이페이지</h1>
        <button
          onClick={() => signOut()}
          className="text-sm font-medium text-red-500 hover:underline"
        >
          로그아웃
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm">
            <div className="relative mx-auto mb-4 h-24 w-24">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-[var(--primary)]/20 bg-gray-100">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--primary)]/5 text-2xl font-bold text-[var(--primary)]">
                    {profile?.nickname?.[0] || user.email?.[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="absolute bottom-0 right-0 rounded-full border border-white bg-white p-1.5 shadow-md hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <svg className="h-4 w-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-lg font-bold">{profile?.nickname || "사용자"}</h2>
                <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                  {profile?.user_role === "expert" ? "전문가" : profile?.user_role === "owner" ? "사장님" : "일반"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">{user.email}</p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full rounded-lg border border-[var(--border)] py-2 text-xs font-semibold transition-all hover:bg-gray-50"
            >
              {isEditing ? "취소" : "프로필 수정"}
            </button>
          </div>
        </div>

        {/* Info Content */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold">프로필 수정</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <label className="block text-sm font-semibold">
                  닉네임
                  <input
                    type="text"
                    value={editNick}
                    onChange={(e) => setEditNick(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-2"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  휴대폰 번호
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-2"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  주소
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-2"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[var(--primary)] py-3 font-bold text-white disabled:opacity-50"
                >
                  {loading ? "저장 중..." : "저장하기"}
                </button>
              </form>
            </section>
          ) : (
            <>
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold">회원 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">아이디</span>
                    <span className="font-medium">{profile?.username || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">이름</span>
                    <span className="font-medium">{profile?.full_name || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">연락처</span>
                    <span className="font-medium">{profile?.phone_number || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">가입 경로</span>
                    <span className="font-medium">{profile?.signup_path || "-"}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">자가진단 리포트</h3>
                  <Link href="/diagnose" className="text-xs font-bold text-[var(--primary)] hover:underline">
                    새 진단하기 +
                  </Link>
                </div>
                {diagnoses.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--muted)]">
                    아직 측정된 진단 기록이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diagnoses.map((d) => (
                      <Link
                        key={d.id}
                        href={`/report?id=${d.id}`}
                        className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3 transition-all hover:border-[var(--primary)]/30 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${d.stage === "위험" ? "bg-red-500" : d.stage === "주의" ? "bg-orange-500" : "bg-green-500"}`} />
                          <span className="text-sm font-bold">{d.stage} 단계</span>
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {new Date(d.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
