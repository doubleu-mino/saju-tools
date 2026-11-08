"use client";

import { ChevronRight } from "lucide-react";
import type { ConcernKey } from "@/lib/saju";

export interface QuickCard { concern: ConcernKey; emoji: string; title: string; desc: string }

/** 홈 히어로 아래 4대 핵심 고민 질문형 카드 — 클릭 시 폼의 고민 칩이 선택되고 폼으로 스크롤됩니다. */
export const QUICK_CARDS: QuickCard[] = [
  { concern: "reunion", emoji: "💔", title: "다시 이어질 인연일까?", desc: "재회 타이밍 · 상대 마음이 움직이는 달" },
  { concern: "debt", emoji: "💸", title: "내 돈은 어디서 터질까?", desc: "새는 돈 차단 · 손재수의 달 · 발복 업종" },
  { concern: "career", emoji: "💼", title: "이직·퇴사, 지금 움직여도 될까?", desc: "계약서 서명 길일 · 귀인 성씨" },
  { concern: "prime", emoji: "👑", title: "2027 정미년, 내 전성기는 언제인가?", desc: "대운 흐름 · 24개월 타임라인" },
];

export default function QuickCards({ active, onPick }: { active: ConcernKey | null; onPick: (c: ConcernKey) => void }) {
  return (
    <section aria-label="핵심 고민 바로 선택" className="animate-rise delay-3 mb-6">
      <p className="mb-3 text-center text-[11px] tracking-[0.3em] text-gold-2">지금 가장 풀리지 않는 질문 하나를 고르세요</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {QUICK_CARDS.map((c) => {
          const isActive = active === c.concern;
          return (
            <button
              key={c.concern}
              type="button"
              onClick={() => onPick(c.concern)}
              aria-pressed={isActive}
              className={`quick-card group ${isActive ? "is-active" : ""}`}
            >
              <span className="text-2xl leading-none" aria-hidden="true">{c.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold leading-snug text-fg/90 group-hover:text-gold-light">{c.title}</span>
                <span className="mt-0.5 block text-xs text-fg/50">{c.desc}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-gold-2/60 transition group-hover:translate-x-0.5 group-hover:text-gold" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
