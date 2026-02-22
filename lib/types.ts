// AI 기반 탈모 자가진단 플랫폼 - 공통 타입

export type DiagnosisStage = "normal" | "caution" | "risk";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface DiagnosisResult {
  id: string;
  userId: string;
  stage: DiagnosisStage;
  confidence: number; // 0~1
  createdAt: string;
  crownImageUrl?: string;
  hairlineImageUrl?: string;
  summary: string;
  guideSummary: string;
}

export interface ManagementGuide {
  stage: DiagnosisStage;
  title: string;
  items: string[];
}

export interface Product {
  id: string;
  name: string;
  category: "shampoo" | "tonic" | "supplement" | "other";
  description: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  affiliateUrl?: string;
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  hospital: string;
  specialty: string;
  rating: number;
  consultFee?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string; // 익명이면 익명 ID
  title: string;
  content: string;
  category: "question" | "info" | "experience";
  createdAt: string;
  likeCount: number;
  commentCount: number;
}
