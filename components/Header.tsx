"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, signOut, isReady, isGuest } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 온보딩 화면(비로그인 첫 화면)에서는 헤더 숨김
  if (!isReady || (!user && !isGuest)) {
    return null;
  }

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-black/80 backdrop-blur-md border-b border-white/10"
        : "bg-transparent border-transparent"
        }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* 왼쪽: 뒤로가기 버튼 */}
        <div className="relative z-30 w-24">
          {!isHome && (
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-1 py-2 text-sm transition-all duration-300 ${scrolled ? "text-white" : "text-[var(--foreground)]"
                }`}
            >
              <span>←</span> <span>뒤로가기</span>
            </button>
          )}
        </div>

        {/* 중앙: 로고 이미지 */}
        <Link href="/" className="absolute left-1/2 flex -translate-x-1/2 items-center focus:outline-none">
          <Image
            src="/assets/img/opacity-logo.png"
            alt="모담"
            width={100}
            height={32}
            className={`h-8 w-auto object-contain transition-all duration-300 ${scrolled ? "brightness-0 invert" : ""}`}
            priority
          />
        </Link>

        {/* 오른쪽: 데스크톱 내비게이션 및 모바일 메뉴 버튼 */}
        <div className="flex min-w-[3rem] items-center justify-end">
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/community"
              className={`transition-colors duration-300 ${scrolled ? "text-white hover:text-white/80" : "text-[var(--foreground)] hover:text-[var(--primary)]"}`}
            >
              커뮤니티
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className={`rounded-md px-3 py-1.5 transition-colors duration-300 ${scrolled
                ? "text-white/70 hover:bg-white/10"
                : "text-[var(--muted)] hover:bg-[var(--border)]"
                }`}
            >
              로그아웃
            </button>
          </nav>

          {/* 모바일 메뉴 버튼 (애니메이션 적용) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-md transition-colors duration-300 md:hidden ${scrolled ? "text-white" : "text-[var(--foreground)]"
              }`}
            aria-label="메뉴"
          >
            <div className="relative h-5 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${mobileMenuOpen ? "top-2.5 rotate-45" : "top-0.5"
                  }`}
              />
              <span
                className={`absolute left-0 top-2.5 block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${mobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${mobileMenuOpen ? "top-2.5 -rotate-45" : "top-[18px]"
                  }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 드로어 */}
      {mobileMenuOpen && (
        <>
          {/* 백드롭 (어두운 배경) */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* 드로어 컨텐츠 (콤팩트 카드 형태) */}
          <nav className="fixed right-4 top-16 z-50 w-[180px] max-h-[70vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-all duration-300 ease-in-out">
            <div className="flex flex-col p-2">
              <Link
                href="/diagnose"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary-pale)]"
              >
                <span>🔍</span>
                <span>AI 진단</span>
              </Link>
              <Link
                href="/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary-pale)]"
              >
                <span>✨</span>
                <span>맞춤 추천</span>
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary-pale)]"
              >
                <span>🧴</span>
                <span>제품 정보</span>
              </Link>
              <Link
                href="/community"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary-pale)]"
              >
                <span>💬</span>
                <span>커뮤니티</span>
              </Link>
              <Link
                href="/experts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary-pale)]"
              >
                <span>👨‍⚕️</span>
                <span>전문가 상담</span>
              </Link>
              <Link
                href="/mypage"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary-pale)]"
              >
                <span>👤</span>
                <span>마이페이지</span>
              </Link>

              <div className="my-2 border-t border-[var(--border)]"></div>

              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setMobileMenuOpen(false);
                  router.push("/");
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
              >
                <span>🚪</span>
                <span>로그아웃</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

