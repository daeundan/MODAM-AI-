"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

const ROLES = [
  { value: "user", label: "일반 사용자" },
  { value: "expert", label: "전문가" },
  { value: "owner", label: "사장님" },
];

const SIGNUP_PATHS = ["지인 추천", "SNS (인스타그램/페이스북)", "포털 검색 (네이버/구글)", "커뮤니티", "기타"];

export default function OnboardingWithLogin({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const router = useRouter();

  // Common/Signup fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // 아이디
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [path, setPath] = useState("");
  const [address, setAddress] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const isLogin = mode === "login";
  const { enterAsGuest } = useAuth();

  // 필수 정보 입력 여부 확인
  const isFormValid = useMemo(() => {
    if (isLogin) {
      return email.length > 0 && password.length > 0;
    }
    // 필수 정보: 아이디, 비밀번호(6자이상), 이름, 닉네임, 휴대폰, 이메일, 가입경로, 개인정보동의
    return (
      username.length > 0 &&
      password.length >= 6 &&
      fullName.length > 0 &&
      nickname.length > 0 &&
      phone.length > 0 &&
      email.length > 0 &&
      path.length > 0 &&
      agreePrivacy
    );
  }, [isLogin, email, password, username, fullName, nickname, phone, email, path, agreePrivacy]);


  const handleAnonymousLogin = () => {
    enterAsGuest();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      if (!username.trim() || !password.trim()) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
      }

      setLoading(true);
      // 1. 아이디로 이메일 찾기
      const { data: profileData, error: findError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username)
        .single();

      if (findError || !profileData) {
        alert("일치하는 회원 정보가 없습니다.");
        setLoading(false);
        return;
      }

      // 2. 찾은 이메일로 로그인
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password
      });

      if (loginError) {
        alert("로그인 실패: 비밀번호를 확인해주세요.");
      } else {
        router.push("/");
      }
      setLoading(false);
    } else {
      // 회원가입 로직
      if (!isFormValid) {
        alert("필수 항목을 모두 입력하고 약관에 동의해주세요.");
        return;
      }

      setLoading(true);
      // ID 유효성 검사
      const idRegex = /^[a-z0-9]+$/;
      if (!idRegex.test(username)) {
        alert("아이디는 영문 소문자와 숫자 조합이어야 합니다.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert("회원가입 실패: " + error.message);
      } else if (data.user) {
        // 프로필 테이블 생성
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username,
          nickname,
          full_name: fullName,
          phone_number: phone,
          email: email, // 이메일 저장 추가
          user_role: role,
          signup_path: path,
          address: address || null,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // RLS 에러 발생 시 안내
          if (profileError.code === "42501") {
            alert("회원가입은 성공했으나 프로필 생성 권한이 없습니다. 관리자에게 문의하거나 SQL 설정을 확인해주세요.");
          } else {
            alert("프로필 생성 실패: " + profileError.message);
          }
        } else {
          alert("회원가입 성공! 이메일을 확인해주세요.");
          setMode("login");
        }
      }
      setLoading(false);
    }
  };

  const BrandingSection = () => (
    <section className="mb-8 flex flex-col items-center">
      <Image
        src="/assets/img/opacity-logo.png"
        alt="모담"
        width={160}
        height={60}
        className="h-14 w-auto object-contain mb-2"
        priority
      />
      <span
        className="gradient-text-primary mt-3 bg-clip-text text-2xl font-bold tracking-tight text-transparent"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        MODAM
      </span>
    </section>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--onboarding-bg)] px-4 py-8">
      <div className="w-full max-w-lg">
        <BrandingSection />
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl sm:p-10">
          <h2 className="mb-8 text-center text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            {isLogin ? "로그인" : "회원가입"}
          </h2>

          <form onSubmit={handleAuth} className="flex flex-col gap-6">
            {!isLogin && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[var(--foreground)]">회원 구분 (필수)</label>
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--border)] bg-gray-50/50 p-1">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2.5 transition-all ${role === r.value
                        ? "bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--primary)]/10"
                        : "text-[var(--muted)] hover:bg-white/50"
                        }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value={r.value}
                        checked={role === r.value}
                        onChange={(e) => setRole(e.target.value)}
                        className="h-3.5 w-3.5 accent-[var(--primary)]"
                      />
                      <span className="text-xs font-bold sm:text-sm">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {isLogin ? (
                <>
                  <label className="text-sm font-bold">
                    아이디
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                      placeholder="아이디를 입력하세요"
                    />
                  </label>
                  <label className="text-sm font-bold">
                    비밀번호
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                      placeholder="••••••••"
                    />
                  </label>
                </>
              ) : (
                <>
                  {/* 회원가입 정보 (요청 순서: 아이디, 비밀번호, 이름, 닉네임, 휴대폰, 주소, 이메일, 가입경로) */}
                  <div className="grid grid-cols-1 gap-5">
                    <label className="text-sm font-bold">
                      아이디 (영문 소문자+숫자) <span className="text-red-500">*</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)]"
                        placeholder="modam123"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      비밀번호 <span className="text-red-500">*</span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)]"
                        placeholder="6자 이상 입력"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      이름 (실명) <span className="text-red-500">*</span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)]"
                        placeholder="홍길동"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      닉네임 <span className="text-red-500">*</span>
                      <input
                        type="text"
                        required
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)]"
                        placeholder="별명"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      휴대폰 번호 <span className="text-red-500">*</span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)]"
                        placeholder="010-0000-0000"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      주소 (선택)
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)]"
                        placeholder="서울시 강남구..."
                      />
                    </label>
                    <label className="text-sm font-bold">
                      이메일 <span className="text-red-500">*</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 focus:border-[var(--primary)]"
                        placeholder="example@modam.com"
                      />
                    </label>
                    <label className="text-sm font-bold">
                      가입 경로 <span className="text-red-500">*</span>
                      <select
                        required
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 focus:border-[var(--primary)]"
                      >
                        <option value="">어떻게 오셨나요?</option>
                        {SIGNUP_PATHS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="h-5 w-5 rounded-md border-[var(--border)] accent-[var(--primary)]"
                      />
                      <span className="text-sm font-medium text-[var(--muted)]">개인정보보호 정책 동의 (필수)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-xs font-bold text-[var(--primary)] underline hover:opacity-80"
                    >
                      상세보기
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--primary)] py-4 text-base font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:bg-[var(--primary-light)] active:scale-[0.98]"
              >
                {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입 완료"}
              </button>
              <button
                type="button"
                onClick={handleAnonymousLogin}
                className="w-full rounded-xl bg-gray-500 py-4 text-base font-bold text-white transition-all hover:bg-gray-200 active:scale-[0.98]"
              >
                익명 로그인
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(isLogin ? "signup" : "login")}
              className="text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              {isLogin ? "아직 회원이 아니신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-10 animate-in fade-in zoom-in duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">개인정보보호 정책</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-black">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-[350px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-gray-50/50 p-5 text-sm leading-relaxed text-[var(--muted)]">
              <div className="space-y-4">
                <p>모담(이하 "회사")은 이용자의 개인정보를 매우 소중하게 생각하며, 관련 법령을 엄격히 준수합니다.</p>
                <div>
                  <h4 className="font-bold text-[var(--foreground)] mb-1">1. 수집 항목 (필수)</h4>
                  <p>아이디, 비밀번호, 이름, 닉네임, 휴대폰 번호, 이메일, 가입 경로 등</p>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--foreground)] mb-1">2. 수집 및 이용 목적</h4>
                  <p>- 서비스 이용에 따른 본인 식별 및 가입 의사 확인<br />- AI 자가진단 리포트 저장 및 고객 관리<br />- 부정이용 방지 및 유효한 서비스 제공</p>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--foreground)] mb-1">3. 보유 및 이용 기간</h4>
                  <p>회원 탈퇴 시 즉시 파기하거나, 관련 법령에 의해 보존이 필요한 경우 해당 기간까지 보관합니다.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-8 w-full rounded-xl bg-[var(--primary)] py-3.5 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all active:scale-95"
            >
              내용을 확인했습니다
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
