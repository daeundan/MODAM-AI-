import Link from "next/link";
import Image from "next/image";
import Disclaimer from "@/components/Disclaimer";
import ReviewSection from "@/components/ReviewSection";

export default function HomeDashboard() {
  return (
    <div className="mx-auto">
      {/* 히어로 & 이미지 오버레이 컨테이너 */}
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src="/assets/img/main-banner.png"
          alt="모담 메인 배너"
          width={1200}
          height={300}
          className="w-full h-[220px] sm:h-[320px] md:h-[420px] object-cover opacity-70"
          priority
        />

        {/* 이미지 위 오버레이 컨텐츠 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <p className="mb-2 hidden text-xl font-bold uppercase tracking-wider text-white sm:block sm:text-2xl md:text-3xl drop-shadow-lg">
            AI 기반 탈모 자가진단 및 맞춤 관리
          </p>
          <p className="mx-auto hidden max-w-2xl text-sm text-gray-100 sm:block sm:text-base md:text-xl drop-shadow-md">
            두피 사진만 올리면 AI가 분석해 드려요. 정상·주의·위험 단계를 확인하고,
            나에게 맞는 관리 방법과 제품 추천, 커뮤니티·전문가 연계까지 한곳에서.
          </p>

          <div className="mt-16 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/diagnose"
              className="gradient-primary flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 sm:px-8 sm:py-3.5 sm:text-base"
            >
              AI 자가진단 시작하기
            </Link>
            <Link
              href="/products"
              className="flex min-h-[44px] items-center justify-center rounded-full border-2 border-white bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 sm:px-8 sm:py-3.5 sm:text-base"
            >
              제품 둘러보기
            </Link>
          </div>

          <div className="mt-8 w-full max-w-md">
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-10 flex flex-col gap-2">
          <div className="flex flex-col justify-center items-center mb-2">
            <h2 className="mb-2 text-center text-xl font-bold text-[var(--foreground)] sm:text-2xl">
              서비스 안내
            </h2>
            <p>아직 업그레이드 진행중인 데모버전입니다.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            <Card title="AI 진단" desc="정수리·헤어라인 사진을 올리면 10초 안에 탈모 진행 단계를 알려드려요." href="/diagnose" icon="diagnose" />
            <Card title="맞춤 추천" desc="진단 결과에 맞는 관리 방법, 시술 정보, 제품을 추천해 드려요." href="/recommendations" icon="recommend" />
            <Card title="제품 정보" desc="탈모 케어 제품·병원 정보를 검색하고 상세 내용을 확인할 수 있어요." href="/products" icon="product" />
            <Card title="커뮤니티" desc="익명으로 고민을 나누고 다른 사용자 경험담을 읽어보세요." href="/community" icon="community" />
            <Card title="전문가 상담" desc="탈모 전문의·상담사와 연결해 신뢰할 수 있는 상담을 받아보세요." href="/experts" icon="expert" />
            <Card title="마이페이지" desc="진단 기록, 추천 이력, 개인 설정을 한곳에서 관리하세요." href="/mypage" icon="mypage" />
          </div>
          <ReviewSection />
        </section>

        <Disclaimer />
      </div>
    </div>
  );
}

function Card({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="card-lift block rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition-all duration-200 hover:border-[var(--primary)]/40 hover:bg-[var(--primary-pale)]/30 sm:rounded-2xl sm:p-6 sm:accent-left"
    >
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-pale)] text-[var(--primary)] sm:mb-3 sm:h-10 sm:w-10 sm:rounded-xl">
          {icon === "diagnose" && <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          {icon === "recommend" && <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          {icon === "product" && <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          {icon === "community" && <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          {icon === "expert" && <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          {icon === "mypage" && <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        </span>
        <h2 className="text-xs font-bold text-[var(--foreground)] sm:text-lg">{title}</h2>
        <p className="mt-2 hidden text-sm leading-relaxed text-[var(--muted)] sm:block">{desc}</p>
      </div>
    </Link>
  );
}
