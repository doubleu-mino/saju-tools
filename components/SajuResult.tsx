"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Compass, Palette, Hash, Sparkles, Star, Gem, Lock, Unlock, Crown, Flame, ChevronRight, Target, ShieldAlert } from "lucide-react";
import {
  SajuResult as SajuResultType, Pillar, ELEMENT_COLOR, ELEMENT_TEXT_ON, ELEMENT_HANJA, ELEMENT_DESC, Element,
} from "@/lib/saju";
import { DAY_MASTER_PROFILES, buildThemeReport, EXCESS_TEXT, LACK_TEXT, currentDaeun } from "@/lib/interpretations";
import { buildPinpoint, TIER_META, yearGodSummary, MonthCard, YearTimeline } from "@/lib/pinpoint";
import ShareCard from "./ShareCard";
import VipModal from "./VipModal";
import { LockedText, LockClick } from "./InlineLock";

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

  // 핀포인트 리포트 (고민·절대 기운 × 2026·2027 세운 × 12신살)
  const pin = useMemo(() => buildPinpoint(r), [r]);
  const y26 = useMemo(() => yearGodSummary(r, 2026), [r]);
  const y27 = useMemo(() => yearGodSummary(r, 2027), [r]);
  const [calYear, setCalYear] = useState<2026 | 2027>(2026);
  const timeline = pin.timelines.find((t) => t.year === calYear) ?? pin.timelines[0];

  // VIP 모달 (자물쇠 클릭 시 어떤 항목을 눌렀는지 전달)
  const [vipOpen, setVipOpen] = useState(false);
  const [lockHint, setLockHint] = useState<string | null>(null);
  const openVip = (c?: LockClick | string) => {
    setLockHint(typeof c === "string" ? c : c?.hint ?? null);
    setVipOpen(true);
  };

  // 하단 고정 CTA — 원국 패를 지나 스크롤하면 등장
  const [showCta, setShowCta] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowCta(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="space-y-6 pb-24 sm:pb-20">
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

      {/* PART 5 — 선택한 고민 심층 타겟 리포트 (인라인 키워드 락) */}
      <Section no="05" title={`${pin.concern.emoji} ${pin.concernTitle}`} sub={pin.concernSummary}>
        {/* 세운 뱃지 */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/15 px-2.5 py-1 font-semibold text-gold-light"><Target size={11} /> 선택한 고민 · {pin.concern.short}</span>
          <span className="rounded-full border border-gold-2/30 bg-ink/60 px-2.5 py-1 text-fg/75">2026 {y26.ko}({y26.ganzhi}) · {y26.stemGod}/{y26.branchGod}</span>
          <span className="rounded-full border border-gold-2/30 bg-ink/60 px-2.5 py-1 text-fg/75">2027 {y27.ko}({y27.ganzhi}) · {y27.stemGod}/{y27.branchGod}</span>
          <span className="rounded-full border border-gold-2/30 bg-ink/60 px-2.5 py-1 text-fg/75">용신 {pin.benefactor.yong}({ELEMENT_HANJA[pin.benefactor.yong]}) · 희신 {pin.benefactor.hui}({ELEMENT_HANJA[pin.benefactor.hui]})</span>
        </div>

        <div className="space-y-6">
          {pin.concernParas.map((para, i) => (
            <div key={i} className="border-l-2 border-gold-2/50 pl-4">
              <h4 className="font-bold text-gold-light">{para.heading}</h4>
              <p className="mt-1.5 text-[15px] leading-[2.05] text-fg/85">
                <LockedText segments={para.segments} onUnlock={openVip} />
              </p>
            </div>
          ))}
        </div>

        {/* 절대 기운 */}
        <div className="mt-7 rounded-2xl border border-gold/30 bg-gold/5 p-4 sm:p-5">
          <p className="flex items-center gap-1.5 text-[11px] tracking-[0.3em] text-gold-2"><Flame size={12} /> 끌어당기고 싶은 절대 기운 · {pin.wish.short}</p>
          {pin.wishParas.map((para) => (
            <div key={para.heading} className="mt-3">
              <h4 className="font-bold text-gold-light">{para.heading}</h4>
              <p className="mt-1.5 text-[15px] leading-[2.05] text-fg/85">
                <LockedText segments={para.segments} onUnlock={openVip} />
              </p>
            </div>
          ))}
        </div>

        {/* 재벌가 비전 간명식 요약 카드 */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => openVip("?씨 성")} className="group rounded-xl border border-gold-2/25 bg-ink/50 p-4 text-left transition hover:border-gold/60">
            <p className="text-[11px] tracking-wider text-gold-2">재벌가 비전 간명식 · 귀인 성씨 초성</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-black text-gold-light">
              <span className="inline-lock"><Lock size={11} /> ?/? 초성</span>
              <span className="inline-lock"><Lock size={11} /> ?/? 초성</span>
            </p>
            <p className="mt-1.5 text-xs text-fg/50">용신·희신 소리오행으로 산출 · 천을귀인 {pin.benefactor.zodiacs.join("·")}띠</p>
          </button>
          <button type="button" onClick={() => openVip("??? 물상")} className="group rounded-xl border border-gold-2/25 bg-ink/50 p-4 text-left transition hover:border-gold/60">
            <p className="text-[11px] tracking-wider text-gold-2">삼재·관살·손재수 무력화 비책</p>
            <p className="mt-2 text-lg font-black text-gold-light">
              보완 오행 <span style={{ color: pin.remedy.element === "수" ? "var(--water-text)" : ELEMENT_COLOR[pin.remedy.element] }}>{pin.remedy.element}({ELEMENT_HANJA[pin.remedy.element]})</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-fg/50">물상 <span className="inline-lock"><Lock size={11} /> ???</span> · 방위 <span className="inline-lock"><Lock size={11} /> ?쪽</span></p>
          </button>
          <button type="button" onClick={() => openVip("???격")} className="group rounded-xl border border-gold-2/25 bg-ink/50 p-4 text-left transition hover:border-gold/60">
            <p className="text-[11px] tracking-wider text-gold-2">격국(格局) · 월지 {r.pillars[1].branchHanja} 기준</p>
            <p className="mt-2 text-lg font-black text-gold-light"><span className="inline-lock"><Lock size={11} /> ???격</span></p>
            <p className="mt-1.5 text-xs text-fg/50">{r.strength.label} · 월지 {r.pillars[1].branchGod} 투출 여부로 판정</p>
          </button>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-fg/40"><ShieldAlert size={12} className="mt-0.5 shrink-0" /> 월운은 절입일(매월 4~8일) 기준 월건으로 산출되며, 달력 월과 수일의 차이가 있을 수 있습니다. 자물쇠 항목은 VIP 간명 해금 시 공개됩니다.</p>
      </Section>

      {/* PART 6 — 12개월 운세 캘린더 타임라인 */}
      <Section no="06" title="2026–2027 12개월 운세 캘린더 타임라인" sub="10개 월의 기운은 공개하고, 운기 최정점 '황금의 달' 1곳과 각별 주의 '손재수의 달' 1곳은 VIP 황금 자물쇠로 잠겨 있습니다.">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="연도 선택" className="inline-flex rounded-xl border border-gold-2/30 bg-ink/60 p-1">
            {pin.timelines.map((t) => (
              <button
                key={t.year}
                role="tab"
                type="button"
                aria-selected={calYear === t.year}
                onClick={() => setCalYear(t.year as 2026 | 2027)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${calYear === t.year ? "bg-gold/20 text-gold-light shadow-[inset_0_0_10px_rgba(229,184,105,.15)]" : "text-fg/60 hover:text-fg"}`}
              >
                {t.year} {t.ko}({t.ganzhi})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {timeline.samjae && <span className="rounded-full border border-[#C2413B]/50 bg-[#C2413B]/10 px-2.5 py-1 font-semibold text-fire-text">{r.zodiac}띠 {timeline.samjae}</span>}
            {(["opportunity", "rising", "calm"] as const).map((k) => (
              <span key={k} className="rounded-full border border-gold-2/25 bg-ink/50 px-2.5 py-1 text-fg/65">{TIER_META[k].emoji} {TIER_META[k].label}</span>
            ))}
            <span className="rounded-full border border-gold/60 bg-gold/15 px-2.5 py-1 font-semibold text-gold-light"><Lock size={10} className="mr-0.5 inline" /> VIP 열람 2곳</span>
          </div>
        </div>

        <div key={calYear} className="animate-rise grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {timeline.months.map((m) => <MonthTile key={m.month} m={m} t={timeline} onUnlock={openVip} />)}
        </div>

        <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
          <p className="leading-relaxed text-fg/80">
            <Crown size={14} className="mr-1 inline text-gold" />
            잠긴 두 달 중 하나는 {r.name ? `${r.name}님` : "당신"}의 <b className="text-gold-light">운기 최정점 황금의 달</b>, 다른 하나는 <b className="text-fire-text">각별 주의 손재수의 달</b>입니다. 기운이 화합하는 시기를 아는 것이 한 해 발복 확률을 극대화하는 핵심입니다.
          </p>
          <button type="button" onClick={() => openVip("VIP 열람")} className="mt-3 inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-2 px-4 py-2.5 text-sm font-bold text-on-gold transition hover:brightness-110 sm:mt-0">
            <Lock size={14} /> 두 달 즉시 해금 <ChevronRight size={14} />
          </button>
        </div>
      </Section>

      {/* PART 7 */}
      <Section no="07" title="인스타 스토리 · 카카오톡 공유 카드" sub="나의 본원과 수호 동물, 사주 8글자 패를 9:16 스토리 규격 카드로 저장하거나 친구에게 공유해 보세요.">
        <ShareCard result={r} />
      </Section>

      <VipModal open={vipOpen} onClose={() => setVipOpen(false)} themeLabel={pin.concern.short} lockHint={lockHint} lockCount={pin.lockCount} />

      <div className="flex justify-center pt-2">
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-gold-2/40 px-6 py-3 text-sm text-gold transition hover:bg-gold/10">
          <RotateCcw size={16} /> 다른 사주 보기
        </button>
      </div>

      {/* 하단 고정 CTA 배너 */}
      {showCta && !vipOpen && (
        <div className="sticky-cta fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4" role="region" aria-label="VIP 해금 안내">
          <div className="mx-auto max-w-3xl">
            <button
              type="button"
              onClick={() => openVip("7가지 VIP 비책")}
              className="sticky-cta__btn flex w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-left text-sm font-bold text-on-gold shadow-[0_-4px_30px_rgba(229,184,105,.35),0_10px_30px_rgba(0,0,0,.35)] transition hover:brightness-110 active:scale-[.99] sm:text-[15px]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/15"><Lock size={16} /></span>
              <span className="flex-1 leading-tight">
                내 사주의 막힌 운을 뚫는 <u className="decoration-2 underline-offset-2">7가지 VIP 비책</u> &amp; 황금의 달 즉시 해금
                <span className="mt-0.5 block text-[11px] font-semibold opacity-80">잠긴 항목 {pin.lockCount}곳 · 런칭 특가 14,900원 (정가 29,900원)</span>
              </span>
              <ChevronRight size={18} className="shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── 월운 타일 ───────────────────────── */

function MonthTile({ m, t, onUnlock }: { m: MonthCard; t: YearTimeline; onUnlock: (hint: string) => void }) {
  const locked = m.tier === "golden" || m.tier === "danger";
  const meta = TIER_META[m.tier];
  if (locked) {
    return (
      <button
        type="button"
        onClick={() => onUnlock(`${t.year}년 ??월 · VIP 열람`)}
        className="gold-lock-card group relative flex min-h-[132px] flex-col items-center justify-center rounded-xl p-3 text-center transition hover:brightness-110"
        aria-label={`${m.month}월 — VIP 열람 필요`}
      >
        <span className="absolute left-2.5 top-2 text-[11px] font-bold tracking-wider text-gold-light/80">{m.month}월</span>
        <span className="gold-lock-icon grid h-11 w-11 place-items-center rounded-full border border-gold/60 bg-gold/15 text-gold">
          <Lock size={20} />
        </span>
        <span className="mt-2 text-xs font-bold text-gold-light">🔒 VIP 열람</span>
        <span className="mt-0.5 text-[10px] leading-tight text-fg/55">황금의 달 or 손재수의 달</span>
      </button>
    );
  }
  const tone = m.tier === "opportunity" ? "border-wood/40 bg-wood/10" : m.tier === "rising" ? "border-gold-2/35 bg-gold/5" : "border-gold-2/20 bg-ink/50";
  return (
    <div className={`flex min-h-[132px] flex-col rounded-xl border p-3 ${tone}`}>
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-bold text-fg/90">{m.month}월</span>
        <span className="text-base font-black tracking-wider" style={{ fontFamily: "var(--font-hanja)" }}>
          <span style={{ color: m.stemElement === "수" ? "var(--water-text)" : ELEMENT_COLOR[m.stemElement] }}>{m.ganzhi[0]}</span>
          <span style={{ color: m.branchElement === "수" ? "var(--water-text)" : ELEMENT_COLOR[m.branchElement] }}>{m.ganzhi[1]}</span>
        </span>
      </div>
      <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.tier === "opportunity" ? "bg-wood/20 text-wood-text" : m.tier === "rising" ? "bg-gold/15 text-gold-light" : "bg-fg/10 text-fg/65"}`}>
        {meta.emoji} {meta.label}
      </span>
      <p className="mt-2 text-[11px] leading-snug text-fg/65">{m.keyword}</p>
      <p className="mt-auto pt-2 text-[10px] text-fg/40">{m.stemGod}·{m.branchGod} · {m.shinsal}</p>
    </div>
  );
}
