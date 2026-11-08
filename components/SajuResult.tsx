"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Compass, Palette, Hash, Sparkles, Star, Gem, Lock, Unlock, CheckCircle2 } from "lucide-react";
import {
  SajuResult as SajuResultType, Pillar, ELEMENT_COLOR, ELEMENT_TEXT_ON, ELEMENT_HANJA, ELEMENT_DESC, REPORT_THEMES, ReportThemeKey, Element,
} from "@/lib/saju";
import { DAY_MASTER_PROFILES, buildThemeReport, buildTeaser, buildVipPreview, EXCESS_TEXT, LACK_TEXT, currentDaeun } from "@/lib/interpretations";
import ShareCard from "./ShareCard";
import VipModal from "./VipModal";

interface Props {
  result: SajuResultType;
  onReset: () => void;
}

function Glyph({ hanja, ko, element, yinYang, emphasize = false, god }: {
  hanja: string; ko: string; element: Element; yinYang: string; emphasize?: boolean; god?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative grid h-16 w-16 place-items-center rounded-xl text-4xl font-black shadow-inner sm:h-20 sm:w-20 sm:text-5xl ${emphasize ? "ring-4 ring-gold ring-offset-2 ring-offset-[#F1E7CF]" : ""}`}
        style={{ background: ELEMENT_COLOR[element], color: ELEMENT_TEXT_ON[element], fontFamily: "var(--font-hanja)" }}
      >
        {hanja}
        <span className="absolute right-1 top-0.5 text-[9px] font-semibold opacity-80">{yinYang}</span>
      </div>
      <span className="mt-1.5 text-xs font-semibold text-[#3a3022]">{ko}·{element}({ELEMENT_HANJA[element]})</span>
      {god && <span className="text-[10px] text-[#6b5a3c]">{god}</span>}
    </div>
  );
}

function PillarCard({ p, isDayMaster }: { p: Pillar; isDayMaster: boolean }) {
  return (
    <div className={`hanji animate-rise relative rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,.45)] sm:p-4 ${isDayMaster ? "ring-2 ring-gold" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.25em] text-[#6b5a3c]">{p.label}</span>
        {isDayMaster && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-on-gold">나의 本體</span>}
      </div>
      <div className="flex flex-col items-center gap-3">
        <Glyph hanja={p.stemHanja} ko={p.stemKo} element={p.stemElement} yinYang={p.stemYinYang} emphasize={isDayMaster} god={p.stemGod} />
        <div className="h-px w-10 bg-[#8c6d35]/40" />
        <Glyph hanja={p.branchHanja} ko={p.branchKo} element={p.branchElement} yinYang={p.branchYinYang} god={p.branchGod} />
      </div>
      <p className="mt-3 text-center text-sm font-bold tracking-widest text-[#2a2419]" style={{ fontFamily: "var(--font-hanja)" }}>{p.ganzhi}</p>
    </div>
  );
}

function Section({ no, title, sub, children }: { no: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="card ornament animate-rise rounded-2xl p-5 sm:p-8">
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.35em] text-gold-2">PART {no}</p>
        <h3 className="gold-text mt-1 text-xl font-black sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm text-fg/55">{sub}</p>
      </div>
      {children}
    </section>
  );
}

export default function SajuResult({ result: r, onReset }: Props) {
  const profile = DAY_MASTER_PROFILES[r.dayMaster.stem];
  const life = buildThemeReport(r, "life");
  const who = r.name ? `${r.name}님` : "당신";
  const cur = currentDaeun(r);
  const displayPillars = [...r.pillars].reverse(); // 시·일·월·연 (전통 표기 순)

  // 2단계: 테마별 탭 (입력 시 관심 테마가 있었다면 그 탭을 먼저 펼침)
  const initialTab: ReportThemeKey = r.input.theme === "life" ? "wealth" : r.input.theme;
  const [tab, setTab] = useState<ReportThemeKey>(initialTab);
  const [vipOpen, setVipOpen] = useState(false);
  const tabMeta = REPORT_THEMES.find((t) => t.key === tab)!;
  const tabReport = useMemo(() => buildThemeReport(r, tab), [r, tab]);
  const teaser = useMemo(() => buildTeaser(r, tab), [r, tab]);
  const vipPreview = useMemo(() => buildVipPreview(r, tab), [r, tab]);

  return (
    <div className="space-y-6">
      {/* 요약 헤더 */}
      <div className="card ornament animate-rise rounded-2xl p-5 text-center sm:p-8">
        <p className="text-[11px] tracking-[0.35em] text-gold-2">{r.input.gender === "male" ? "乾命" : "坤命"} · {r.zodiac}띠</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
          <span className="gold-text">{who}의 사주 원국</span>
        </h2>
        <p className="mt-2 text-sm text-fg/65">
          양력 {r.solar.year}.{String(r.solar.month).padStart(2, "0")}.{String(r.solar.day).padStart(2, "0")}
          <span className="mx-2 text-gold-2/50">|</span>
          음력 {r.lunar.year}.{r.lunar.isLeap ? "윤" : ""}{String(r.lunar.month).padStart(2, "0")}.{String(r.lunar.day).padStart(2, "0")}
          <span className="mx-2 text-gold-2/50">|</span>
          {r.hourKnown ? `${r.pillars[3].branchKo}시생` : "시간 모름"}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px]">
          <span className="rounded-full border border-gold-2/30 bg-ink/60 px-3 py-1 text-fg/75">
            {r.corrections.regionLabel} 진태양시 {r.corrections.regionOffsetMin}분 보정
          </span>
          {r.corrections.dstApplied && (
            <span className="rounded-full border border-gold/60 bg-gold/15 px-3 py-1 font-semibold text-gold-light">☀ 서머타임 −60분 자동 보정</span>
          )}
          {r.corrections.utc830Era && (
            <span className="rounded-full border border-gold/60 bg-gold/15 px-3 py-1 font-semibold text-gold-light">동경 127.5° 표준시 +30분 보정</span>
          )}
          <span className="rounded-full border border-gold-2/30 bg-ink/60 px-3 py-1 text-fg/75">
            보정 시각 {r.corrections.trueSolarTime}
          </span>
        </div>
      </div>

      {/* PART 1 */}
      <Section no="01" title="사주원국(四柱原局) 8글자 패(牌)" sub="오른쪽에서 왼쪽으로 연·월·일·시. 윗줄이 천간(天干), 아랫줄이 지지(地支)입니다.">
        <div className={`grid gap-3 sm:gap-4 ${r.hourKnown ? "grid-cols-4" : "grid-cols-3"}`}>
          {displayPillars.map((p) => <PillarCard key={p.key} p={p} isDayMaster={p.key === "day"} />)}
        </div>
        <div className="mt-6 grid gap-3 rounded-xl border border-gold-2/25 bg-ink/50 p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[11px] tracking-wider text-gold-2">일간 (나의 본원)</p>
            <p className="mt-1 text-lg font-bold">
              <span style={{ color: ELEMENT_COLOR[r.dayMaster.element] === "#3F4F73" ? "var(--water-text)" : ELEMENT_COLOR[r.dayMaster.element] }}>{r.dayMaster.hanja}</span>{" "}
              {r.dayMaster.title} · {r.dayMaster.yinYang}
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-gold-2">일주 (日柱)</p>
            <p className="mt-1 text-lg font-bold">{r.pillars[2].ganzhi} <span className="text-sm font-normal text-fg/60">{r.pillars[2].stemKo}{r.pillars[2].branchKo}일주</span></p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-gold-2">신강·신약</p>
            <p className="mt-1 text-lg font-bold">{r.strength.label}</p>
          </div>
        </div>
        {!r.hourKnown && (
          <p className="mt-3 text-xs text-fg/45">※ 출생 시간을 모르는 경우 시주를 제외한 6글자로 분석합니다. 시간을 알게 되면 더 정밀한 풀이가 가능합니다.</p>
        )}
      </Section>

      {/* PART 2 */}
      <Section no="02" title="오행 밸런스 분석" sub={`${r.hourKnown ? 8 : 6}글자에 담긴 목·화·토·금·수 다섯 기운의 분포`}>
        <div className="space-y-4">
          {r.elements.map((e) => (
            <div key={e.element}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md text-sm font-black" style={{ background: ELEMENT_COLOR[e.element], color: ELEMENT_TEXT_ON[e.element] }}>{ELEMENT_HANJA[e.element]}</span>
                  <span className="font-semibold">{e.element}</span>
                  <span className="text-xs text-fg/45">{ELEMENT_DESC[e.element]}</span>
                </span>
                <span className="tabular-nums text-fg/80">{e.count}개 · {e.percent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-ink/70 ring-1 ring-gold-2/20">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(e.percent, e.count ? 6 : 0)}%`, background: `linear-gradient(90deg, ${ELEMENT_COLOR[e.element]}, ${ELEMENT_COLOR[e.element]}cc)` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gold-2/25 bg-ink/50 p-4">
            <p className="text-[11px] tracking-wider text-gold-2">가장 강한 기운 (과다)</p>
            <p className="mt-1 text-xl font-black" style={{ color: r.strongest === "수" ? "var(--water-text)" : ELEMENT_COLOR[r.strongest] }}>{r.strongest}({ELEMENT_HANJA[r.strongest]})</p>
            <p className="mt-2 text-sm leading-relaxed text-fg/75">{EXCESS_TEXT[r.strongest]}</p>
          </div>
          <div className="rounded-xl border border-gold-2/25 bg-ink/50 p-4">
            <p className="text-[11px] tracking-wider text-gold-2">부족한 기운 (결핍)</p>
            <p className="mt-1 text-xl font-black" style={{ color: r.weakest === "수" ? "var(--water-text)" : ELEMENT_COLOR[r.weakest] }}>
              {r.missing.length ? r.missing.map((m) => `${m}(${ELEMENT_HANJA[m]})`).join(" · ") : `${r.weakest}(${ELEMENT_HANJA[r.weakest]})`}
              <span className="ml-2 text-xs font-normal text-fg/50">{r.missing.length ? "원국에 없음" : "가장 약함"}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-fg/75">{LACK_TEXT[r.missing[0] ?? r.weakest]}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-gold-2/15 bg-ink/30 p-4 text-sm">
          <p className="mb-2 text-[11px] tracking-wider text-gold-2">십성(十星) 분포 · 일간 기준</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(r.tenGodCounts) as [string, number][]).map(([k, v]) => (
              <span key={k} className="rounded-full border border-gold-2/25 px-3 py-1 text-fg/80">{k} <b className="text-gold">{v}</b></span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-fg/55">{r.strength.note}</p>
        </div>
      </Section>

      {/* PART 3 */}
      <Section no="03" title="나를 상징하는 본성과 기질" sub={`일간 ${profile.title} — ${profile.symbol}`}>
        <div className="flex flex-wrap gap-2">
          {profile.keyword.map((k) => <span key={k} className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold-light ring-1 ring-gold/30">#{k}</span>)}
        </div>
        <div className="mt-5 space-y-5 text-[15px] leading-[1.9] text-fg/85">
          <p>{profile.nature}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#2F9E8F]/30 bg-[#2F9E8F]/5 p-4"><p className="mb-1 text-xs tracking-wider text-wood-text">강점</p><p className="text-sm leading-relaxed">{profile.strength}</p></div>
            <div className="rounded-xl border border-[#C2413B]/30 bg-[#C2413B]/5 p-4"><p className="mb-1 text-xs tracking-wider text-fire-text">주의</p><p className="text-sm leading-relaxed">{profile.caution}</p></div>
            <div className="rounded-xl border border-[#C08A3E]/30 bg-[#C08A3E]/5 p-4"><p className="mb-1 text-xs tracking-wider text-earth-text">대인관계</p><p className="text-sm leading-relaxed">{profile.relation}</p></div>
            <div className="rounded-xl border border-[#C9CFD6]/30 bg-[#C9CFD6]/5 p-4"><p className="mb-1 text-xs tracking-wider text-metal-text">일과 재능</p><p className="text-sm leading-relaxed">{profile.work}</p></div>
          </div>
        </div>
      </Section>

      {/* PART 4 — 1단계 무료 완전 공개: 인생 종합 총운 */}
      <Section no="04" title={`📜 ${who}의 인생 종합 총운`} sub={life.summary}>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 text-gold">
            {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill={i < life.score ? "currentColor" : "none"} className={i < life.score ? "" : "opacity-30"} />)}
            <span className="ml-2 text-xs text-fg/50">기운 적합도 {life.score}/5</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-wood/40 bg-wood/10 px-2.5 py-0.5 text-[11px] font-semibold text-wood-text">
            <Unlock size={11} /> 무료 전문 공개
          </span>
        </div>
        <div className="space-y-5">
          {life.sections.map((s) => (
            <div key={s.heading} className="border-l-2 border-gold-2/50 pl-4">
              <h4 className="font-bold text-gold-light">{s.heading}</h4>
              <p className="mt-1.5 text-[15px] leading-[1.9] text-fg/85">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <p className="mb-3 text-[11px] tracking-wider text-gold-2">대운(大運) 흐름표 · {r.daeun.startAge}세 {r.daeun.forward ? "순행" : "역행"}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
            {r.daeun.items.map((d) => {
              const active = cur?.startAge === d.startAge;
              return (
                <div key={d.startAge} className={`rounded-lg border p-2 text-center ${active ? "border-gold bg-gold/15" : "border-gold-2/20 bg-ink/50"}`}>
                  <p className="text-[10px] text-fg/55">{d.startAge}세~</p>
                  <p className="text-lg font-black" style={{ fontFamily: "var(--font-hanja)" }}>
                    <span style={{ color: d.stemElement === "수" ? "var(--water-text)" : ELEMENT_COLOR[d.stemElement] }}>{d.ganzhi[0]}</span>
                    <span style={{ color: d.branchElement === "수" ? "var(--water-text)" : ELEMENT_COLOR[d.branchElement] }}>{d.ganzhi[1]}</span>
                  </p>
                  <p className="text-[10px] text-fg/55">{d.stemGod}·{d.branchGod}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 처방전 */}
        <div className="hanji mt-7 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-[#8c6d35]" />
            <h4 className="text-lg font-black text-[#2a2419]">행운 처방전 — {life.remedy.element}({ELEMENT_HANJA[life.remedy.element]})의 기운을 채우세요</h4>
          </div>
          <p className="mt-1 text-sm text-[#6b5a3c]">{life.remedyReason}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/50 p-3">
              <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Palette size={12} /> 행운의 색상</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full ring-2 ring-white" style={{ background: ELEMENT_COLOR[life.remedy.element] }} />
                <span className="text-sm font-semibold text-[#2a2419]">{life.remedy.colors.join(" · ")}</span>
              </div>
            </div>
            <div className="rounded-xl bg-white/50 p-3">
              <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Hash size={12} /> 행운의 숫자</p>
              <p className="mt-2 text-2xl font-black text-[#2a2419]">{life.remedy.numbers.join(" · ")}</p>
            </div>
            <div className="rounded-xl bg-white/50 p-3">
              <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Compass size={12} /> 행운의 방위</p>
              <p className="mt-2 text-lg font-black text-[#2a2419]">{life.remedy.direction}</p>
              <p className="text-xs text-[#6b5a3c]">기운이 깊어지는 계절 · {life.remedy.season}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-white/50 p-3 text-sm text-[#2a2419]">
            <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Sparkles size={12} /> 생활 속 처방</p>
            <p className="mt-1.5"><b>가까이 둘 것:</b> {life.remedy.items.join(", ")}</p>
            <p className="mt-1">{life.remedy.habits}</p>
          </div>
        </div>
      </Section>

      {/* PART 5 — 2단계 테마별 탭 + 3단계 VIP 잠금 */}
      <Section no="05" title="테마별 심층 리포트" sub="궁금한 운세를 선택하세요. 핵심 3줄은 무료, 2026–2027 심층 비책 전문은 VIP 리포트로 제공됩니다.">
        {/* 탭 */}
        <div role="tablist" aria-label="테마별 리포트" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {REPORT_THEMES.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`theme-panel-${t.key}`}
                id={`theme-tab-${t.key}`}
                onClick={() => setTab(t.key)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-gold bg-gold/15 text-gold-light shadow-[inset_0_0_12px_rgba(229,184,105,.15)]"
                    : "border-gold-2/25 bg-ink/60 text-fg/70 hover:border-gold-2/60"
                }`}
              >
                <span className="mr-1.5">{t.emoji}</span>{t.label}
              </button>
            );
          })}
        </div>

        {/* 맛보기 3줄 (무료) */}
        <div key={tab} id={`theme-panel-${tab}`} role="tabpanel" aria-labelledby={`theme-tab-${tab}`} className="animate-rise mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-lg font-black text-gold-light">{tabMeta.emoji} {tabReport.title}</h4>
            <span className="inline-flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < tabReport.score ? "currentColor" : "none"} className={i < tabReport.score ? "" : "opacity-30"} />)}
              <span className="ml-1.5 text-[11px] text-fg/50">{tabReport.score}/5</span>
            </span>
          </div>
          <p className="mt-1.5 text-sm text-fg/60">{tabReport.summary}</p>

          <div className="mt-4 rounded-xl border border-gold-2/25 bg-ink/50 p-4 sm:p-5">
            <p className="mb-3 text-[11px] tracking-wider text-gold-2">핵심 3줄 맛보기 · 무료</p>
            <ol className="space-y-3">
              {teaser.map((line, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-fg/85">
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-gold" />
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* VIP 블러 미리보기 + 잠금 */}
          <div className="relative mt-4 overflow-hidden rounded-xl border border-gold/40 bg-ink/40">
            <div className="vip-blur space-y-4 p-5 text-[15px] leading-[1.9] text-fg/80 sm:p-6" aria-hidden="true">
              <p className="text-[11px] tracking-wider text-gold-2">2026–2027 VIP 심층 비책 · {tabMeta.label}</p>
              {vipPreview.map((para, i) => <p key={i}>{para}</p>)}
            </div>
            <div className="vip-fade absolute inset-0" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 bg-ink/80 text-gold shadow-[0_0_24px_rgba(229,184,105,.25)]">
                <Lock size={22} />
              </span>
              <p className="text-xs text-fg/70">본문 {vipPreview.length}문단 · 월별 길흉표 · 12개월 실천 처방 포함</p>
              <button
                type="button"
                onClick={() => setVipOpen(true)}
                className="animate-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-2 px-5 py-3 text-sm font-bold text-on-gold shadow-[0_8px_30px_rgba(229,184,105,.3)] transition hover:brightness-110 active:scale-[.99] sm:text-base"
              >
                <Lock size={16} /> 2026-2027 VIP 사주 심층 비책 전문 열람하기
              </button>
              <p className="text-[11px] text-gold-2">사전 예약 시 얼리버드 50% 할인</p>
            </div>
          </div>
        </div>
      </Section>

      {/* PART 6 */}
      <Section no="06" title="카카오톡 · SNS 공유 카드" sub="나의 사주 8글자 패를 이미지로 저장하거나 친구에게 공유해 보세요.">
        <ShareCard result={r} />
      </Section>

      <VipModal open={vipOpen} onClose={() => setVipOpen(false)} themeLabel={tabMeta.label} />

      <div className="flex justify-center pt-2">
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-gold-2/40 px-6 py-3 text-sm text-gold transition hover:bg-gold/10">
          <RotateCcw size={16} /> 다른 사주 보기
        </button>
      </div>
    </div>
  );
}
