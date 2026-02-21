export default function Disclaimer() {
  return (
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--secondary-pale)]/50 p-5 text-sm">
      <strong className="text-[var(--secondary-dark)]">면책 조항</strong>
      <p className="mt-2 leading-relaxed text-[var(--muted)]">
        본 서비스의 AI 진단 결과는 참고용 자가 체크에 불과하며, 의료 진단을 대체하지 않습니다.
        정확한 판단과 치료를 위해서는 반드시 병원에서 전문의 상담을 받아 주세요.
      </p>
    </aside>
  );
}
