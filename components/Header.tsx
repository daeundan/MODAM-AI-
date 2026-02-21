"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, logout, isReady } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 온보딩 화면(비로그인 첫 화면)에서는 헤더 숨김
  if (!isReady || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--primary)]/20 bg-[var(--card)]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/modam-icon.png"
            alt="모담"
            width={36}
            height={36}
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            priority
          />
          <span
            className="gradient-text-primary bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl"
            style={{ fontFamily: "Pretendard, sans-serif" }}
          >
            MODAM
          </span>
        </Link>
        
        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/diagnose" className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
            AI 진단
          </Link>
          <Link href="/recommendations" className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
            맞춤 추천
          </Link>
          <Link href="/products" className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
            제품 정보
          </Link>
          <Link href="/community" className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
            커뮤니티
          </Link>
          <Link href="/experts" className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
            전문가 상담
          </Link>
          {user ? (
            <>
              <Link href="/mypage" className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                {user.name}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-md px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--border)] transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
              로그인
            </Link>
          )}
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--foreground)] hover:bg-[var(--border)] md:hidden"
          aria-label="메뉴"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <nav className="border-t border-[var(--border)] bg-[var(--card)] md:hidden">
          <div className="flex flex-col px-4 py-2">
            <Link
              href="/diagnose"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              AI 진단
            </Link>
            <Link
              href="/recommendations"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              맞춤 추천
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              제품 정보
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              커뮤니티
            </Link>
            <Link
              href="/experts"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              전문가 상담
            </Link>
            <div className="my-2 border-t border-[var(--border)]"></div>
            {user ? (
              <>
                <Link
                  href="/mypage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-[var(--muted)]"
                >
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="py-3 text-left text-[var(--muted)]"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-[var(--muted)]"
              >
                로그인
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
