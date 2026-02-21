import type { ManagementGuide, Product, Expert, CommunityPost } from "./types";

export const STAGE_LABELS: Record<string, string> = {
  normal: "정상",
  caution: "주의",
  risk: "위험",
};

export const MANAGEMENT_GUIDES: ManagementGuide[] = [
  {
    stage: "normal",
    title: "건강한 두피 유지 가이드",
    items: [
      "규칙적인 두피 마사지로 혈액 순환 촉진",
      "균형 잡힌 식단 (단백질, 비타민, 무기질)",
      "스트레스 관리 및 충분한 수면",
      "적절한 샴푸 사용 및 두피 청결 유지",
    ],
  },
  {
    stage: "caution",
    title: "탈모 주의 단계 관리 가이드",
    items: [
      "두피 전문 케어 제품(샴푸·토닉) 사용 권장",
      "두피 마사지 루틴 (주 3~4회)",
      "탈모 예방 영양제 검토 (비오틴, 아연 등)",
      "3~6개월 후 재촬영으로 변화 추이 확인",
      "필요 시 전문가 상담 예약 권장",
    ],
  },
  {
    stage: "risk",
    title: "탈모 위험 단계 관리 가이드",
    items: [
      "가능한 빨리 탈모 전문의 상담 권장",
      "의료기기·처방 치료 옵션 검토",
      "두피 케어와 병행한 전문 관리",
      "정기적인 추적 촬영 및 기록 관리",
      "면책: 본 결과는 의료 진단이 아니며, 정확한 판단은 병원 진료를 받아 주세요.",
    ],
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "두피 케어 샴푸 A",
    category: "shampoo",
    description: "두피 순환 개선 및 모낭 강화에 도움을 주는 성분 함유.",
    priceRange: "2만원대",
    rating: 4.5,
    reviewCount: 320,
  },
  {
    id: "p2",
    name: "탈모 예방 토닉 B",
    category: "tonic",
    description: "캐필러리 확장 성분으로 두피 혈류 개선.",
    priceRange: "3~4만원",
    rating: 4.2,
    reviewCount: 180,
  },
  {
    id: "p3",
    name: "비오틴 영양제 C",
    category: "supplement",
    description: "모발·손톱 건강에 도움되는 비오틴 함유.",
    priceRange: "1만 5천원대",
    rating: 4.7,
    reviewCount: 520,
  },
  {
    id: "p4",
    name: "두피 마사지기 D",
    category: "other",
    description: "집에서 하는 두피 마사지로 혈액 순환 촉진.",
    priceRange: "5만원대",
    rating: 4.3,
    reviewCount: 95,
  },
];

export const MOCK_EXPERTS: Expert[] = [
  {
    id: "e1",
    name: "김○○ 원장",
    title: "탈모·모발이식 전문의",
    hospital: "○○탈모클리닉 서울",
    specialty: "남성형 탈모, 두피 진단",
    rating: 4.8,
    consultFee: "상담 3만원~",
  },
  {
    id: "e2",
    name: "이○○ 박사",
    title: "피부과 전문의",
    hospital: "△△피부과",
    specialty: "두피 질환, 탈모 치료",
    rating: 4.6,
    consultFee: "진료비 별도",
  },
];

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: "c1",
    authorId: "anon1",
    title: "탈모 초기인 것 같아 조언 부탁드려요",
    content: "최근 이마가 넓어진 것 같아 걱정입니다. 자가진단으로 주의 단계 나왔는데 다음에 뭘 해보면 좋을까요?",
    category: "question",
    createdAt: "2026-02-20T10:00:00Z",
    likeCount: 12,
    commentCount: 8,
  },
  {
    id: "c2",
    authorId: "anon2",
    title: "두피 마사지 3개월 해본 후기",
    content: "매일 5분씩 두피 마사지하고 샴푸 바꿨더니 두피가 덜 당기는 느낌이에요. 재촬영해보니 소폭 개선된 것 같아요.",
    category: "experience",
    createdAt: "2026-02-19T14:30:00Z",
    likeCount: 45,
    commentCount: 23,
  },
];
