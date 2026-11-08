/**
 * 정통 만세력 계산 엔진 (100% 클라이언트 사이드)
 * - 10천간 / 12지지 음양오행 매핑
 * - 음력(평달/윤달) → 양력 변환 (lunar-typescript)
 * - 절기(節氣) 기준 연주·월주 산출, 진태양시·서머타임·동경 127.5° 표준시(1954~1961) 보정
 * - 정자시(正子時) 기준 일주 전환 (23:00 진태양시)
 * - 일간 기준 십성(十神), 오행 비율, 대운(大運) 산출
 */
import { Lunar, Solar, LunarYear, LunarMonth } from "lunar-typescript";

/* ───────────────────────── 기본 테이블 ───────────────────────── */

export type Element = "목" | "화" | "토" | "금" | "수";
export type YinYang = "양" | "음";
export type Gender = "male" | "female";
export type CalendarType = "solar" | "lunar" | "lunar-leap";
export type ThemeKey = "wealth" | "career" | "love" | "life";
export type RegionKey = "seoul" | "busan" | "gwangju" | "daejeon" | "gangwon" | "jeju";

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const STEMS_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const STEM_ELEMENT: Element[] = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];

export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const BRANCHES_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const BRANCH_ELEMENT: Element[] = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
export const BRANCH_ANIMAL = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"] as const;
/** 지지 본기(本氣) 천간 — 십성 판단에 사용 */
export const BRANCH_MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];

export const ELEMENTS: Element[] = ["목", "화", "토", "금", "수"];
export const ELEMENT_HANJA: Record<Element, string> = { 목: "木", 화: "火", 토: "土", 금: "金", 수: "水" };
export const ELEMENT_COLOR: Record<Element, string> = {
  목: "#2F9E8F", // 청록
  화: "#C2413B", // 진홍
  토: "#C08A3E", // 황토
  금: "#C9CFD6", // 백은
  수: "#3F4F73", // 먹색(청흑)
};
export const ELEMENT_TEXT_ON: Record<Element, string> = {
  목: "#F4FFFC",
  화: "#FFF5F3",
  토: "#FFF8EC",
  금: "#1A1F2B",
  수: "#EEF2FF",
};
export const ELEMENT_DESC: Record<Element, string> = {
  목: "성장·시작·인(仁)",
  화: "열정·표현·예(禮)",
  토: "신뢰·중재·신(信)",
  금: "결단·원칙·의(義)",
  수: "지혜·유연·지(智)",
};

export const yinYangOf = (index: number): YinYang => (index % 2 === 0 ? "양" : "음");

/** 상생: 목→화→토→금→수→목 */
const GENERATES: Record<Element, Element> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
/** 상극: 목→토, 토→수, 수→화, 화→금, 금→목 */
const OVERCOMES: Record<Element, Element> = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };

export const generates = (a: Element, b: Element) => GENERATES[a] === b;
export const overcomes = (a: Element, b: Element) => OVERCOMES[a] === b;
/** 나를 생해주는 오행 */
export const generatedBy = (e: Element): Element =>
  ELEMENTS.find((x) => GENERATES[x] === e) as Element;
/** 나를 극하는 오행 */
export const overcomeBy = (e: Element): Element =>
  ELEMENTS.find((x) => OVERCOMES[x] === e) as Element;

/* ───────────────────────── 십성(十神) ───────────────────────── */

export type TenGod =
  | "비견" | "겁재" | "식신" | "상관" | "편재" | "정재" | "편관" | "정관" | "편인" | "정인";
export type TenGodGroup = "비겁" | "식상" | "재성" | "관성" | "인성";

export const TEN_GOD_GROUP: Record<TenGod, TenGodGroup> = {
  비견: "비겁", 겁재: "비겁", 식신: "식상", 상관: "식상", 편재: "재성",
  정재: "재성", 편관: "관성", 정관: "관성", 편인: "인성", 정인: "인성",
};

export function tenGodOf(dayStem: number, targetStem: number): TenGod {
  const me = STEM_ELEMENT[dayStem];
  const it = STEM_ELEMENT[targetStem];
  const same = yinYangOf(dayStem) === yinYangOf(targetStem);
  if (me === it) return same ? "비견" : "겁재";
  if (generates(me, it)) return same ? "식신" : "상관";
  if (overcomes(me, it)) return same ? "편재" : "정재";
  if (overcomes(it, me)) return same ? "편관" : "정관";
  return same ? "편인" : "정인";
}

/* ───────────────────────── 입력 옵션 ───────────────────────── */

export interface HourSlot {
  branch: number;
  label: string;
  range: string;
  /** 대표 시각(자정 기준 분) — 슬롯 중앙값 */
  minutes: number;
}

/** 한국 통용 12간지 시간대 (30분 보정 반영 표기) */
export const HOUR_SLOTS: HourSlot[] = BRANCHES_KO.map((ko, i) => {
  const startH = (23 + i * 2) % 24;
  const endH = (startH + 2) % 24;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    branch: i,
    label: `${ko}시 (${BRANCHES[i]})`,
    range: `${pad(startH)}:30 ~ ${pad(endH)}:29`,
    minutes: i * 120 + 30, // 자시 00:30, 축시 02:30 …
  };
});

export interface Region {
  key: RegionKey;
  label: string;
  /** 동경 135° 표준시(UTC+9) 대비 보정 분 */
  offsetMin: number;
}

export const REGIONS: Region[] = [
  { key: "seoul", label: "서울·경기", offsetMin: -32 },
  { key: "busan", label: "부산·영남", offsetMin: -25 },
  { key: "gwangju", label: "광주·호남", offsetMin: -34 },
  { key: "daejeon", label: "대전·충청", offsetMin: -31 },
  { key: "gangwon", label: "강원", offsetMin: -30 },
  { key: "jeju", label: "제주", offsetMin: -35 },
];

export const THEMES: { key: ThemeKey; emoji: string; label: string; short: string }[] = [
  { key: "wealth", emoji: "💰", label: "재물·사업운", short: "재물" },
  { key: "career", emoji: "💼", label: "직장·이직운", short: "직장" },
  { key: "love", emoji: "❤️", label: "연애·결혼운", short: "연애" },
  { key: "life", emoji: "📜", label: "인생총운·대운", short: "총운" },
];

export const YEAR_MIN = 1940;
export const YEAR_MAX = 2026;

export interface SajuInput {
  name: string;
  gender: Gender;
  calendar: CalendarType;
  year: number;
  month: number;
  day: number;
  /** 0~11 (자~해), null = 시간 모름 */
  hourBranch: number | null;
  region: RegionKey;
  theme: ThemeKey;
}

/* ───────────────────────── 시간 보정 데이터 ───────────────────────── */

const MIN = 60_000;
const naive = (y: number, m: number, d: number, hh = 0, mm = 0) => Date.UTC(y, m - 1, d, hh, mm);

/** 대한민국 서머타임(일광절약시간) 시행 기간 — 현지 시계 기준 */
const DST_PERIODS: [number, number][] = [
  [naive(1948, 6, 1, 0, 0), naive(1948, 9, 13, 0, 0)],
  [naive(1949, 4, 3, 0, 0), naive(1949, 9, 11, 0, 0)],
  [naive(1950, 4, 1, 0, 0), naive(1950, 9, 10, 0, 0)],
  [naive(1951, 5, 6, 0, 0), naive(1951, 9, 9, 0, 0)],
  [naive(1955, 5, 5, 0, 0), naive(1955, 9, 9, 0, 0)],
  [naive(1956, 5, 20, 0, 0), naive(1956, 9, 30, 0, 0)],
  [naive(1957, 5, 5, 0, 0), naive(1957, 9, 22, 0, 0)],
  [naive(1958, 5, 4, 0, 0), naive(1958, 9, 21, 0, 0)],
  [naive(1959, 5, 3, 0, 0), naive(1959, 9, 20, 0, 0)],
  [naive(1960, 5, 1, 0, 0), naive(1960, 9, 18, 0, 0)],
  [naive(1987, 5, 10, 2, 0), naive(1987, 10, 11, 3, 0)],
  [naive(1988, 5, 8, 2, 0), naive(1988, 10, 9, 3, 0)],
];

/** 동경 127.5° (UTC+8:30) 표준시 사용 기간 */
const UTC830_START = naive(1954, 3, 21);
const UTC830_END = naive(1961, 8, 10);

export const isDst = (clock: number) => DST_PERIODS.some(([s, e]) => clock >= s && clock < e);
export const isUtc830Era = (clock: number) => clock >= UTC830_START && clock < UTC830_END;

/* ───────────────────────── 결과 타입 ───────────────────────── */

export interface Pillar {
  key: "year" | "month" | "day" | "hour";
  label: string;
  stem: number;
  branch: number;
  stemHanja: string;
  branchHanja: string;
  stemKo: string;
  branchKo: string;
  stemElement: Element;
  branchElement: Element;
  stemYinYang: YinYang;
  branchYinYang: YinYang;
  /** 일간 기준 십성 (일간 자신은 "일간") */
  stemGod: TenGod | "일간";
  branchGod: TenGod;
  ganzhi: string;
}

export interface ElementStat {
  element: Element;
  count: number;
  percent: number;
}

export interface DaeunItem {
  startAge: number;
  endAge: number;
  startYear: number;
  stem: number;
  branch: number;
  ganzhi: string;
  stemElement: Element;
  branchElement: Element;
  stemGod: TenGod;
  branchGod: TenGod;
}

export interface SajuResult {
  input: SajuInput;
  name: string;
  solar: { year: number; month: number; day: number };
  lunar: { year: number; month: number; day: number; isLeap: boolean };
  hourKnown: boolean;
  pillars: Pillar[];
  dayMaster: {
    stem: number;
    hanja: string;
    ko: string;
    element: Element;
    yinYang: YinYang;
    title: string; // 갑목, 을목 …
  };
  zodiac: string;
  elements: ElementStat[];
  strongest: Element;
  weakest: Element;
  missing: Element[];
  tenGodCounts: Record<TenGodGroup, number>;
  strength: { label: "신강" | "중화" | "신약"; score: number; note: string };
  corrections: {
    dstApplied: boolean;
    utc830Era: boolean;
    regionLabel: string;
    regionOffsetMin: number;
    totalOffsetMin: number;
    clockTime: string; // 입력 기준 시각
    trueSolarTime: string; // 보정 후 진태양시
  };
  daeun: { forward: boolean; startAge: number; items: DaeunItem[] };
  trueSolarIso: string;
}

/* ───────────────────────── 유틸 ───────────────────────── */

const mod = (n: number, m: number) => ((n % m) + m) % m;

function julianDayNumber(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

const sexagenaryIndex = (stem: number, branch: number) => {
  for (let n = 0; n < 60; n++) if (n % 10 === stem && n % 12 === branch) return n;
  return 0;
};

const fmt = (ms: number) => {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}.${p(d.getUTCMonth() + 1)}.${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
};

const JIE_ORDER = ["立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"];
const JIE_ALIAS: Record<string, string> = {
  DA_XUE: "大雪", XIAO_HAN: "小寒", LI_CHUN: "立春", JING_ZHE: "惊蛰",
  QING_MING: "清明", LI_XIA: "立夏", MANG_ZHONG: "芒种", XIAO_SHU: "小暑",
  LI_QIU: "立秋", BAI_LU: "白露", HAN_LU: "寒露", LI_DONG: "立冬",
};
export const JIE_KO: Record<string, string> = {
  立春: "입춘", 惊蛰: "경칩", 清明: "청명", 立夏: "입하", 芒种: "망종", 小暑: "소서",
  立秋: "입추", 白露: "백로", 寒露: "한로", 立冬: "입동", 大雪: "대설", 小寒: "소한",
};

interface Jie { name: string; utc: number; }

/** 해당 양력 날짜 주변의 12절(節) 시각(UTC ms) 목록 */
function jieListAround(sy: number, sm: number, sd: number): Jie[] {
  const lunar = Solar.fromYmd(sy, sm, sd).getLunar();
  const tables = [lunar.getJieQiTable(), Lunar.fromYmd(lunar.getYear() - 1, 1, 1).getJieQiTable(), Lunar.fromYmd(lunar.getYear() + 1, 1, 1).getJieQiTable()];
  const seen = new Map<string, Jie>();
  for (const table of tables) {
    for (const key of Object.keys(table)) {
      const name = JIE_ALIAS[key] ?? key;
      if (!JIE_ORDER.includes(name)) continue;
      const s = table[key];
      // lunar-typescript 의 절기 시각은 UTC+8(북경시) 기준 → UTC 로 환산
      const utc = Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute(), s.getSecond()) - 480 * MIN;
      seen.set(`${name}-${s.getYear()}-${s.getMonth()}`, { name, utc });
    }
  }
  return [...seen.values()].sort((a, b) => a.utc - b.utc);
}

/* ───────────────────────── 음력 검증/변환 ───────────────────────── */

export function leapMonthOf(lunarYear: number): number {
  try { return LunarYear.fromYear(lunarYear).getLeapMonth(); } catch { return 0; }
}

export function lunarMonthDays(lunarYear: number, month: number, isLeap: boolean): number {
  try {
    const m = LunarMonth.fromYm(lunarYear, isLeap ? -month : month);
    return m ? m.getDayCount() : 30;
  } catch { return 30; }
}

export function validateInput(input: SajuInput): string | null {
  if (input.year < YEAR_MIN || input.year > YEAR_MAX) return `연도는 ${YEAR_MIN}~${YEAR_MAX} 사이여야 합니다.`;
  if (input.month < 1 || input.month > 12) return "월을 확인해 주세요.";
  if (input.calendar === "solar") {
    const dim = new Date(Date.UTC(input.year, input.month, 0)).getUTCDate();
    if (input.day < 1 || input.day > dim) return `${input.year}년 ${input.month}월은 ${dim}일까지 있습니다.`;
    return null;
  }
  const isLeap = input.calendar === "lunar-leap";
  if (isLeap && leapMonthOf(input.year) !== input.month) {
    const lm = leapMonthOf(input.year);
    return lm ? `${input.year}년 음력 윤달은 윤${lm}월뿐입니다.` : `${input.year}년에는 음력 윤달이 없습니다.`;
  }
  const days = lunarMonthDays(input.year, input.month, isLeap);
  if (input.day < 1 || input.day > days) return `음력 ${input.year}년 ${isLeap ? "윤" : ""}${input.month}월은 ${days}일까지 있습니다.`;
  return null;
}

/* ───────────────────────── 메인 계산 ───────────────────────── */

export function calculateSaju(input: SajuInput): SajuResult {
  const err = validateInput(input);
  if (err) throw new Error(err);

  // 1) 양력 변환
  let sy = input.year, sm = input.month, sd = input.day;
  if (input.calendar !== "solar") {
    const isLeap = input.calendar === "lunar-leap";
    const solar = Lunar.fromYmd(input.year, isLeap ? -input.month : input.month, input.day).getSolar();
    sy = solar.getYear(); sm = solar.getMonth(); sd = solar.getDay();
  }
  const lunarObj = Solar.fromYmd(sy, sm, sd).getLunar();
  const lunar = {
    year: lunarObj.getYear(),
    month: Math.abs(lunarObj.getMonth()),
    day: lunarObj.getDay(),
    isLeap: lunarObj.getMonth() < 0,
  };

  // 2) 출생 시각(현지 시계) → 표준시/서머타임/진태양시 보정
  const hourKnown = input.hourBranch !== null;
  const slotMinutes = hourKnown ? HOUR_SLOTS[input.hourBranch as number].minutes : 12 * 60;
  const clock = naive(sy, sm, sd) + slotMinutes * MIN; // 입력된 시계 시각(naive)

  const dstApplied = isDst(clock);
  const utc830Era = isUtc830Era(clock);
  const standardOffsetMin = (utc830Era ? 510 : 540) + (dstApplied ? 60 : 0);
  const utc = clock - standardOffsetMin * MIN; // 실제 UTC 순간

  const region = REGIONS.find((r) => r.key === input.region) ?? REGIONS[0];
  const longitudeMin = 540 + region.offsetMin; // 지역 경도 환산(분)
  const trueSolar = utc + longitudeMin * MIN; // 진태양시(평균태양시) naive
  const totalOffsetMin = Math.round((trueSolar - clock) / MIN);

  // 3) 일주 — 정자시: 진태양시 23:00 에 날짜 전환
  const dayRef = new Date(trueSolar + 60 * MIN);
  const jdn = julianDayNumber(dayRef.getUTCFullYear(), dayRef.getUTCMonth() + 1, dayRef.getUTCDate());
  const dayIdx = mod(jdn + 49, 60);
  const dayStem = dayIdx % 10;
  const dayBranch = dayIdx % 12;

  // 4) 시주
  const tsMinutesOfDay = mod(Math.floor((trueSolar) / MIN), 1440);
  const hourBranch = Math.floor(((tsMinutesOfDay + 60) % 1440) / 120);
  const hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;

  // 5) 연주·월주 (절기 기준)
  const jies = jieListAround(sy, sm, sd);
  const lichunThisYear = jies.find((j) => j.name === "立春" && new Date(j.utc + 540 * MIN).getUTCFullYear() === sy);
  const yearNum = lichunThisYear && utc < lichunThisYear.utc ? sy - 1 : sy;
  const yearStem = mod(yearNum - 4, 10);
  const yearBranch = mod(yearNum - 4, 12);

  let lastJieIdx = -1;
  for (let i = 0; i < jies.length; i++) if (jies[i].utc <= utc) lastJieIdx = i;
  const curJie = jies[lastJieIdx];
  const monthOrder = JIE_ORDER.indexOf(curJie.name); // 0=寅월
  const monthBranch = (monthOrder + 2) % 12;
  const monthStem = ((yearStem % 5) * 2 + 2 + monthOrder) % 10;

  // 6) 기둥 구성
  const mk = (key: Pillar["key"], label: string, stem: number, branch: number): Pillar => ({
    key, label, stem, branch,
    stemHanja: STEMS[stem], branchHanja: BRANCHES[branch],
    stemKo: STEMS_KO[stem], branchKo: BRANCHES_KO[branch],
    stemElement: STEM_ELEMENT[stem], branchElement: BRANCH_ELEMENT[branch],
    stemYinYang: yinYangOf(stem), branchYinYang: yinYangOf(branch),
    stemGod: key === "day" ? "일간" : tenGodOf(dayStem, stem),
    branchGod: tenGodOf(dayStem, BRANCH_MAIN_STEM[branch]),
    ganzhi: `${STEMS[stem]}${BRANCHES[branch]}`,
  });

  const pillars: Pillar[] = [
    mk("year", "연주", yearStem, yearBranch),
    mk("month", "월주", monthStem, monthBranch),
    mk("day", "일주", dayStem, dayBranch),
  ];
  if (hourKnown) pillars.push(mk("hour", "시주", hourStem, hourBranch));

  // 7) 오행 통계
  const counts: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of pillars) { counts[p.stemElement]++; counts[p.branchElement]++; }
  const total = pillars.length * 2;
  const elements: ElementStat[] = ELEMENTS.map((e) => ({ element: e, count: counts[e], percent: Math.round((counts[e] / total) * 100) }));
  const sorted = [...elements].sort((a, b) => b.count - a.count);
  const strongest = sorted[0].element;
  const weakest = sorted[sorted.length - 1].element;
  const missing = elements.filter((e) => e.count === 0).map((e) => e.element);

  // 8) 십성 그룹 카운트
  const tenGodCounts: Record<TenGodGroup, number> = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  for (const p of pillars) {
    if (p.stemGod !== "일간") tenGodCounts[TEN_GOD_GROUP[p.stemGod]]++;
    tenGodCounts[TEN_GOD_GROUP[p.branchGod]]++;
  }

  // 9) 신강·신약 (간이 득령·득세 판단)
  const monthGod = TEN_GOD_GROUP[pillars[1].branchGod];
  let score = tenGodCounts.비겁 + tenGodCounts.인성;
  if (monthGod === "비겁" || monthGod === "인성") score += 2; // 득령 가중
  const ratio = score / (total - 1 + 2);
  const strength: SajuResult["strength"] = ratio >= 0.55
    ? { label: "신강", score, note: "나를 돕는 기운(비겁·인성)이 두터워 주체성이 강한 구조입니다. 기운을 덜어내는 식상·재성·관성의 활용이 열쇠입니다." }
    : ratio <= 0.3
      ? { label: "신약", score, note: "나를 돕는 기운이 적어 외부 환경의 영향을 크게 받습니다. 인성·비겁의 보강과 환경 선택이 중요합니다." }
      : { label: "중화", score, note: "돕는 기운과 덜어내는 기운이 비교적 균형을 이룬 안정적 구조입니다." };

  // 10) 대운
  const forward = (yearStem % 2 === 0) === (input.gender === "male"); // 양남음녀 순행
  let daeunDays: number;
  if (forward) {
    const next = jies[lastJieIdx + 1];
    daeunDays = (next.utc - utc) / (1440 * MIN);
  } else {
    daeunDays = (utc - curJie.utc) / (1440 * MIN);
  }
  const startAge = Math.min(10, Math.max(1, Math.round(daeunDays / 3)));
  const monthIdx = sexagenaryIndex(monthStem, monthBranch);
  const items: DaeunItem[] = Array.from({ length: 9 }, (_, i) => {
    const idx = mod(monthIdx + (forward ? i + 1 : -(i + 1)), 60);
    const s = idx % 10, b = idx % 12;
    return {
      startAge: startAge + i * 10,
      endAge: startAge + i * 10 + 9,
      startYear: sy + startAge + i * 10,
      stem: s, branch: b, ganzhi: `${STEMS[s]}${BRANCHES[b]}`,
      stemElement: STEM_ELEMENT[s], branchElement: BRANCH_ELEMENT[b],
      stemGod: tenGodOf(dayStem, s), branchGod: tenGodOf(dayStem, BRANCH_MAIN_STEM[b]),
    };
  });

  return {
    input,
    name: input.name.trim(),
    solar: { year: sy, month: sm, day: sd },
    lunar,
    hourKnown,
    pillars,
    dayMaster: {
      stem: dayStem,
      hanja: STEMS[dayStem],
      ko: STEMS_KO[dayStem],
      element: STEM_ELEMENT[dayStem],
      yinYang: yinYangOf(dayStem),
      title: `${STEMS_KO[dayStem]}${STEM_ELEMENT[dayStem]}`,
    },
    zodiac: BRANCH_ANIMAL[yearBranch],
    elements,
    strongest,
    weakest,
    missing,
    tenGodCounts,
    strength,
    corrections: {
      dstApplied,
      utc830Era,
      regionLabel: region.label,
      regionOffsetMin: region.offsetMin,
      totalOffsetMin,
      clockTime: hourKnown ? fmt(clock) : `${fmt(clock).slice(0, 10)} (시간 모름)`,
      trueSolarTime: hourKnown ? fmt(trueSolar) : `${fmt(trueSolar).slice(0, 10)} (정오 기준)`,
    },
    daeun: { forward, startAge, items },
    trueSolarIso: new Date(trueSolar).toISOString(),
  };
}

/* ───────────────────────── URL 직렬화 (공유용) ───────────────────────── */

export function encodeInput(i: SajuInput): string {
  const p = new URLSearchParams();
  if (i.name) p.set("n", i.name);
  p.set("g", i.gender === "male" ? "m" : "f");
  p.set("c", i.calendar === "solar" ? "s" : i.calendar === "lunar" ? "l" : "ll");
  p.set("y", String(i.year)); p.set("m", String(i.month)); p.set("d", String(i.day));
  p.set("h", i.hourBranch === null ? "x" : String(i.hourBranch));
  p.set("r", i.region); p.set("t", i.theme);
  return p.toString();
}

export function decodeInput(search: string): SajuInput | null {
  const p = new URLSearchParams(search);
  if (!p.get("y") || !p.get("m") || !p.get("d")) return null;
  const h = p.get("h");
  const calMap: Record<string, CalendarType> = { s: "solar", l: "lunar", ll: "lunar-leap" };
  const input: SajuInput = {
    name: p.get("n") ?? "",
    gender: p.get("g") === "f" ? "female" : "male",
    calendar: calMap[p.get("c") ?? "s"] ?? "solar",
    year: Number(p.get("y")), month: Number(p.get("m")), day: Number(p.get("d")),
    hourBranch: h === "x" || h === null ? null : Math.min(11, Math.max(0, Number(h))),
    region: (REGIONS.find((r) => r.key === p.get("r"))?.key ?? "seoul") as RegionKey,
    theme: (THEMES.find((t) => t.key === p.get("t"))?.key ?? "life") as ThemeKey,
  };
  if ([input.year, input.month, input.day].some((n) => !Number.isFinite(n))) return null;
  return input;
}
