// 클라이언트에서 진단 결과 저장/조회 (localStorage)

import type { DiagnosisResult } from "./types";

const STORAGE_KEY = "haircare_diagnoses";

export function saveDiagnosis(result: DiagnosisResult): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  const list: DiagnosisResult[] = raw ? JSON.parse(raw) : [];
  list.unshift(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
}

export function getDiagnoses(): DiagnosisResult[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getDiagnosisById(id: string): DiagnosisResult | undefined {
  return getDiagnoses().find((d) => d.id === id);
}
