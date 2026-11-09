"use client";

import { ChevronRight } from "lucide-react";
import type { ConcernKey } from "@/lib/saju";

export interface QuickCard { concern: ConcernKey; emoji: string; title: string; desc: string }

/** 홈 히어로 아래 4대 테마 질문형 카드 — 폼의 2차 심층 질문 4개 테마와 1:1. 클릭 시 테마 카드가 선택되고 폼으로 스크롤됩니다. */
export const QUICK_CARDS: QuickCard[] = [
  { concern: "love", emoji: "💔", title: "다시 이어질 인연일까?", desc: "인연이 움직이는 달 · 도화가 서는 달" },
  { concern: "shield", emoji: "💸", title: "내 돈은 어디서 새고 있을까?", desc: "손재수의 달 · 겁살·재살의 달 · 액막이 물상" },
  { concern: "career", emoji: "💼", title: "이직·퇴사, 지금 움직여도 될까?", desc: "계약서 서명 길일 · 귀인 성씨" },
  { concern: "wealth", emoji: "💰", title: "사업·투자, 지금 시작해도 될까?", desc: "편재가 터지는 달 · 동업자 성씨" },
];

export default function QuickCards({ active, onPick }: { active: ConcernKey | null; onPick: (c: ConcernKey) => void }) {
  return (
    <section aria-label="핵심 테마 바로 선택" className="animate-rise delay-3 mb-6">
      <p className="mb-3 break-keep text-center text-[11px] tracking-[0.3em] text-gold-2">지금 가장 풀리지 않는 질문 하나를 고르세요</p>
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
                <span className="block break-keep text-pretty text-[15px] font-bold leading-snug text-fg/90 group-hover:text-gold-light">{c.title}</span>
                <span className="mt-0.5 block break-keep text-xs leading-snug text-fg/50">
                  {c.desc.split(" · ").map((part, i) => <span key={part} className="inline-block">{i > 0 && <span className="mx-1 text-fg/30">·</span>}{part}</span>)}
                </span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-gold-2/60 transition group-hover:translate-x-0.5 group-hover:text-gold" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
