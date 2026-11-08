"use client";

import { useMemo, useState } from "react";
import { Sparkles, User, Clock, MapPin, CalendarDays, Info, Target, Flame, CheckCircle2, Lock } from "lucide-react";
import {
  SajuInput, HOUR_SLOTS, REGIONS, YEAR_MIN, YEAR_MAX, CalendarType, Gender, RegionKey, ConcernKey, WishKey, CONCERNS, WISHES,
  validateInput, leapMonthOf, lunarMonthDays, isDst, isUtc830Era,
} from "@/lib/saju";

interface Props {
  initial?: SajuInput | null;
  /** 홈 퀵 카드에서 고른 고민 — 바뀔 때마다 고민 칩을 즉시 선택 */
  presetConcern?: ConcernKey | null;
  onSubmit: (input: SajuInput) => void;
}

const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MAX - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function SajuForm({ initial, presetConcern = null, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "male");
  const [calendar, setCalendar] = useState<CalendarType>(initial?.calendar ?? "solar");
  const [year, setYear] = useState(initial?.year ?? 1990);
  const [month, setMonth] = useState(initial?.month ?? 1);
  const [day, setDay] = useState(initial?.day ?? 1);
  const [hour, setHour] = useState<string>(initial ? (initial.hourBranch === null ? "x" : String(initial.hourBranch)) : "x");
  const [region, setRegion] = useState<RegionKey>(initial?.region ?? "seoul");
  const [concern, setConcern] = useState<ConcernKey | null>(presetConcern ?? initial?.concern ?? null);
  const [wish, setWish] = useState<WishKey | null>(initial?.wish ?? null);
  const [error, setError] = useState<string | null>(null);

  // 퀵 카드 선택이 바뀌면 렌더 중에 파생 상태로 반영 (effect 없이)
  const [prevPreset, setPrevPreset] = useState<ConcernKey | null>(presetConcern);
  if (presetConcern !== prevPreset) {
    setPrevPreset(presetConcern);
    if (presetConcern) { setConcern(presetConcern); setError(null); }
  }

  const leapMonth = useMemo(() => (calendar === "lunar-leap" ? leapMonthOf(year) : 0), [calendar, year]);

  const daysInMonth = useMemo(() => {
    if (calendar === "solar") return new Date(Date.UTC(year, month, 0)).getUTCDate();
    return lunarMonthDays(year, month, calendar === "lunar-leap");
  }, [calendar, year, month]);
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dstHint = useMemo(() => {
    if (calendar !== "solar") return null;
    const clock = Date.UTC(year, month - 1, Math.min(day, daysInMonth), 12, 0);
    if (isDst(clock)) return "이 날짜는 대한민국 서머타임 시행 기간입니다. 1시간이 자동 보정됩니다.";
    if (isUtc830Era(clock)) return "이 시기는 동경 127.5° 표준시(UTC+8:30) 사용 기간으로, 진태양시 보정이 자동 조정됩니다.";
    return null;
  }, [calendar, year, month, day, daysInMonth]);

  const build = (): SajuInput => ({
    name: name.trim(),
    gender,
    calendar,
    year,
    month,
    day: Math.min(day, daysInMonth),
    hourBranch: hour === "x" ? null : Number(hour),
    region,
    theme: "life",
    concern: concern ?? "reunion",
    wish: wish ?? "wealth",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern) { setError("현재 가장 풀리지 않는 고민을 하나 선택해 주세요. 선택한 고민에 맞춰 결정적 '달'을 정밀하게 산출합니다."); return; }
    if (!wish) { setError("끌어당기고 싶은 절대 기운을 하나 선택해 주세요."); return; }
    const input = build();
    const err = validateInput(input);
    if (err) { setError(err); return; }
    setError(null);
    onSubmit(input);
  };

  const seg = (active: boolean) =>
    `flex-1 rounded-lg border px-3 py-2.5 text-sm transition ${
      active
        ? "border-gold bg-gold/15 text-gold-light shadow-[inset_0_0_12px_rgba(229,184,105,.15)]"
        : "border-gold-2/25 bg-ink/60 text-fg/70 hover:border-gold-2/60"
    }`;

  return (
    <form onSubmit={handleSubmit} className="card ornament animate-rise rounded-2xl p-5 sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-[11px] tracking-[0.35em] text-gold-2">四柱八字 · 五行</p>
        <h2 className="gold-text mt-1 text-2xl font-black sm:text-3xl">나의 사주 원국 열람</h2>
        <p className="mt-2 break-keep text-pretty text-sm text-fg/60">생년월일시를 입력하면 사주원국 8글자·오행 분포·일간 성향·인생 종합 총운을 무료로 풀어드립니다. 로그인은 필요 없습니다.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* 이름 */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-gold-2"><User size={13} /> 이름 <span className="text-fg/35">(선택)</span></span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 12))}
            placeholder="홍길동"
            className="input-dark w-full"
            autoComplete="off"
          />
        </label>

        {/* 성별 */}
        <div>
          <span className="mb-1.5 block text-xs tracking-wider text-gold-2">성별</span>
          <div className="flex gap-2">
            <button type="button" className={seg(gender === "male")} onClick={() => setGender("male")}>남성 (乾命)</button>
            <button type="button" className={seg(gender === "female")} onClick={() => setGender("female")}>여성 (坤命)</button>
          </div>
        </div>

        {/* 달력 */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-gold-2"><CalendarDays size={13} /> 달력 구분</span>
          <div className="flex gap-2">
            {([["solar", "양력"], ["lunar", "음력 평달"], ["lunar-leap", "음력 윤달"]] as [CalendarType, string][]).map(([k, l]) => (
              <button key={k} type="button" className={seg(calendar === k)} onClick={() => setCalendar(k)}>{l}</button>
            ))}
          </div>
          {calendar === "lunar-leap" && (
            <p className="mt-2 flex items-start gap-1.5 break-keep text-xs text-gold/85">
              <Info size={13} className="mt-0.5 shrink-0" />
              {leapMonth ? `${year}년의 윤달은 윤${leapMonth}월입니다.` : `${year}년에는 윤달이 없습니다. 연도를 확인해 주세요.`}
            </p>
          )}
        </div>

        {/* 생년월일 */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs tracking-wider text-gold-2">생년월일</span>
          <div className="grid grid-cols-3 gap-2">
            <select className="select-dark" value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="연도">
              {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select className="select-dark" value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label="월">
              {MONTHS.map((m) => <option key={m} value={m}>{calendar === "lunar-leap" ? "윤" : ""}{m}월</option>)}
            </select>
            <select className="select-dark" value={Math.min(day, daysInMonth)} onChange={(e) => setDay(Number(e.target.value))} aria-label="일">
              {DAYS.map((d) => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>
          {dstHint && (
            <p className="mt-2 flex items-start gap-1.5 break-keep text-xs text-gold/85"><Info size={13} className="mt-0.5 shrink-0" />{dstHint}</p>
          )}
        </div>

        {/* 출생 시간 */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-gold-2"><Clock size={13} /> 출생 시간</span>
          <select className="select-dark w-full" value={hour} onChange={(e) => setHour(e.target.value)}>
            <option value="x">시간 모름 (연·월·일 3주 분석)</option>
            {HOUR_SLOTS.map((s) => (
              <option key={s.branch} value={s.branch}>{s.label} · {s.range}</option>
            ))}
          </select>
        </label>

        {/* 출생 지역 */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-gold-2"><MapPin size={13} /> 출생 지역 (진태양시 보정)</span>
          <select className="select-dark w-full" value={region} onChange={(e) => setRegion(e.target.value as RegionKey)}>
            {REGIONS.map((r) => (
              <option key={r.key} value={r.key}>{r.label} ({r.offsetMin}분 보정)</option>
            ))}
          </select>
        </label>
      </div>


      {/* ───── 2차 심층 질문 ───── */}
      <div className="mt-7 rounded-2xl border border-gold/30 bg-gold/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] tracking-[0.3em] text-gold-2"><Target size={13} /> 2차 심층 질문 · 정밀 간명</p>
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-gold/40 px-2 py-0.5 text-[10px] text-gold"><Lock size={10} /> VIP 간명 기초 데이터</span>
        </div>
        <p className="mt-1.5 break-keep text-pretty text-xs leading-relaxed text-fg/55">
          선택한 고민과 기운에 맞춰 2026 丙午·2027 丁未 세운과 12신살을 교차해 <b className="text-gold-light">결정적 달(月)·귀인 성씨·비책 물상</b>을 산출합니다.
        </p>

        <div className="mt-4">
          <span className="mb-2 block text-xs tracking-wider text-gold-2">1. 현재 가장 풀리지 않는 고민 <span className="text-fg/40">(택1)</span></span>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONCERNS.map((c) => (
              <button key={c.key} type="button" aria-pressed={concern === c.key} className={`chip ${concern === c.key ? "is-active" : ""}`} onClick={() => { setConcern(c.key); if (error) setError(null); }}>
                <span className="text-base leading-none">{c.emoji}</span>
                <span className="min-w-0 flex-1 break-keep">
                  <span className="block font-semibold">{c.label}</span>
                  <span className="block text-[11px] leading-snug text-fg/45">
                    {c.hint.split(" · ").map((part, i) => <span key={part} className="inline-block">{i > 0 && <span className="mx-1 text-fg/30">·</span>}{part}</span>)}
                  </span>
                </span>
                <CheckCircle2 size={16} className="chip__check" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="mb-2 flex items-center gap-1 text-xs tracking-wider text-gold-2"><Flame size={12} /> 2. 끌어당기고 싶은 절대 기운 <span className="text-fg/40">(택1)</span></span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {WISHES.map((w) => (
              <button key={w.key} type="button" aria-pressed={wish === w.key} className={`chip relative ${wish === w.key ? "is-active" : ""} !flex-col !items-start !gap-1 !px-2 sm:!px-3`} onClick={() => { setWish(w.key); if (error) setError(null); }}>
                <span className="flex w-full items-center gap-1 sm:gap-1.5">
                  <span className="text-base leading-none">{w.emoji}</span>
                  <span className="whitespace-nowrap break-keep text-xs font-semibold md:text-sm">{w.label}</span>
                </span>
                <span className="break-keep pr-4 text-[11px] leading-snug text-fg/45">
                  {w.hint.split(" · ").map((part) => <span key={part} className="block">{part}</span>)}
                </span>
                <CheckCircle2 size={14} className="chip__check !absolute bottom-2.5 right-2 !m-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 break-keep rounded-lg border border-[#C2413B]/50 bg-[#C2413B]/10 px-3 py-2 text-sm text-fire-text">{error}</p>}

      <button
        type="submit"
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-2 px-6 py-4 text-base font-bold text-on-gold shadow-[0_8px_30px_rgba(229,184,105,.25)] transition hover:brightness-110 active:scale-[.99]"
      >
        <Sparkles size={18} /> 심층 사주 분석 시작
      </button>
      <p className="mt-3 break-keep text-center text-[11px] text-fg/40">입력 정보는 브라우저 안에서만 계산되며 서버로 전송되지 않습니다.</p>
    </form>
  );
}
