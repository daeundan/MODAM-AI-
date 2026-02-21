"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DiagnosisStage } from "@/lib/types";
import { saveDiagnosis } from "@/lib/diagnosis-store";
import Disclaimer from "@/components/Disclaimer";

type UploadSlot = "crown" | "hairline";

export default function DiagnosePage() {
  const [crownFile, setCrownFile] = useState<File | null>(null);
  const [hairlineFile, setHairlineFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const setFile = (slot: UploadSlot, file: File | null) => {
    if (slot === "crown") setCrownFile(file);
    else setHairlineFile(file);
    setError("");
  };

  const canSubmit = crownFile && hairlineFile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("정수리·헤어라인 사진을 모두 올려주세요.");
      return;
    }
    setAnalyzing(true);
    setError("");

    // 목업: 3~5초 후 랜덤 단계로 결과 생성
    await new Promise((r) => setTimeout(r, 3500));
    const stages: DiagnosisStage[] = ["normal", "caution", "risk"];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const confidence = 0.75 + Math.random() * 0.2;

    const result = {
      id: `diag_${Date.now()}`,
      userId: "current",
      stage,
      confidence,
      createdAt: new Date().toISOString(),
      summary:
        stage === "normal"
          ? "현재 두피 상태가 양호한 편으로 판단됩니다. 꾸준한 관리로 유지해 주세요."
          : stage === "caution"
            ? "탈모 주의 단계로 판단됩니다. 맞춤 관리 방법과 제품 추천을 확인해 보세요."
            : "전문가 상담을 권장드립니다. 병원 방문을 고려해 주세요.",
      guideSummary:
        stage === "normal"
          ? "건강한 두피 유지 가이드를 확인하세요."
          : stage === "caution"
            ? "주의 단계 관리 가이드와 추천 제품을 확인하세요."
            : "위험 단계 관리 가이드와 전문가 연계를 안내합니다.",
    };

    saveDiagnosis(result);
    setAnalyzing(false);
    router.push(`/report?id=${result.id}`);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-20 pb-6 sm:pt-26 sm:pb-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">AI 탈모 자가진단</h1>
        <p className="mx-auto text-sm text-[var(--muted)] sm:text-base max-w-md">
          정수리와 헤어라인 사진을 올려주시면 AI가 분석해 탈모 진행 단계(정상·주의·위험)를 알려드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <PhotoSlot
            label="정수리 사진"
            file={crownFile}
            onFileChange={(f) => setFile("crown", f)}
          />
          <PhotoSlot
            label="헤어라인 사진"
            file={hairlineFile}
            onFileChange={(f) => setFile("hairline", f)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
        )}

        <div className="flex flex-col gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={!canSubmit || analyzing}
            className="min-h-[44px] rounded-lg bg-[var(--primary)] py-3 text-white disabled:opacity-50 hover:bg-[var(--primary-light)] disabled:hover:bg-[var(--primary)] transition-colors active:scale-[0.98]"
          >
            {analyzing ? "AI 분석 중… (약 10초)" : "진단하기"}
          </button>
        </div>
      </form>

      <div className="mt-8 sm:mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}

function PhotoSlot({
  label,
  file,
  onFileChange,
}: {
  label: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    if (f) {
      setPreview(URL.createObjectURL(f));
      onFileChange(f);
    } else {
      setPreview(null);
      onFileChange(null);
    }
  };

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-[var(--muted)]">{label}</span>
      <label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 transition-colors active:border-[var(--primary)]/60 hover:border-[var(--primary)]/40 sm:min-h-[180px]">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt={label}
              className="max-h-48 w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
                onFileChange(null);
              }}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600"
              aria-label="사진 삭제"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <svg className="h-12 w-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-[var(--muted)]">사진 촬영 또는 선택</span>
            <span className="text-xs text-[var(--muted)]">터치하여 업로드</span>
          </div>
        )}
      </label>
      {file && (
        <p className="mt-2 truncate text-xs text-[var(--muted)]">{file.name}</p>
      )}
    </div>
  );
}
