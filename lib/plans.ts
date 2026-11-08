/** 결제 플랜 상수 — 서버 컴포넌트(환불규정 등)와 클라이언트 양쪽에서 import 가능 (지시문 없음) */
/* ───────── 결제 플랜 ───────── */
export type PlanKey = "single" | "full";
export interface Plan { key: PlanKey; title: string; orderName: string; price: number; original?: number; badge?: string; desc: string; cta: string }
export const PLANS: Plan[] = [
  {
    key: "single", title: "선택 고민 정밀 단품 해금권", orderName: "운세로그 정밀 단품 해금권", price: 8900,
    desc: "선택한 1개 고민의 잠긴 인라인 키워드(결정적 달·귀인 성씨·물상·격국) 즉시 확인",
    cta: "8,900원 단품 결제하기",
  },
  {
    key: "full", title: "👑 2026-2027 VIP 종합 비책 풀패키지", orderName: "운세로그 VIP 종합 비책 풀패키지", price: 14900, original: 29900, badge: "BEST",
    desc: "모든 고민 키워드 + 24개월 타임라인 황금의 달/손재수의 달 + 귀인 성씨 초성 등 7대 비책 완전 해금",
    cta: "14,900원 얼리버드 결제하기",
  },
];
export const planOf = (key: string | null | undefined): Plan | undefined => PLANS.find((p) => p.key === key);
export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
