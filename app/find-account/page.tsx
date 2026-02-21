import Link from "next/link";

export default function FindAccountPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
        아이디/비밀번호 찾기
      </h1>
      <p className="mb-8 text-sm text-[var(--muted)]">
        가입 시 사용한 이메일을 입력하시면 안내를 보내드립니다.
      </p>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">
          이메일 인증 연동은 준비 중입니다. 문의사항은 고객센터로 연락해 주세요.
        </p>
      </div>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-[var(--primary)] underline hover:no-underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
