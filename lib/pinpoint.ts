/**
 * 정밀 예측 엔진 — 일간·일지·연지 × 2026 丙午 / 2027 丁未 세운 × 월건(月建) × 12신살 × 육친
 * - 고민별 결정적 '월(月)' 산출
 * - 재벌가 비전 간명식: 귀인 성씨 초성(소리오행) · 천을귀인 띠
 * - 삼재·관살·손재수 무력화 보완 오행 및 비책 물상(物象)
 * - 12개월 운세 타임라인 (황금의 달 1곳 · 손재수의 달 1곳 잠금)
 *
 * 모든 결정적 값은 LockToken 으로 감싸져 UI 에서 인라인 자물쇠로 표시됩니다.
 */
import {
  Element, ELEMENT_HANJA, SajuResult, TenGod, TenGodGroup, TEN_GOD_GROUP, tenGodOf, generatedBy, overcomeBy, ELEMENTS,
  BRANCH_ELEMENT, BRANCH_MAIN_STEM, BRANCHES, BRANCHES_KO, BRANCH_ANIMAL, yinYangOf,
  sixHarmonyOf, clashOf, trineGroupOf, TRINE_LABEL, shinsalOf, Shinsal, dohwaBranchOf, geopsalBranchOf, jaesalBranchOf,
  samjaeStage, SamjaeStage, CHEONEUL_BRANCHES, stemsCombine, yearGanzhi, monthGanzhi, monthOfBranch, Ganzhi,
  CONCERNS, WISHES, ConcernKey, WishKey, ChoiceMeta, DaeunItem,
} from "./saju";
import { remedyElementFor, currentDaeun } from "./interpretations";

/* ───────────────────────── 잠금 토큰 ───────────────────────── */

export type LockKind = "month" | "surname" | "item" | "color" | "pattern" | "direction" | "age" | "zodiac";
export interface LockToken { lock: true; kind: LockKind; hint: string; value: string }
export type Segment = string | LockToken;
export interface Paragraph { heading: string; segments: Segment[] }

const HINT: Record<LockKind, string> = {
  month: "??월", surname: "?씨 성", item: "??? 물상", color: "??? 색상", pattern: "???격", direction: "?쪽 방위", age: "??세", zodiac: "?띠",
};
export const isLock = (s: Segment): s is LockToken => typeof s !== "string";
const L = (kind: LockKind, value: string, hint?: string): LockToken => ({ lock: true, kind, hint: hint ?? HINT[kind], value });
const Lm = (month: number, year?: number) => L("month", `${year ? `${year}년 ` : ""}${month}월`);

/** 태그 템플릿: 문자열과 LockToken 을 Segment[] 로 엮는다 */
type PValue = string | number | LockToken | Segment[];
function P(strings: TemplateStringsArray, ...values: PValue[]): Segment[] {
  const out: Segment[] = [];
  const push = (t: string) => {
    if (!t) return;
    const last = out[out.length - 1];
    if (typeof last === "string") out[out.length - 1] = last + t; else out.push(t);
  };
  const add = (v: PValue) => {
    if (Array.isArray(v)) v.forEach(add);
    else if (typeof v === "object") out.push(v);
    else push(String(v));
  };
  strings.forEach((str, i) => {
    push(str);
    const v = values[i];
    if (v !== undefined) add(v);
  });
  return out;
}

/* ───────────────────────── 오행 → 물상·색·방위·소리오행 ───────────────────────── */

/** 훈민정음 소리오행(音靈五行): ㄱㅋ=木 ㄴㄷㄹㅌ=火 ㅇㅎ=土 ㅅㅈㅊ=金 ㅁㅂㅍ=水 */
const ELEMENT_CONSONANT: Record<Element, string> = { 목: "ㄱ/ㅋ", 화: "ㄴ/ㄷ", 토: "ㅇ/ㅎ", 금: "ㅅ/ㅈ", 수: "ㅁ/ㅂ" };
const ELEMENT_SURNAMES: Record<Element, string> = {
  목: "김·강·고·권·곽·구", 화: "나·노·도·류·탁·남", 토: "이·오·유·윤·한·홍·안", 금: "송·서·신·정·조·최·차", 수: "박·문·민·배·백·표",
};
const ELEMENT_COLOR_KO: Record<Element, string> = { 목: "청록·초록", 화: "진홍·주황", 토: "황토·금황", 금: "백은·화이트", 수: "먹색·네이비" };
const ELEMENT_DIRECTION: Record<Element, string> = { 목: "동쪽", 화: "남쪽", 토: "남서쪽", 금: "서쪽", 수: "북쪽" };
/** 비책 물상(物象) — 고민 결에 따라 변주 */
const ELEMENT_ITEM: Record<Element, { base: string; money: string; love: string; shield: string; seal: string }> = {
  목: { base: "원목 108염주", money: "동쪽 창가의 산세베리아 화분", love: "초록 비취(翡翠) 귀걸이", shield: "복숭아나무 가지 매듭", seal: "대추나무 인장" },
  화: { base: "붉은 실 삼매듭 팔찌", money: "남향 히말라야 소금 램프", love: "석류석(가넷) 펜던트", shield: "주사(朱砂) 붉은 주머니", seal: "홍옥(紅玉) 도장" },
  토: { base: "황옥(黃玉) 원석", money: "흙 도자기 저금 항아리", love: "호박(琥珀) 반지", shield: "황토 부적 주머니", seal: "황동 인장" },
  금: { base: "백은(白銀) 반지", money: "금속 종(風鈴) 서쪽 걸이", love: "진주(眞珠) 목걸이", shield: "청동 거울", seal: "백동(白銅) 도장" },
  수: { base: "흑요석(黑曜石) 팔찌", money: "검정 가죽 장지갑 + 북쪽 수경식물", love: "청금석(라피스) 팔찌", shield: "먹색 염주", seal: "흑단(黑檀) 인장" },
};

/* ───────────────────────── 월운 점수 ───────────────────────── */

type Mode = "general" | "loss" | ConcernKey | WishKey;
type Weights = Partial<Record<TenGod, number>>;

const BASE_SHINSAL: Record<Shinsal, number> = {
  겁살: -3, 재살: -2.5, 천살: -2, 지살: 1, 년살: 1, 월살: -1, 망신살: -2, 장성살: 2, 반안살: 2, 역마살: 1, 육해살: -2, 화개살: 0,
};
const SHINSAL_BONUS: Partial<Record<Mode, Partial<Record<Shinsal, number>>>> = {
  reunion: { 년살: 3, 지살: 1, 망신살: -1 },
  career: { 역마살: 2.5, 장성살: 2, 반안살: 1.5 },
  debt: { 겁살: -2, 재살: -1.5, 반안살: 2 },
  business: { 역마살: 2, 지살: 1.5, 장성살: 1 },
  prime: { 장성살: 2, 반안살: 1.5, 화개살: 1 },
  wealth: { 반안살: 2, 겁살: -2 },
  power: { 장성살: 3, 반안살: 2 },
  charm: { 년살: 4 },
  shield: { 겁살: -3, 재살: -3, 천살: -2, 육해살: -2 },
  loss: { 겁살: -3, 재살: -2, 망신살: -1.5 },
  general: {},
};

function weightsFor(r: SajuResult, mode: Mode): Weights {
  const male = r.input.gender === "male";
  switch (mode) {
    case "reunion": return male ? { 정재: 3, 편재: 2.5, 정관: 0.5, 식신: 1, 겁재: -2, 비견: -1 } : { 정관: 3, 편관: 2, 정인: 1, 식신: 0.5, 상관: -2.5 };
    case "career": return { 정관: 3, 편관: 1.5, 정인: 2, 편인: 1, 식신: 0.5, 상관: -2, 겁재: -1 };
    case "debt": return { 정재: 2.5, 편재: 1.5, 식신: 1.5, 정관: 1, 겁재: -3.5, 비견: -2, 편인: -1 };
    case "business": return { 식신: 3, 편재: 3, 상관: 1.5, 정재: 1.5, 편관: 0.5, 편인: -1.5, 겁재: -1 };
    case "prime": return { 정관: 2, 정재: 2, 정인: 2, 식신: 2, 편재: 1.5, 편관: 0.5, 겁재: -1.5 };
    case "wealth": return { 편재: 4, 정재: 2, 식신: 2, 상관: 1, 겁재: -3, 비견: -1.5 };
    case "power": return { 정관: 4, 편관: 1.5, 정인: 2, 상관: -3, 겁재: -1 };
    case "charm": return { 식신: 2.5, 상관: 2.5, 편재: 1.5, 정재: 1, 편관: 0.5 };
    case "shield": return { 정인: 2.5, 편인: 1.5, 정관: 1, 비견: 1, 편관: -3, 상관: -1.5, 겁재: -1.5 };
    case "loss": return { 겁재: -4, 비견: -2.5, 편인: -1.5, 편관: -1.5, 정재: 2, 식신: 1 };
    default: return { 정관: 2, 정재: 2, 정인: 1.5, 식신: 1.5, 편재: 1.5, 편관: -0.5, 상관: -0.5, 겁재: -2, 비견: -1, 편인: 0 };
  }
}

export interface MonthScore {
  month: number;
  g: Ganzhi & { year: number; month: number };
  stemGod: TenGod;
  branchGod: TenGod;
  shinsal: Shinsal;
  score: number;
}

function scoreMonth(r: SajuResult, g: Ganzhi & { year: number; month: number }, mode: Mode): MonthScore {
  const me = r.dayMaster.stem;
  const meEl = r.dayMaster.element;
  const dayBranch = r.pillars[2].branch;
  const yearBranch = r.pillars[0].branch;
  const monthBranch = r.pillars[1].branch;
  const W = weightsFor(r, mode);
  const stemGod = tenGodOf(me, g.stem);
  const branchGod = tenGodOf(me, BRANCH_MAIN_STEM[g.branch]);
  const shinsal = shinsalOf(yearBranch, g.branch);
  const yong = remedyElementFor(r);
  const hui = generatedBy(yong);

  let s = (W[stemGod] ?? 0) + (W[branchGod] ?? 0) * 1.2;
  for (const el of [g.stemElement, g.branchElement]) {
    if (el === yong) s += 2;
    else if (el === hui) s += 0.8;
    if (r.strength.label === "신강" && (el === meEl || el === generatedBy(meEl))) s -= 1.2;
    if (r.strength.label === "신약" && el === overcomeBy(meEl)) s -= 1.2;
  }
  if (sixHarmonyOf(dayBranch) === g.branch) s += 3;
  if (clashOf(dayBranch) === g.branch) s -= 4;
  if (trineGroupOf(dayBranch) === trineGroupOf(g.branch) && dayBranch !== g.branch) s += 1.5;
  if (clashOf(yearBranch) === g.branch) s -= 1.5;
  if (clashOf(monthBranch) === g.branch) s -= 1.5;
  if (sixHarmonyOf(monthBranch) === g.branch) s += 1;
  if (stemsCombine(me, g.stem)) s += 2;
  if (CHEONEUL_BRANCHES[me].includes(g.branch)) s += 2;
  s += (SHINSAL_BONUS[mode]?.[shinsal] ?? 0) + BASE_SHINSAL[shinsal];
  // 세운 삼재 해에는 전반적 감점
  if (samjaeStage(yearBranch, yearGanzhi(g.year).branch)) s -= 0.8;
  // 결정론적 미세 타이브레이커 (일간·월 조합)
  s += ((me * 7 + g.month * 3 + dayBranch) % 5) * 0.01;
  return { month: g.month, g, stemGod, branchGod, shinsal, score: Math.round(s * 100) / 100 };
}

function scoreYear(r: SajuResult, year: number, mode: Mode): MonthScore[] {
  return Array.from({ length: 12 }, (_, i) => scoreMonth(r, monthGanzhi(year, i + 1), mode));
}
const best = (arr: MonthScore[], exclude: number[] = []) =>
  [...arr].filter((m) => !exclude.includes(m.month)).sort((a, b) => b.score - a.score || a.month - b.month)[0];
const worst = (arr: MonthScore[], exclude: number[] = []) =>
  [...arr].filter((m) => !exclude.includes(m.month)).sort((a, b) => a.score - b.score || a.month - b.month)[0];

/* ───────────────────────── 12개월 타임라인 ───────────────────────── */

export type MonthTier = "golden" | "danger" | "opportunity" | "rising" | "calm";
export interface MonthCard {
  month: number;
  ganzhi: string;
  ko: string;
  stemElement: Element;
  branchElement: Element;
  stemGod: TenGod;
  branchGod: TenGod;
  shinsal: Shinsal;
  tier: MonthTier;
  /** 월운 키워드 — 잠금 월(golden·danger)도 값은 채워지며, 공개 여부는 UI(해금 상태)가 결정 */
  keyword: string;
  score: number;
}
export interface YearTimeline {
  year: number;
  ganzhi: string;
  ko: string;
  samjae: SamjaeStage | null;
  months: MonthCard[];
  golden: number;
  danger: number;
}

const GROUP_KEYWORD: Record<TenGodGroup, string> = { 비겁: "인맥·경쟁·독립", 식상: "표현·기획·아이디어", 재성: "수입·계약·거래", 관성: "직책·시험·책임", 인성: "문서·학업·귀인" };
const SHINSAL_KEYWORD: Record<Shinsal, string> = {
  겁살: "지출·분실 경계", 재살: "구설·송사 경계", 천살: "돌발 변수 주의", 지살: "이동·변동", 년살: "매력·만남", 월살: "정체·답답함",
  망신살: "체면·실수 주의", 장성살: "주도권·승부", 반안살: "안정·승진", 역마살: "출장·이동·변화", 육해살: "피로·건강 관리", 화개살: "학습·내면·정리",
};
/** label: 범례·설명용 전체 명칭 / short: 월운 타일 배지용 짧은 명칭 (좁은 타일에서 글자가 쪼개지지 않도록) */
export const TIER_META: Record<MonthTier, { label: string; short: string; emoji: string }> = {
  golden: { label: "운기 최정점 황금의 달", short: "황금의 달", emoji: "👑" },
  danger: { label: "각별 주의 손재수의 달", short: "손재수의 달", emoji: "⚠️" },
  opportunity: { label: "기회", short: "기회", emoji: "🔥" },
  rising: { label: "상승", short: "상승", emoji: "📈" },
  calm: { label: "평온", short: "평온", emoji: "🌙" },
};

function buildTimeline(r: SajuResult, year: number): YearTimeline {
  const general = scoreYear(r, year, "general");
  const loss = scoreYear(r, year, "loss");
  const golden = best(general).month;
  const danger = worst(loss, [golden]).month;
  const open = general.filter((m) => m.month !== golden && m.month !== danger).sort((a, b) => b.score - a.score || a.month - b.month);
  const tierOf = new Map<number, MonthTier>();
  open.forEach((m, i) => tierOf.set(m.month, i < 3 ? "opportunity" : i < 7 ? "rising" : "calm"));
  tierOf.set(golden, "golden");
  tierOf.set(danger, "danger");
  const yg = yearGanzhi(year);
  return {
    year, ganzhi: yg.ganzhi, ko: yg.ko,
    samjae: samjaeStage(r.pillars[0].branch, yg.branch),
    golden, danger,
    months: general.map((m) => {
      const tier = tierOf.get(m.month)!;
      return {
        month: m.month, ganzhi: m.g.ganzhi, ko: m.g.ko, stemElement: m.g.stemElement, branchElement: m.g.branchElement,
        stemGod: m.stemGod, branchGod: m.branchGod, shinsal: m.shinsal, tier, score: m.score,
        keyword: `${GROUP_KEYWORD[TEN_GOD_GROUP[m.stemGod]]} · ${SHINSAL_KEYWORD[m.shinsal]}`,
      };
    }),
  };
}

/* ───────────────────────── 격국 · 귀인 · 관계 ───────────────────────── */

const GYEOK_NAME: Record<TenGod, string> = {
  비견: "건록격(建祿格)", 겁재: "양인격(羊刃格)", 식신: "식신격(食神格)", 상관: "상관격(傷官格)", 편재: "편재격(偏財格)",
  정재: "정재격(正財格)", 편관: "편관격(七殺格)", 정관: "정관격(正官格)", 편인: "편인격(偏印格)", 정인: "정인격(正印格)",
};
const GYEOK_VESSEL: Record<TenGodGroup, string> = {
  식상: "머리에서 나온 것을 상품으로 바꾸는 식상생재(食傷生財)의 그릇, 전형적인 자수성가 재벌형",
  재성: "돈의 흐름을 직접 쥐는 재성의 그릇, 사업가·투자자형",
  관성: "조직·브랜드·인허가를 등에 업어야 판이 커지는 관성의 그릇",
  인성: "지식·자격·콘텐츠·교육이 곧 자본이 되는 인성의 그릇",
  비겁: "동업·네트워크·플랫폼으로 세력을 모아 커지는 비겁의 그릇",
};

export interface Benefactor {
  yong: Element;
  hui: Element;
  consonants: [string, string];
  surnames: [string, string];
  zodiacs: string[];
}

type Relation = "충" | "육합" | "삼합" | "복음" | "무관";
function relationOf(a: number, b: number): Relation {
  if (clashOf(a) === b) return "충";
  if (sixHarmonyOf(a) === b) return "육합";
  if (a === b) return "복음";
  if (trineGroupOf(a) === trineGroupOf(b)) return "삼합";
  return "무관";
}

/* ───────────────────────── 메인 ───────────────────────── */

export interface PinpointReport {
  concern: ChoiceMeta<ConcernKey>;
  wish: ChoiceMeta<WishKey>;
  gyeokguk: string;
  benefactor: Benefactor;
  remedy: { element: Element; color: string; item: string; direction: string };
  concernTitle: string;
  concernSummary: string;
  concernParas: Paragraph[];
  wishParas: Paragraph[];
  timelines: YearTimeline[];
  /** 잠긴 항목 총수 */
  lockCount: number;
}

export function buildPinpoint(r: SajuResult): PinpointReport {
  const concern = CONCERNS.find((c) => c.key === r.input.concern) ?? CONCERNS[0];
  const wish = WISHES.find((w) => w.key === r.input.wish) ?? WISHES[0];
  const who = r.name ? `${r.name}님` : "당신";
  const me = r.dayMaster;
  const male = r.input.gender === "male";
  const c = r.tenGodCounts;
  const dj = r.pillars[2]; // 일주
  const mj = r.pillars[1]; // 월주
  const yj = r.pillars[0]; // 연주
  const yong = remedyElementFor(r);
  const hui = generatedBy(yong);
  const gisin = r.strength.label === "신약" ? overcomeBy(me.element) : me.element; // 기신(忌神) 근사
  const y26 = yearGanzhi(2026), y27 = yearGanzhi(2027);
  const rel26 = relationOf(dj.branch, y26.branch);
  const relM26 = relationOf(mj.branch, y26.branch);
  const sg26 = tenGodOf(me.stem, y26.stem), bg26 = tenGodOf(me.stem, BRANCH_MAIN_STEM[y26.branch]);
  const sg27 = tenGodOf(me.stem, y27.stem);
  const gyeokGod = mj.branchGod;
  const gyeokguk = GYEOK_NAME[gyeokGod];
  const cur = currentDaeun(r);
  const godCount = (g: TenGod) => r.pillars.reduce((n, p) => n + (p.stemGod === g ? 1 : 0) + (p.branchGod === g ? 1 : 0), 0);

  const benefactor: Benefactor = {
    yong, hui,
    consonants: [ELEMENT_CONSONANT[yong], ELEMENT_CONSONANT[hui]],
    surnames: [ELEMENT_SURNAMES[yong], ELEMENT_SURNAMES[hui]],
    zodiacs: CHEONEUL_BRANCHES[me.stem].map((b) => BRANCH_ANIMAL[b]),
  };
  const item = ELEMENT_ITEM[yong];
  const remedy = { element: yong, color: ELEMENT_COLOR_KO[yong], item: item.base, direction: ELEMENT_DIRECTION[yong] };

  const timelines = [buildTimeline(r, 2026), buildTimeline(r, 2027)];
  const t26 = timelines[0], t27 = timelines[1];

  // 잠금 토큰 생성기
  const surname1 = L("surname", `${benefactor.consonants[0]} 초성 (${benefactor.surnames[0]})`);
  const surname2 = L("surname", `${benefactor.consonants[1]} 초성 (${benefactor.surnames[1]})`);
  const color = L("color", remedy.color);
  const dir = L("direction", remedy.direction);
  const pattern = L("pattern", gyeokguk);
  const gold26 = Lm(t26.golden, 2026), gold27 = Lm(t27.golden, 2027), bad26 = Lm(t26.danger, 2026);

  const concernParas: Paragraph[] = [];
  let concernTitle = "", concernSummary = "";

  /* ── 재회/인연 ── */
  if (concern.key === "reunion") {
    const spouseStar: TenGodGroup = male ? "재성" : "관성";
    const spouseEl = male ? (ELEMENTS.find((e) => overcomeBy(e) === me.element) as Element) : overcomeBy(me.element);
    const n = c[spouseStar];
    const sc = scoreYear(r, 2026, "reunion"), sc27 = scoreYear(r, 2027, "reunion");
    const contact = best(sc).month, verdict = best(sc27).month;
    const friction = godCount("편관") > 0
      ? "원국 안에 편관(七殺)이 박혀 있어 관계가 깊어질수록 자존심 싸움이 반복되었고, 먼저 숙이는 쪽이 지는 게임처럼 느껴졌을 것입니다."
      : !male && godCount("상관") > 0
        ? "상관(傷官)이 관성을 치는 상관견관 구조라 말로 상대를 이기려다 정작 마음을 잃는 패턴이 되풀이되었습니다."
        : male && c.비겁 >= 2
          ? "비겁이 재성을 두고 다투는 구조라 주변 사람·일·친구에게 마음이 분산되어 상대가 '우선순위가 아니다'라고 느꼈습니다."
          : "합(合)은 살아 있으나 결정적 순간마다 서로 먼저 손 내밀기를 기다리다 거리가 벌어진 유형입니다.";
    concernTitle = "이별 후 재회 · 인연의 타이밍 정밀 간명";
    concernSummary = `${rel26 === "충" ? "2026년 세운이 배우자궁을 정면으로 충(沖)하는 해 — 기운이 화합하는 시기를 가려야 합니다." : rel26 === "육합" || rel26 === "삼합" ? "2026년 세운이 배우자궁과 합(合)을 이루는 해 — 끊어진 줄이 다시 묶입니다." : "2026년 감정의 온도가 서서히 돌아오는 해 — 인연의 기운이 움직이는 '달'을 아는 것이 핵심입니다."}`;
    concernParas.push({
      heading: "원국 진단 — 왜 헤어졌고, 왜 아직 끝나지 않았는가",
      segments: P`${who}의 일간 ${me.title}에게 연인·배우자의 별은 ${spouseStar}, 곧 ${spouseEl}(${ELEMENT_HANJA[spouseEl]}) 기운입니다. 원국에 ${spouseStar}이 ${n === 0 ? "드러나지 않아 인연이 세운(歲運)을 타고 특정 달에 집중적으로 들어오는 구조이며, 평소에는 잠잠하다가 그 달에 기운이 화합합니다" : n >= 3 ? `${n}개로 넘쳐 선택지는 많았으나 한 사람에게 정착하는 힘이 약했고, 상대 역시 당신의 주변을 늘 의식했습니다` : `${n}개로 안정적이라 인연의 끈은 질긴 편입니다. 끝났다고 느끼는 지금도 두 명식의 합(合)은 아직 살아 있습니다`}. 배우자 자리인 일지(日支) ${dj.branchHanja}(${dj.branchKo})에는 ${dj.branchGod}이 앉아 있고, ${friction}`,
    });
    concernParas.push({
      heading: "2026 丙午 · 2027 丁未 — 연락이 오는 달, 결말이 나는 달",
      segments: P`2026 병오(丙午)년의 세운 午(오) 기운은 ${who}의 일지 ${dj.branchHanja} 글자와 ${rel26 === "충" ? "정면으로 충(沖)합니다. 상반기는 감정이 거칠어지는 구간이라 먼저 연락하는 것은 운기에 맞지 않습니다" : rel26 === "육합" ? "육합(六合)을 이룹니다. 끊어진 줄이 다시 묶이는 해로, 상대가 당신을 떠올리는 빈도가 급격히 늘어납니다" : rel26 === "삼합" ? "삼합(三合)으로 결속합니다. 공통 지인·모임을 통해 자연스럽게 재접촉이 일어나는 해입니다" : rel26 === "복음" ? "같은 글자로 겹치는 복음(伏吟)입니다. 과거가 그대로 반복되기 쉬우니 전과 다른 방식으로 접근해야 합니다" : "직접 부딪치지 않아 감정의 온도가 서서히 되돌아옵니다"}. 천간 丙은 ${sg26}, 지지 午는 ${bg26}으로 작용해 ${TEN_GOD_GROUP[bg26] === spouseStar ? "배우자의 별이 세운으로 직접 들어오는 해입니다" : "상대의 마음을 흔드는 간접 기운으로 작용합니다"}. 명리학 간명 기준으로 상대 쪽에서 인연의 기운이 먼저 움직이는 시점은 ${Lm(contact)}이며, 2027 정미(丁未)년 ${Lm(verdict)}에 재결합 혹은 완전한 정리, 둘 중 하나로 기운이 갈무리되는 시기입니다.`,
    });
    concernParas.push({
      heading: "재회 성공률을 끌어올리는 비책 처방",
      segments: P`원국 내 ${yong}(${ELEMENT_HANJA[yong]}) 기운의 합(合)을 극대화하여 재회 운을 성사시키는 결정적 통로는 ${surname1} 지인입니다. 직접 연락보다 이 성씨의 지인을 거쳐 근황이 닿게 하십시오. 용신 ${yong}(${ELEMENT_HANJA[yong]})의 소리오행과 같은 성씨라 당신의 뜻이 가장 온전히 전해지는 인연입니다. 재회 당일에는 ${color} 소품을 몸에 지녀 ${gisin}(${ELEMENT_HANJA[gisin]}) 기신의 살(煞)을 피하고, 약속 장소는 현재 거주지 기준 ${dir}으로 잡으면 기운이 화합하기 좋습니다.`,
    });
  }

  /* ── 이직·퇴사·조직 갈등 ── */
  if (concern.key === "career") {
    const sc = scoreYear(r, 2026, "career");
    const sign = best(sc).month, avoid = worst(sc, [sign]).month;
    const gwan = c.관성;
    concernTitle = "이직·퇴사 · 조직 갈등 정밀 간명";
    concernSummary = relM26 === "충" ? "2026년 세운이 직장궁(월지)을 충(沖) — 자리 자체가 흔들리는 이동수의 해입니다." : relM26 === "육합" || relM26 === "삼합" ? "2026년 세운이 직장궁과 합(合) — 현 조직 안에서 직급·조건이 재조정되는 해입니다." : "2026년은 급변보다 내부 재배치의 해 — 서명하는 '달'이 승부를 가릅니다.";
    concernParas.push({
      heading: "원국 진단 — 지금의 갈등은 성격이 아니라 구조다",
      segments: P`${who}의 직장궁인 월지 ${mj.branchHanja}(${mj.branchKo})에는 ${mj.branchGod}이 앉아 격국은 ${pattern}입니다. 관성(官星)은 ${gwan === 0 ? "원국에 드러나지 않아 조직의 틀이 당신을 담기에 좁습니다. 상명하복보다 재량권이 큰 자리에서 운기가 살아나는 명식입니다" : gwan >= 3 ? `${gwan}개로 관살이 혼잡해 상사·규정·책임이 사방에서 눌러옵니다. 지금의 갈등은 성격 탓이 아니라 구조 탓이며, 옮겨도 '덜 누르는 곳'을 고르는 안목이 핵심입니다` : `${gwan}개로 승진 라인은 살아 있습니다. 문제는 속도이며, 당신을 끌어줄 인성(印星)의 통로가 ${c.인성 === 0 ? "비어 있어 추천·학연·자격이라는 뒷배가 없는 것이 발목을 잡습니다" : "열려 있어 윗사람의 추천이 발복(發福) 확률을 크게 높입니다"}`}. ${godCount("상관") > 0 && godCount("정관") > 0 ? "특히 상관(傷官)이 정관(正官)을 치는 상관견관(傷官見官) 구조라 바른말이 윗사람 눈 밖에 나는 패턴이 반복됩니다." : c.식상 >= 2 ? "식상이 강해 자기 방식에 대한 확신이 커, 지시받는 일 자체가 에너지를 갉아먹습니다." : c.비겁 >= 3 ? "비겁이 강해 동료가 곧 경쟁자이며, 공을 나눠 갖는 구조에서 늘 손해를 본다고 느낍니다." : "다만 식상이 과하지 않아 조직 적응력 자체는 좋은 편이라, 자리만 맞으면 오래 갑니다."}`,
    });
    concernParas.push({
      heading: "2026 丙午 — 서명해도 되는 달, 패를 보이면 안 되는 달",
      segments: P`2026년 세운 천간 丙은 ${who}에게 ${sg26}, 지지 午는 ${bg26}으로 들어옵니다. 午는 직장궁 ${mj.branchHanja} 글자와 ${relM26 === "충" ? "충(沖)을 이루어 자리 자체가 흔들리는 이동수(移動數)의 해입니다. 변화의 흐름을 거스르지 않는 것이 좋습니다" : relM26 === "육합" ? "육합(六合)을 이루어 현 조직에서 직급·조건이 재조정되는 해입니다. 이직보다 내부 협상이 유리합니다" : relM26 === "삼합" ? "삼합(三合)을 이루어 윗선의 재편과 함께 당신의 역할이 넓어지는 해입니다" : "직접 부딪치지 않아 급격한 변동보다 조용한 재배치가 일어나는 해입니다"}. 명리학 간명 기준 사직서·이직 계약서 서명에 운기가 최정점에 이르는 달은 ${Lm(sign)}이며, 반대로 면접·연봉 협상을 피하는 것이 좋은 기운 충돌의 달은 ${Lm(avoid)}입니다. 두 달의 기운 차이를 알고 움직이는 것이 발복 확률을 극대화하는 길입니다.`,
    });
    concernParas.push({
      heading: "당신을 끌어올리는 귀인과 비책",
      segments: P`${who}를 끌어올리는 귀인은 ${surname1} 윗사람 또는 헤드헌터이며, 띠로는 천을귀인(天乙貴人)에 해당하는 ${benefactor.zodiacs.join("·")}띠입니다. 면접·협상 당일에는 ${color} 포인트를 넥타이·스카프 등 목선 가까이 두고, 사무실 책상은 ${dir}을 등지고 앉으면 관살의 압박을 완화하는 데 도움이 됩니다. 이직 후 첫 90일 동안 책상 위에 둘 물상은 ${L("item", item.seal)}입니다.`,
    });
  }

  /* ── 새는 재물·빚 ── */
  if (concern.key === "debt") {
    const loss = scoreYear(r, 2026, "loss");
    const open = scoreYear(r, 2026, "debt");
    const lossM = worst(loss).month, openM = best(open, [lossM]).month;
    const bi = c.비겁, jae = c.재성;
    concernTitle = "밑 빠진 독 — 새는 재물·빚 정밀 간명";
    concernSummary = bi >= 2 ? "군겁쟁재(群劫爭財) — 재성이 흩어지는 통로가 투자보다 '사람'에 있는 명식입니다." : jae === 0 ? "재성 무(無) — 돈의 흐름을 눈에 보이게 하는 것이 보완책인 명식입니다." : r.strength.label === "신약" && jae >= 2 ? "재다신약(財多身弱) — 재물보다 일간의 힘을 먼저 키워야 하는 명식입니다." : "균형은 나쁘지 않습니다 — 문제는 특정 달에 집중되는 손재의 타이밍입니다.";
    concernParas.push({
      heading: "원국 진단 — 돈이 새는 구멍의 정체",
      segments: P`${who}의 원국에는 비겁(比劫) ${bi}개, 재성(財星) ${jae}개가 자리합니다. ${bi >= 2 ? "비겁이 재성을 두고 다투는 군겁쟁재(群劫爭財) 구조라, 당신의 돈은 투자 실패보다 동업·보증·가족·연인처럼 '사람'을 통해 새 나갑니다. 빌려주는 돈은 재성이 흩어지는 통로가 되기 쉽습니다" : jae === 0 ? "재성이 드러나지 않아 돈의 출입을 몸으로 느끼기 전에 이미 빠져나간 뒤입니다. 자동이체와 현금흐름표로 흐름을 눈에 보이게 하는 것이 보완책입니다" : r.strength.label === "신약" && jae >= 2 ? "돈은 많이 오가지만 일간이 약해 쥐면 흘리는 재다신약(財多身弱)입니다. 빚은 욕심이 아니라 체력 부족에서 오니, 몸이 지칠 때의 결제는 피하는 것이 좋습니다" : "재성과 비겁의 균형 자체는 나쁘지 않습니다. 문제는 타이밍이며, 특정 달에 집중되는 손재수의 시기를 피하는 것이 재물 보전의 핵심입니다"}. 일지 ${dj.branchHanja}의 ${dj.branchGod}은 ${TEN_GOD_GROUP[dj.branchGod] === "비겁" ? "배우자·동거인 자리에 비겁이 앉아 가까운 사람의 지출이 곧 내 지출이 되는 구조입니다" : TEN_GOD_GROUP[dj.branchGod] === "재성" ? "재성이 앉아 돈이 몸에 붙는 자리이나, 세운이 충하면 한 번에 크게 빠집니다" : TEN_GOD_GROUP[dj.branchGod] === "인성" ? "인성이 앉아 문서·보증·명의 대여로 인한 손재가 재물의 급소입니다" : TEN_GOD_GROUP[dj.branchGod] === "관성" ? "관성이 앉아 세금·벌금·과태료·소송 등 공적 지출이 재물의 급소입니다" : "식상이 앉아 체면·접대·취미 지출이 재물의 급소입니다"}.`,
    });
    concernParas.push({
      heading: "2026 丙午 — 손재수가 터지는 달, 돈줄이 트이는 달",
      segments: P`2026년 세운 午는 ${who}의 일지와 ${rel26 === "충" ? "충(沖)을 이루어 재물 창고의 문이 열렸다 닫히기를 반복하는 해" : rel26 === "육합" || rel26 === "삼합" ? "합(合)을 이루어 묶여 있던 돈이 풀리는 대신 유혹도 함께 늘어나는 해" : "직접 부딪치지 않아 급격한 손재보다 '조금씩 새는' 누수가 문제인 해"}이며, 천간 丙은 ${sg26}으로 ${TEN_GOD_GROUP[sg26] === "비겁" ? "탈재(奪財)의 기운이 세운으로 직접 들어와 올해 보증·동업은 운기에 맞지 않습니다" : TEN_GOD_GROUP[sg26] === "재성" ? "재성이 세운으로 들어와 들어오는 돈도, 나가는 돈도 함께 커지는 해입니다" : "재물의 통로를 간접적으로 흔듭니다"}. 손재수(損財數)가 가장 극심한 달은 ${Lm(lossM)}로, 이 달에는 보증·대출 연장·신규 카드 발급·고액 결제를 미루는 것이 좋습니다. 반대로 막힌 돈줄이 트이는 달은 ${Lm(openM)}이며, 채무 통합·금리 협상·연봉 협상은 이 달에 집중하면 기운이 화합합니다.`,
    });
    concernParas.push({
      heading: "밑 빠진 독을 메우는 비책 처방",
      segments: P`${who}의 독을 메우는 보완 오행은 ${yong}(${ELEMENT_HANJA[yong]})입니다. 지갑·통장 표지는 ${color}으로 바꾸고, 현관 안쪽 ${dir}에 ${L("item", item.money)}을 두어 겁재의 탈재를 막으십시오. 채무 재조정·대출 상담은 ${surname1} 담당자와 인연이 닿을 때 조건이 열리기 쉬우며, 돈을 빌려 달라는 사람 가운데 ${L("surname", `${ELEMENT_CONSONANT[gisin]} 초성 (${ELEMENT_SURNAMES[gisin]})`)} 성씨는 기신(忌神)의 소리오행이라 2026년 한 해 거리를 두는 것이 좋습니다.`,
    });
  }

  /* ── 독립 사업·스타트업·투자 ── */
  if (concern.key === "business") {
    const sc = scoreYear(r, 2026, "business"), loss = scoreYear(r, 2026, "loss"), sc27 = scoreYear(r, 2027, "business");
    const fraud = worst(loss).month, launch = best(sc, [fraud]).month, expand = best(sc27).month;
    const pj = godCount("편재"), sik = c.식상;
    concernTitle = "독립 사업 · 스타트업 · 신규 투자 정밀 간명";
    concernSummary = `${GYEOK_VESSEL[TEN_GOD_GROUP[gyeokGod]].split(",")[0]}입니다 — 상반기 사기수의 달을 피하면 하반기 문서운이 열리는 흐름입니다.`;
    concernParas.push({
      heading: "타고난 그릇 — 격국(格局)으로 본 사업가 명식",
      segments: P`${who}의 타고난 명식은 ${pattern}으로, ${GYEOK_VESSEL[TEN_GOD_GROUP[gyeokGod]]}입니다. 편재(偏財) ${pj}개 · 식상(食傷) ${sik}개 — ${sik === 0 ? "아이템을 돈으로 바꾸는 식상이 비어 있어 영업·마케팅을 맡아 줄 파트너가 식상의 빈자리를 채워 줍니다" : pj === 0 ? "편재가 없어 한 방을 노리는 투기성 투자는 맞지 않고, 식상이 만든 결과물을 정재(正財)처럼 차곡차곡 쌓는 구독·시스템형 사업이 그릇에 맞습니다" : pj >= 2 ? "편재가 두 개 이상이라 큰돈의 냄새를 맡는 감각은 타고났습니다. 문제는 들어온 만큼 나가는 속도이며, 재무를 쥘 사람을 따로 두어야 합니다" : "식상이 재성을 생하는 식상생재 라인이 살아 있어, 아이디어가 매출로 이어지는 속도가 남보다 빠릅니다"}. ${r.strength.label === "신약" ? "다만 일간이 약해 혼자 버티는 창업보다 공동 창업·투자 유치로 체력을 보강해야 그릇이 깨지지 않습니다." : r.strength.label === "신강" ? "일간이 강해 압박을 견디는 힘이 있으니 리스크가 큰 판에서 오히려 유리합니다." : "일간이 중화되어 확장과 수성의 균형 감각이 좋은 편입니다."}`,
    });
    concernParas.push({
      heading: "2026 丙午 — 문서 사기수의 달과 수억 대 문서가 열리는 달",
      segments: P`2026년 세운 午는 일지 ${dj.branchHanja} 글자와 ${rel26 === "충" ? "충(沖)을 이루어 동업·계약 관계가 깨지고 다시 맺어지는 격동의 해" : rel26 === "육합" || rel26 === "삼합" ? "합(合)을 이루어 사람과 자본이 모여드는 해" : "충돌 없이 흐르는 해"}이며, 천간 丙 ${sg26}·지지 午 ${bg26}의 기운이 사업의 판을 키웁니다. 다만 상반기 문서 사기수와 계약 손재가 도사리는 ${Lm(fraud)}을 피하면, 하반기 ${surname1} 동업자·투자자와의 인연에서 큰 문서운이 열리는 흐름입니다. 사업자 등록·법인 설립·투자 집행에 운기가 최정점에 이르는 달은 ${Lm(launch)}이며, 2호점·시리즈 투자 등 확장의 적기는 2027년 ${Lm(expand)}입니다.`,
    });
    concernParas.push({
      heading: "막힌 재물길을 뚫는 비책 처방전",
      segments: P`막힌 재물길을 뚫는 비책 처방전은 ${L("item", item.money)}입니다. 사무실·매장 출입구는 ${dir}을 향하게 하고, 로고·명함의 주조색을 ${color}으로 하면 ${yong}(${ELEMENT_HANJA[yong]}) 용신의 기운이 간판에 실립니다. 계약서 날인에 쓸 인장은 ${L("item", item.seal)}으로 바꾸고, 함께 움직일 두 번째 귀인은 ${surname2} 성씨입니다.`,
    });
  }

  /* ── 전성기 대운 ── */
  if (concern.key === "prime") {
    const scoreDaeun = (d: DaeunItem) =>
      (d.stemElement === yong ? 2 : d.stemElement === hui ? 1 : d.stemElement === gisin ? -1 : 0) +
      (d.branchElement === yong ? 2.2 : d.branchElement === hui ? 1.1 : d.branchElement === gisin ? -1.1 : 0) +
      (["정관", "정재", "정인", "식신"].includes(d.stemGod) ? 0.6 : 0) + (["정관", "정재", "정인", "식신"].includes(d.branchGod) ? 0.6 : 0);
    const ranked = [...r.daeun.items].sort((a, b) => scoreDaeun(b) - scoreDaeun(a) || a.startAge - b.startAge);
    const age = new Date().getFullYear() - r.solar.year + 1;
    const prime = ranked[0];
    const future = ranked.find((d) => d.endAge >= age && d.startAge !== prime.startAge) ?? ranked[1];
    const primePast = prime.endAge < age;
    const primeLock = L("age", `${prime.startAge}~${prime.endAge}세 ${prime.ganzhi} 대운`);
    const futureLock = L("age", `${future.startAge}~${future.endAge}세 ${future.ganzhi} 대운`);
    const relD = cur ? relationOf(cur.branch, y26.branch) : "무관";
    concernTitle = "인생의 전성기 — 대운(大運) 정밀 간명";
    concernSummary = cur ? `현재 ${cur.ganzhi} 대운 — ${primePast ? "첫 봉우리는 지났지만 두 번째 봉우리가 남아 있는 흐름입니다." : "진짜 전성기는 아직 오지 않았습니다."}` : "대운의 물길 위에서 세운이 겹치는 달이 인생을 바꿉니다.";
    concernParas.push({
      heading: "대운 진단 — 전성기는 언제 오는가",
      segments: P`${who}의 대운은 ${r.daeun.startAge}세 ${r.daeun.forward ? "순행" : "역행"}으로 흐르며, ${cur ? `현재 ${cur.startAge}~${cur.endAge}세 ${cur.ganzhi} 대운(${cur.stemGod}·${cur.branchGod}) 위에 서 있습니다` : "현재 대운 구간을 산출 중입니다"}. 용신(用神)은 ${yong}(${ELEMENT_HANJA[yong]}), 희신(喜神)은 ${hui}(${ELEMENT_HANJA[hui]})이며, 기신(忌神)은 ${gisin}(${ELEMENT_HANJA[gisin]})입니다. 9개 대운 가운데 용신·희신이 천간과 지지로 함께 들어오는 진짜 전성기는 ${primeLock} 대운입니다. ${primePast
        ? P`그 봉우리가 이미 지났다고 느끼신다면 절반만 맞습니다. 두 번째 봉우리는 ${futureLock} 대운에 다시 오며, 첫 번째보다 재물의 결실이 크게 맺히는 흐름입니다.`
        : P`그 이전까지의 시간은 낭비가 아니라 그릇을 넓히는 구간이며, 바로 앞 대운인 ${futureLock} 대운에서 판을 깔아 두면 전성기에 거둘 것이 많아집니다.`}`,
    });
    concernParas.push({
      heading: "2026 丙午 · 2027 丁未 — 인생 역전 황금의 달",
      segments: P`${cur ? `현재 대운 지지 ${BRANCHES[cur.branch]}(${BRANCHES_KO[cur.branch]}) 글자와 2026 세운 午는 ${relD === "충" ? "충(沖)을 이루어 큰 판이 흔들리는 해입니다. 위기이자 반전의 기회입니다" : relD === "육합" || relD === "삼합" ? "합(合)을 이루어 대운의 힘이 세운을 타고 현실로 내려오는 해입니다" : "충돌 없이 겹쳐 꾸준히 올라가는 해입니다"}. ` : ""}천간 丙 ${sg26}, 2027 丁 ${sg27}의 흐름 속에서 ${who}의 전성기로 올라서는 발판, 곧 운기 최정점의 황금의 달은 ${gold26}과 ${gold27}입니다. 반대로 대운·세운·월운이 서로 충(沖)하는 ${bad26}에는 이직·투자·결혼 같은 큰 결정은 피하는 것이 좋습니다. 기운이 화합하는 달을 골라 움직이는 것이 발복 확률을 극대화합니다.`,
    });
    concernParas.push({
      heading: "전성기를 앞당기는 귀인과 평생 물상",
      segments: P`전성기를 앞당기는 귀인은 ${surname1}·${surname2} 두 성씨이며, 천을귀인 띠인 ${benefactor.zodiacs.join("·")}띠와 함께할 때 일이 성사됩니다. 평생 지닐 비책 물상은 ${L("item", item.base)}이고, 거주·사무 공간의 ${dir}을 비워 두면 용신의 기운이 드나들기 좋습니다. 대운이 바뀌는 해의 생일 전후 100일 동안은 ${color} 계열을 가까이하십시오.`,
    });
  }

  /* ── 절대 기운 (wish) ── */
  const wishParas: Paragraph[] = [];
  if (wish.key === "wealth") {
    const el = ELEMENTS.find((e) => overcomeBy(e) === me.element) as Element;
    const n = godCount("편재");
    const m = best(scoreYear(r, 2026, "wealth")).month;
    wishParas.push({
      heading: "💰 일확천금 편재운(偏財運)",
      segments: P`편재(偏財)는 일간 ${me.title} 기준으로 극(剋)하는 ${el}(${ELEMENT_HANJA[el]}) 가운데 음양이 같은 별입니다. ${who}의 원국에 편재는 ${n === 0 ? "드러나지 않습니다. 큰 재물의 기회는 원국이 아니라 세운이 가져다주는 구조이니, 편재가 세운으로 들어오는 달에 움직이는 것이 발복 확률을 높입니다" : n >= 2 ? `${n}개로 큰돈의 냄새를 맡는 감각은 타고났습니다. 들어온 재물을 묶어 두는 물상이 보완책입니다` : "1개가 자리해 기회는 반드시 옵니다. 기운이 화합하는 '달'을 아는 것이 핵심입니다"}. 2026년 편재의 기운이 최정점에 이르는 달은 ${Lm(m)}이며, 들어온 편재를 붙잡아 두는 금고 물상은 ${L("item", item.money)}입니다.`,
    });
  }
  if (wish.key === "power") {
    const el = overcomeBy(me.element);
    const n = godCount("정관");
    const m = best(scoreYear(r, 2026, "power")).month;
    wishParas.push({
      heading: "👑 권력·승진 정관운(正官運)",
      segments: P`정관(正官)은 일간을 다스리는 ${el}(${ELEMENT_HANJA[el]}) 가운데 음양이 다른 별로, 직위·명예·공적 신용을 뜻합니다. ${who}의 원국에 정관은 ${n === 0 ? "드러나지 않아 승진은 조직의 사다리보다 외부 평판·자격·스카우트로 옵니다" : `${n}개 자리해 공적 자리가 당신을 찾는 구조입니다`}${godCount("편관") > 0 && n > 0 ? ". 다만 편관까지 섞인 관살혼잡(官殺混雜)이라 윗선이 둘로 갈려 인연의 선택이 승진 운기를 좌우합니다" : ""}. 2026~2027년 승진·발탁 사령이 내려오는 달은 ${Lm(m)}이며, 장성살(將星殺)이 서는 그 달에 지녀야 할 인장(印章) 물상은 ${L("item", item.seal)}입니다.`,
    });
  }
  if (wish.key === "charm") {
    const dh = dohwaBranchOf(yj.branch);
    const present = r.pillars.some((p) => p.branch === dh);
    const m = monthOfBranch(dh);
    const loveColor = ELEMENT_COLOR_KO[BRANCH_ELEMENT[dh]];
    wishParas.push({
      heading: "🌸 도화·인기·매력운(桃花運)",
      segments: P`${yj.branchHanja}(${BRANCH_ANIMAL[yj.branch]}띠)생인 ${who}의 도화(桃花)는 ${BRANCHES[dh]}(${BRANCHES_KO[dh]}) 기운이며 ${TRINE_LABEL[trineGroupOf(yj.branch)]}의 년살(年殺)에 해당합니다. ${present ? "원국에 도화가 이미 앉아 있어 타고난 매력 자본이 있습니다. 다만 도화가 세운의 충을 맞는 해에는 매력이 구설로 흐르기 쉬우니 노출의 강약을 조절하는 것이 좋습니다" : "원국에 도화가 없어 매력은 세운·월운의 도화월에 집중적으로 피어납니다. 평소보다 그 달에 주변의 시선이 달라지는 흐름입니다"}. 2026년 도화가 서는 달은 ${Lm(m)}이며, 그 달 이성과 대중의 시선을 끌어오는 색은 ${L("color", loveColor)}, 몸에 지닐 물상은 ${L("item", item.love)}입니다.`,
    });
  }
  if (wish.key === "shield") {
    const s26 = samjaeStage(yj.branch, y26.branch), s27 = samjaeStage(yj.branch, y27.branch);
    const gm = monthOfBranch(geopsalBranchOf(yj.branch)), jm = monthOfBranch(jaesalBranchOf(yj.branch));
    wishParas.push({
      heading: "🛡️ 액운·삼재 소멸운",
      segments: P`${BRANCH_ANIMAL[yj.branch]}띠 기준 ${!s26 && !s27 ? "2026 병오년·2027 정미년은 모두 삼재 해가 아니라 액이 '해'가 아닌 '달' 단위로 들어옵니다" : `2026 병오년은 ${s26 ? `${s26}(三災)에 해당해 ${s26 === "들삼재" ? "액이 들어오는 첫해라 새 일보다 지키는 쪽이 유리하고" : s26 === "눌삼재" ? "액이 머무는 해라 건강과 소송을 특히 조심해야 하며" : "액이 나가는 해라 마무리와 정리에 좋고"}` : "삼재가 아니며"}, 2027 정미년은 ${s27 ? `${s27}입니다` : "삼재가 아닙니다"}`}. 관살(官殺)은 원국에 ${c.관성}개로 ${c.관성 >= 3 ? "압박이 과해 사고·질병·관재가 몸으로 옵니다" : c.관성 === 0 ? "없어 외부 압박은 적으나 세운 관살이 들어올 때 보완이 필요합니다" : "적절해 큰 액은 세운의 겁살·재살 달에만 집중됩니다"}. 2026년 겁살(劫煞)이 서는 달은 ${Lm(gm)}, 재살(災煞)의 달은 ${Lm(jm)}로 이 두 달에는 원행·수술·고액 계약을 피하는 것이 좋습니다. 액운을 소멸하는 비책 물상은 ${L("item", item.shield)}이며, 부적 대신 지닐 색은 ${color}입니다.`,
    });
  }

  const lockCount =
    [...concernParas, ...wishParas].reduce((n, p) => n + p.segments.filter(isLock).length, 0) + timelines.length * 2;

  return { concern, wish, gyeokguk, benefactor, remedy, concernTitle, concernSummary, concernParas, wishParas, timelines, lockCount };
}

/** 공유 카드용 — 해당 연도 세운의 운기 키워드 (일간 십성 × 연지 기준 신살) */
export function yearKeyword(r: SajuResult, year: number): string {
  const y = yearGanzhi(year);
  const g = tenGodOf(r.dayMaster.stem, y.stem);
  return `${GROUP_KEYWORD[TEN_GOD_GROUP[g]]} × ${SHINSAL_KEYWORD[shinsalOf(r.pillars[0].branch, y.branch)]}`;
}

/** 세운 요약 (상단 뱃지용) */
export function yearGodSummary(r: SajuResult, year: number) {
  const y = yearGanzhi(year);
  return { ...y, stemGod: tenGodOf(r.dayMaster.stem, y.stem), branchGod: tenGodOf(r.dayMaster.stem, BRANCH_MAIN_STEM[y.branch]), yin: yinYangOf(y.stem) };
}
