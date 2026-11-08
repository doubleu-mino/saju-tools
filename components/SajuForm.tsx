"use client";

import { useMemo, useState } from "react";
import { Sparkles, User, Clock, MapPin, CalendarDays, Info } from "lucide-react";
import {
  SajuInput, HOUR_SLOTS, REGIONS, THEMES, YEAR_MIN, YEAR_MAX, CalendarType, Gender, ThemeKey, RegionKey,
  validateInput, leapMonthOf, lunarMonthDays, isDst, isUtc830Era,
} from "@/lib/saju";

interface Props {
  initial?: SajuInput | null;
  onSubmit: (input: SajuInput) => void;
}

const YEARS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MAX - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function SajuForm({ initial, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "male");
  const [calendar, setCalendar] = useState<CalendarType>(initial?.calendar ?? "solar");
  const [year, setYear] = useState(initial?.year ?? 1990);
  const [month, setMonth] = useState(initial?.month ?? 1);
  const [day, setDay] = useState(initial?.day ?? 1);
  const [hour, setHour] = useState<string>(initial ? (initial.hourBranch === null ? "x" : String(initial.hourBranch)) : "x");
  const [region, setRegion] = useState<RegionKey>(initial?.region ?? "seoul");
  const [theme, setTheme] = useState<ThemeKey>(initial?.theme ?? "life");
  const [error, setError] = useState<string | null>(null);

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
    theme,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = build();
    const err = validateInput(input);
    if (err) { setError(err); return; }
    setError(null);
    onSubmit(input);
  };

  const seg = (active: boolean) =>
    `flex-1 rounded-lg border px-3 py-2.5 text-sm transition ${
      active
        ? "border-[#E5B869] bg-[#E5B869]/15 text-[#F3DFAE] shadow-[inset_0_0_12px_rgba(229,184,105,.15)]"
        : "border-[#C5A059]/25 bg-[#0B0F19]/60 text-[#EFE6D2]/70 hover:border-[#C5A059]/60"
    }`;

  return (
    <form onSubmit={handleSubmit} className="card ornament animate-rise rounded-2xl p-5 sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-[11px] tracking-[0.35em] text-[#C5A059]">四柱八字 · 五行</p>
        <h2 className="gold-text mt-1 text-2xl font-black sm:text-3xl">나의 사주 원국 열람</h2>
        <p className="mt-2 text-sm text-[#EFE6D2]/60">생년월일시를 입력하면 천간·지지 8글자와 오행의 균형을 정밀하게 풀어드립니다.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* 이름 */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-[#C5A059]"><User size={13} /> 이름 <span className="text-[#EFE6D2]/35">(선택)</span></span>
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
          <span className="mb-1.5 block text-xs tracking-wider text-[#C5A059]">성별</span>
          <div className="flex gap-2">
            <button type="button" className={seg(gender === "male")} onClick={() => setGender("male")}>남성 (乾命)</button>
            <button type="button" className={seg(gender === "female")} onClick={() => setGender("female")}>여성 (坤命)</button>
          </div>
        </div>

        {/* 달력 */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-[#C5A059]"><CalendarDays size={13} /> 달력 구분</span>
          <div className="flex gap-2">
            {([["solar", "양력"], ["lunar", "음력 평달"], ["lunar-leap", "음력 윤달"]] as [CalendarType, string][]).map(([k, l]) => (
              <button key={k} type="button" className={seg(calendar === k)} onClick={() => setCalendar(k)}>{l}</button>
            ))}
          </div>
          {calendar === "lunar-leap" && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-[#E5B869]/85">
              <Info size={13} className="mt-0.5 shrink-0" />
              {leapMonth ? `${year}년의 윤달은 윤${leapMonth}월입니다.` : `${year}년에는 윤달이 없습니다. 연도를 확인해 주세요.`}
            </p>
          )}
        </div>

        {/* 생년월일 */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs tracking-wider text-[#C5A059]">생년월일</span>
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
            <p className="mt-2 flex items-start gap-1.5 text-xs text-[#E5B869]/85"><Info size={13} className="mt-0.5 shrink-0" />{dstHint}</p>
          )}
        </div>

        {/* 출생 시간 */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-[#C5A059]"><Clock size={13} /> 출생 시간</span>
          <select className="select-dark w-full" value={hour} onChange={(e) => setHour(e.target.value)}>
            <option value="x">시간 모름 (연·월·일 3주 분석)</option>
            {HOUR_SLOTS.map((s) => (
              <option key={s.branch} value={s.branch}>{s.label} · {s.range}</option>
            ))}
          </select>
        </label>

        {/* 출생 지역 */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs tracking-wider text-[#C5A059]"><MapPin size={13} /> 출생 지역 (진태양시 보정)</span>
          <select className="select-dark w-full" value={region} onChange={(e) => setRegion(e.target.value as RegionKey)}>
            {REGIONS.map((r) => (
              <option key={r.key} value={r.key}>{r.label} ({r.offsetMin}분 보정)</option>
            ))}
          </select>
        </label>

        {/* 관심 테마 */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs tracking-wider text-[#C5A059]">관심 테마</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  theme === t.key
                    ? "border-[#E5B869] bg-[#E5B869]/15 text-[#F3DFAE] animate-glow"
                    : "border-[#C5A059]/25 bg-[#0B0F19]/60 text-[#EFE6D2]/70 hover:border-[#C5A059]/60"
                }`}
              >
                <span className="block text-xl">{t.emoji}</span>
                <span className="mt-1 block">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg border border-[#C2413B]/50 bg-[#C2413B]/10 px-3 py-2 text-sm text-[#F5B5B0]">{error}</p>}

      <button
        type="submit"
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C5A059] via-[#E5B869] to-[#C5A059] px-6 py-4 text-base font-bold text-[#0B0F19] shadow-[0_8px_30px_rgba(229,184,105,.25)] transition hover:brightness-110 active:scale-[.99]"
      >
        <Sparkles size={18} /> 사주 분석 시작
      </button>
      <p className="mt-3 text-center text-[11px] text-[#EFE6D2]/40">입력 정보는 브라우저 안에서만 계산되며 서버로 전송되지 않습니다.</p>
    </form>
  );
}
