import Link from "next/link";
import Image from "next/image";
import Disclaimer from "@/components/Disclaimer";

export default function HomeDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* 히어로 */}
      <section className="gradient-muted relative mb-16 overflow-hidden rounded-3xl border border-[var(--border)] px-6 py-12 sm:px-10 sm:py-16">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--secondary) 0%, transparent 50%)" }} />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/modam-logo.png"
              alt="모담 MODAM"
              width={200}
              height={67}
              className="h-auto w-full max-w-[200px] object-contain sm:max-w-[240px] md:max-w-[280px]"
              priority
            />
          </div>
          <p className="mb-2 text-lg font-bold uppercase tracking-wider text-[var(--primary)] sm:text-xl md:text-2xl">
            AI 기반 탈모 자가진단 및 맞춤 관리
          </p>
          <p className="mx-auto max-w-2xl text-sm text-[var(--muted)] sm:text-base md:text-lg">
            두피 사진만 올리면 AI가 분석해 드려요. 정상·주의·위험 단계를 확인하고,
            나에게 맞는 관리 방법과 제품 추천, 커뮤니티·전문가 연계까지 한곳에서.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/diagnose"
              className="gradient-primary min-h-[44px] rounded-full px-6 py-3 font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-[var(--primary)]/25 active:scale-[0.98]"
            >
              AI 자가진단 시작하기
            </Link>
            <Link
              href="/products"
              className="min-h-[44px] rounded-full border-2 border-[var(--primary)] bg-white px-6 py-3 font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary-pale)] active:scale-[0.98]"
            >
              제품 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          서비스 안내
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="AI 자가진단" desc="정수리·헤어라인 사진을 올리면 10초 안에 탈모 진행 단계를 알려드려요." href="/diagnose" icon="diagnose" />
          <Card title="맞춤 추천" desc="진단 결과에 맞는 관리 방법, 시술 정보, 제품을 추천해 드려요." href="/recommendations" icon="recommend" />
          <Card title="제품 정보" desc="탈모 케어 제품·병원 정보를 검색하고 상세 내용을 확인할 수 있어요." href="/products" icon="product" />
          <Card title="커뮤니티" desc="익명으로 고민을 나누고 다른 사용자 경험담을 읽어보세요." href="/community" icon="community" />
          <Card title="전문가 상담" desc="탈모 전문의·상담사와 연결해 신뢰할 수 있는 상담을 받아보세요." href="/experts" icon="expert" />
          <Card title="마이페이지" desc="진단 기록, 추천 이력, 개인 설정을 한곳에서 관리하세요." href="/mypage" icon="mypage" />
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}

function Card({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="card-lift accent-left block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-200 hover:border-[var(--primary)]/40 hover:bg-[var(--primary-pale)]/30"
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-pale)] text-[var(--primary)]">
        {icon === "diagnose" && <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        {icon === "recommend" && <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
        {icon === "product" && <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        {icon === "community" && <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        {icon === "expert" && <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        {icon === "mypage" && <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
      </span>
      <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="text-sm leading-relaxed text-[var(--muted)]">{desc}</p>
    </Link>
  );
}
