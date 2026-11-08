"use client";

import { RotateCcw, Compass, Palette, Hash, Sparkles, Star, Gem } from "lucide-react";
import {
  SajuResult as SajuResultType, Pillar, ELEMENT_COLOR, ELEMENT_TEXT_ON, ELEMENT_HANJA, ELEMENT_DESC, THEMES, Element,
} from "@/lib/saju";
import { DAY_MASTER_PROFILES, buildThemeReport, EXCESS_TEXT, LACK_TEXT, currentDaeun } from "@/lib/interpretations";
import ShareCard from "./ShareCard";

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
        className={`relative grid h-16 w-16 place-items-center rounded-xl text-4xl font-black shadow-inner sm:h-20 sm:w-20 sm:text-5xl ${emphasize ? "ring-4 ring-[#E5B869] ring-offset-2 ring-offset-[#F1E7CF]" : ""}`}
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
    <div className={`hanji animate-rise relative rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,.45)] sm:p-4 ${isDayMaster ? "ring-2 ring-[#E5B869]" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.25em] text-[#6b5a3c]">{p.label}</span>
        {isDayMaster && <span className="rounded-full bg-[#E5B869] px-2 py-0.5 text-[10px] font-bold text-[#0B0F19]">나의 本體</span>}
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
        <p className="text-[11px] tracking-[0.35em] text-[#C5A059]">PART {no}</p>
        <h3 className="gold-text mt-1 text-xl font-black sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm text-[#EFE6D2]/55">{sub}</p>
      </div>
      {children}
    </section>
  );
}

export default function SajuResult({ result: r, onReset }: Props) {
  const profile = DAY_MASTER_PROFILES[r.dayMaster.stem];
  const report = buildThemeReport(r);
  const theme = THEMES.find((t) => t.key === r.input.theme)!;
  const who = r.name ? `${r.name}님` : "당신";
  const cur = currentDaeun(r);
  const displayPillars = [...r.pillars].reverse(); // 시·일·월·연 (전통 표기 순)

  return (
    <div className="space-y-6">
      {/* 요약 헤더 */}
      <div className="card ornament animate-rise rounded-2xl p-5 text-center sm:p-8">
        <p className="text-[11px] tracking-[0.35em] text-[#C5A059]">{r.input.gender === "male" ? "乾命" : "坤命"} · {r.zodiac}띠</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
          <span className="gold-text">{who}의 사주 원국</span>
        </h2>
        <p className="mt-2 text-sm text-[#EFE6D2]/65">
          양력 {r.solar.year}.{String(r.solar.month).padStart(2, "0")}.{String(r.solar.day).padStart(2, "0")}
          <span className="mx-2 text-[#C5A059]/50">|</span>
          음력 {r.lunar.year}.{r.lunar.isLeap ? "윤" : ""}{String(r.lunar.month).padStart(2, "0")}.{String(r.lunar.day).padStart(2, "0")}
          <span className="mx-2 text-[#C5A059]/50">|</span>
          {r.hourKnown ? `${r.pillars[3].branchKo}시생` : "시간 모름"}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px]">
          <span className="rounded-full border border-[#C5A059]/30 bg-[#0B0F19]/60 px-3 py-1 text-[#EFE6D2]/75">
            {r.corrections.regionLabel} 진태양시 {r.corrections.regionOffsetMin}분 보정
          </span>
          {r.corrections.dstApplied && (
            <span className="rounded-full border border-[#E5B869]/60 bg-[#E5B869]/15 px-3 py-1 font-semibold text-[#F3DFAE]">☀ 서머타임 −60분 자동 보정</span>
          )}
          {r.corrections.utc830Era && (
            <span className="rounded-full border border-[#E5B869]/60 bg-[#E5B869]/15 px-3 py-1 font-semibold text-[#F3DFAE]">동경 127.5° 표준시 +30분 보정</span>
          )}
          <span className="rounded-full border border-[#C5A059]/30 bg-[#0B0F19]/60 px-3 py-1 text-[#EFE6D2]/75">
            보정 시각 {r.corrections.trueSolarTime}
          </span>
        </div>
      </div>

      {/* PART 1 */}
      <Section no="01" title="사주원국(四柱原局) 8글자 패(牌)" sub="오른쪽에서 왼쪽으로 연·월·일·시. 윗줄이 천간(天干), 아랫줄이 지지(地支)입니다.">
        <div className={`grid gap-3 sm:gap-4 ${r.hourKnown ? "grid-cols-4" : "grid-cols-3"}`}>
          {displayPillars.map((p) => <PillarCard key={p.key} p={p} isDayMaster={p.key === "day"} />)}
        </div>
        <div className="mt-6 grid gap-3 rounded-xl border border-[#C5A059]/25 bg-[#0B0F19]/50 p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[11px] tracking-wider text-[#C5A059]">일간 (나의 본원)</p>
            <p className="mt-1 text-lg font-bold">
              <span style={{ color: ELEMENT_COLOR[r.dayMaster.element] === "#3F4F73" ? "#9FB0DA" : ELEMENT_COLOR[r.dayMaster.element] }}>{r.dayMaster.hanja}</span>{" "}
              {r.dayMaster.title} · {r.dayMaster.yinYang}
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-[#C5A059]">일주 (日柱)</p>
            <p className="mt-1 text-lg font-bold">{r.pillars[2].ganzhi} <span className="text-sm font-normal text-[#EFE6D2]/60">{r.pillars[2].stemKo}{r.pillars[2].branchKo}일주</span></p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-[#C5A059]">신강·신약</p>
            <p className="mt-1 text-lg font-bold">{r.strength.label}</p>
          </div>
        </div>
        {!r.hourKnown && (
          <p className="mt-3 text-xs text-[#EFE6D2]/45">※ 출생 시간을 모르는 경우 시주를 제외한 6글자로 분석합니다. 시간을 알게 되면 더 정밀한 풀이가 가능합니다.</p>
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
                  <span className="text-xs text-[#EFE6D2]/45">{ELEMENT_DESC[e.element]}</span>
                </span>
                <span className="tabular-nums text-[#EFE6D2]/80">{e.count}개 · {e.percent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#0B0F19]/70 ring-1 ring-[#C5A059]/20">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(e.percent, e.count ? 6 : 0)}%`, background: `linear-gradient(90deg, ${ELEMENT_COLOR[e.element]}, ${ELEMENT_COLOR[e.element]}cc)` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#C5A059]/25 bg-[#0B0F19]/50 p-4">
            <p className="text-[11px] tracking-wider text-[#C5A059]">가장 강한 기운 (과다)</p>
            <p className="mt-1 text-xl font-black" style={{ color: r.strongest === "수" ? "#9FB0DA" : ELEMENT_COLOR[r.strongest] }}>{r.strongest}({ELEMENT_HANJA[r.strongest]})</p>
            <p className="mt-2 text-sm leading-relaxed text-[#EFE6D2]/75">{EXCESS_TEXT[r.strongest]}</p>
          </div>
          <div className="rounded-xl border border-[#C5A059]/25 bg-[#0B0F19]/50 p-4">
            <p className="text-[11px] tracking-wider text-[#C5A059]">부족한 기운 (결핍)</p>
            <p className="mt-1 text-xl font-black" style={{ color: r.weakest === "수" ? "#9FB0DA" : ELEMENT_COLOR[r.weakest] }}>
              {r.missing.length ? r.missing.map((m) => `${m}(${ELEMENT_HANJA[m]})`).join(" · ") : `${r.weakest}(${ELEMENT_HANJA[r.weakest]})`}
              <span className="ml-2 text-xs font-normal text-[#EFE6D2]/50">{r.missing.length ? "원국에 없음" : "가장 약함"}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#EFE6D2]/75">{LACK_TEXT[r.missing[0] ?? r.weakest]}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-[#C5A059]/15 bg-[#0B0F19]/30 p-4 text-sm">
          <p className="mb-2 text-[11px] tracking-wider text-[#C5A059]">십성(十星) 분포 · 일간 기준</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(r.tenGodCounts) as [string, number][]).map(([k, v]) => (
              <span key={k} className="rounded-full border border-[#C5A059]/25 px-3 py-1 text-[#EFE6D2]/80">{k} <b className="text-[#E5B869]">{v}</b></span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#EFE6D2]/55">{r.strength.note}</p>
        </div>
      </Section>

      {/* PART 3 */}
      <Section no="03" title="나를 상징하는 본성과 기질" sub={`일간 ${profile.title} — ${profile.symbol}`}>
        <div className="flex flex-wrap gap-2">
          {profile.keyword.map((k) => <span key={k} className="rounded-full bg-[#E5B869]/10 px-3 py-1 text-xs text-[#F3DFAE] ring-1 ring-[#E5B869]/30">#{k}</span>)}
        </div>
        <div className="mt-5 space-y-5 text-[15px] leading-[1.9] text-[#EFE6D2]/85">
          <p>{profile.nature}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#2F9E8F]/30 bg-[#2F9E8F]/5 p-4"><p className="mb-1 text-xs tracking-wider text-[#5fc9ba]">강점</p><p className="text-sm leading-relaxed">{profile.strength}</p></div>
            <div className="rounded-xl border border-[#C2413B]/30 bg-[#C2413B]/5 p-4"><p className="mb-1 text-xs tracking-wider text-[#f08c86]">주의</p><p className="text-sm leading-relaxed">{profile.caution}</p></div>
            <div className="rounded-xl border border-[#C08A3E]/30 bg-[#C08A3E]/5 p-4"><p className="mb-1 text-xs tracking-wider text-[#e0ad66]">대인관계</p><p className="text-sm leading-relaxed">{profile.relation}</p></div>
            <div className="rounded-xl border border-[#C9CFD6]/30 bg-[#C9CFD6]/5 p-4"><p className="mb-1 text-xs tracking-wider text-[#d9dee5]">일과 재능</p><p className="text-sm leading-relaxed">{profile.work}</p></div>
          </div>
        </div>
      </Section>

      {/* PART 4 */}
      <Section no="04" title={`${theme.emoji} ${report.title}`} sub={report.summary}>
        <div className="mb-5 flex items-center gap-1 text-[#E5B869]">
          {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill={i < report.score ? "#E5B869" : "none"} className={i < report.score ? "" : "opacity-30"} />)}
          <span className="ml-2 text-xs text-[#EFE6D2]/50">기운 적합도 {report.score}/5</span>
        </div>
        <div className="space-y-5">
          {report.sections.map((s) => (
            <div key={s.heading} className="border-l-2 border-[#C5A059]/50 pl-4">
              <h4 className="font-bold text-[#F3DFAE]">{s.heading}</h4>
              <p className="mt-1.5 text-[15px] leading-[1.9] text-[#EFE6D2]/85">{s.body}</p>
            </div>
          ))}
        </div>

        {r.input.theme === "life" && (
          <div className="mt-7">
            <p className="mb-3 text-[11px] tracking-wider text-[#C5A059]">대운(大運) 흐름표 · {r.daeun.startAge}세 {r.daeun.forward ? "순행" : "역행"}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
              {r.daeun.items.map((d) => {
                const active = cur?.startAge === d.startAge;
                return (
                  <div key={d.startAge} className={`rounded-lg border p-2 text-center ${active ? "border-[#E5B869] bg-[#E5B869]/15" : "border-[#C5A059]/20 bg-[#0B0F19]/50"}`}>
                    <p className="text-[10px] text-[#EFE6D2]/55">{d.startAge}세~</p>
                    <p className="text-lg font-black" style={{ fontFamily: "var(--font-hanja)" }}>
                      <span style={{ color: d.stemElement === "수" ? "#9FB0DA" : ELEMENT_COLOR[d.stemElement] }}>{d.ganzhi[0]}</span>
                      <span style={{ color: d.branchElement === "수" ? "#9FB0DA" : ELEMENT_COLOR[d.branchElement] }}>{d.ganzhi[1]}</span>
                    </p>
                    <p className="text-[10px] text-[#EFE6D2]/55">{d.stemGod}·{d.branchGod}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 처방전 */}
        <div className="hanji mt-7 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-[#8c6d35]" />
            <h4 className="text-lg font-black text-[#2a2419]">행운 처방전 — {report.remedy.element}({ELEMENT_HANJA[report.remedy.element]})의 기운을 채우세요</h4>
          </div>
          <p className="mt-1 text-sm text-[#6b5a3c]">{report.remedyReason}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/50 p-3">
              <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Palette size={12} /> 행운의 색상</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full ring-2 ring-white" style={{ background: ELEMENT_COLOR[report.remedy.element] }} />
                <span className="text-sm font-semibold text-[#2a2419]">{report.remedy.colors.join(" · ")}</span>
              </div>
            </div>
            <div className="rounded-xl bg-white/50 p-3">
              <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Hash size={12} /> 행운의 숫자</p>
              <p className="mt-2 text-2xl font-black text-[#2a2419]">{report.remedy.numbers.join(" · ")}</p>
            </div>
            <div className="rounded-xl bg-white/50 p-3">
              <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Compass size={12} /> 행운의 방위</p>
              <p className="mt-2 text-lg font-black text-[#2a2419]">{report.remedy.direction}</p>
              <p className="text-xs text-[#6b5a3c]">기운이 깊어지는 계절 · {report.remedy.season}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-white/50 p-3 text-sm text-[#2a2419]">
            <p className="flex items-center gap-1 text-xs tracking-wider text-[#6b5a3c]"><Sparkles size={12} /> 생활 속 처방</p>
            <p className="mt-1.5"><b>가까이 둘 것:</b> {report.remedy.items.join(", ")}</p>
            <p className="mt-1">{report.remedy.habits}</p>
          </div>
        </div>
      </Section>

      {/* PART 5 */}
      <Section no="05" title="카카오톡 · SNS 공유 카드" sub="나의 사주 8글자 패를 이미지로 저장하거나 친구에게 공유해 보세요.">
        <ShareCard result={r} />
      </Section>

      <div className="flex justify-center pt-2">
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-[#C5A059]/40 px-6 py-3 text-sm text-[#E5B869] transition hover:bg-[#E5B869]/10">
          <RotateCcw size={16} /> 다른 사주 보기
        </button>
      </div>
    </div>
  );
}
