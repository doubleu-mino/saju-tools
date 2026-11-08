"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Link2, MessageCircle, Share2, Check } from "lucide-react";
import { SajuResult, ELEMENT_COLOR, ELEMENT_TEXT_ON, ELEMENT_HANJA, ELEMENTS, BRANCH_ANIMAL, Element, encodeInput } from "@/lib/saju";
import { yearKeyword } from "@/lib/pinpoint";
import { SITE_NAME, SITE_NAME_EN, SITE_DOMAIN } from "@/lib/site";

/* ───────── 수호 동물: 일간 오행의 색(靑赤黃白黑) + 일지 동물 ───────── */
const GUARDIAN_COLOR: Record<Element, [string, string]> = { 목: ["청", "靑"], 화: ["적", "赤"], 토: ["황", "黃"], 금: ["백", "白"], 수: ["흑", "黑"] };
const GUARDIAN_ANIMAL: [string, string][] = [["서", "鼠"], ["우", "牛"], ["호", "虎"], ["토", "兎"], ["룡", "龍"], ["사", "蛇"], ["마", "馬"], ["양", "羊"], ["원", "猿"], ["계", "鷄"], ["견", "犬"], ["돈", "豚"]];
export function guardianOf(r: SajuResult) {
  const [ck, ch] = GUARDIAN_COLOR[r.dayMaster.element];
  const b = r.pillars[2].branch;
  const [ak, ah] = GUARDIAN_ANIMAL[b];
  const ko = `${ck}${ak === "룡" && ck !== "청" ? "룡" : ak}`;
  return { ko, hanja: `${ch}${ah}`, animal: BRANCH_ANIMAL[b], element: r.dayMaster.element };
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: { sendDefault: (opts: Record<string, unknown>) => void };
    };
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";

export default function ShareCard({ result: r }: { result: SajuResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(
    () => (typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}?${encodeInput(r.input)}`),
    [r],
  );

  // 공유 이미지 렌더링 (Canvas) — 인스타그램 스토리 9:16 (1080×1920)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = 1080, H = 1920;
    c.width = W; c.height = H;
    const serif = `"Noto Serif KR", "Nanum Myeongjo", "Apple SD Gothic Neo", serif`;
    const guardian = guardianOf(r);
    const dayEl = r.dayMaster.element;
    const dayColor = ELEMENT_COLOR[dayEl] === "#3F4F73" ? "#7F93C9" : ELEMENT_COLOR[dayEl];

    // 배경 + 글로우
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0B0F19"); bg.addColorStop(0.55, "#111827"); bg.addColorStop(1, "#141B2D");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 420, 20, W / 2, 420, 760);
    glow.addColorStop(0, "rgba(229,184,105,.22)"); glow.addColorStop(1, "rgba(229,184,105,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    const glow2 = ctx.createRadialGradient(W / 2, 1500, 20, W / 2, 1500, 600);
    glow2.addColorStop(0, hexA(dayColor, .22)); glow2.addColorStop(1, hexA(dayColor, 0));
    ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);
    // 별빛
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 7919) % 1000) / 1000 * W, sy = ((i * 104729) % 1000) / 1000 * H;
      ctx.fillStyle = i % 3 ? "rgba(229,184,105,.35)" : "rgba(255,255,255,.3)";
      ctx.beginPath(); ctx.arc(sx, sy, i % 5 === 0 ? 2 : 1.2, 0, Math.PI * 2); ctx.fill();
    }
    // 테두리
    ctx.strokeStyle = "rgba(197,160,89,.5)"; ctx.lineWidth = 3; ctx.strokeRect(44, 44, W - 88, H - 88);
    ctx.strokeStyle = "rgba(197,160,89,.22)"; ctx.lineWidth = 1; ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.textAlign = "center";

    /* ── 상단: 엠블럼 ── */
    ctx.beginPath(); ctx.arc(W / 2, 170, 58, 0, Math.PI * 2);
    ctx.strokeStyle = "#E5B869"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, 170, 48, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(229,184,105,.4)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#E5B869"; ctx.font = `900 56px ${serif}`; ctx.fillText("運", W / 2, 190);
    ctx.fillStyle = "#C5A059"; ctx.font = `500 24px ${serif}`;
    ctx.fillText("U N S E L O G · 正 統 萬 歲 曆 · 24 個 月 타 임 라 인", W / 2, 268);

    /* ── 본원과 수호 동물 ── */
    ctx.fillStyle = "rgba(239,230,210,.6)"; ctx.font = `400 26px ${serif}`;
    ctx.fillText("나를 상징하는 본원과 수호 동물", W / 2, 330);
    // 수호 동물 원형 엠블럼
    const gy = 470;
    const ring = ctx.createRadialGradient(W / 2, gy, 40, W / 2, gy, 125);
    ring.addColorStop(0, hexA(dayColor, .55)); ring.addColorStop(1, hexA(dayColor, .08));
    ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(W / 2, gy, 125, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = dayColor; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W / 2, gy, 118, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#F3DFAE"; ctx.font = `900 92px ${serif}`; ctx.fillText(guardian.hanja, W / 2, gy + 34);
    ctx.fillStyle = "#E5B869"; ctx.font = `900 60px ${serif}`;
    ctx.fillText(`${guardian.ko}(${guardian.hanja})`, W / 2, 670);
    ctx.fillStyle = "rgba(239,230,210,.78)"; ctx.font = `500 28px ${serif}`;
    ctx.fillText(`${r.name ? `${r.name}님` : "나"}의 본원 ${r.dayMaster.hanja} ${r.dayMaster.title} · 일주 ${r.pillars[2].ganzhi} · ${r.strength.label}`, W / 2, 722);
    ctx.fillStyle = "rgba(239,230,210,.5)"; ctx.font = `400 24px ${serif}`;
    ctx.fillText(`양력 ${r.solar.year}.${String(r.solar.month).padStart(2, "0")}.${String(r.solar.day).padStart(2, "0")} · ${r.input.gender === "male" ? "乾命" : "坤命"} · ${r.zodiac}띠`, W / 2, 764);

    /* ── 중앙: 8글자 미니 패 ── */
    const pillars = [...r.pillars].reverse();
    const n = pillars.length;
    const cardW = 196, gap = 22, cardH = 372;
    const totalW = n * cardW + (n - 1) * gap;
    let x = (W - totalW) / 2;
    const topY = 820;
    for (const p of pillars) {
      ctx.fillStyle = "#F1E7CF"; roundRect(ctx, x, topY, cardW, cardH, 20); ctx.fill();
      if (p.key === "day") { ctx.strokeStyle = "#E5B869"; ctx.lineWidth = 6; roundRect(ctx, x, topY, cardW, cardH, 20); ctx.stroke(); }
      ctx.fillStyle = "#6b5a3c"; ctx.font = `600 22px ${serif}`; ctx.fillText(p.label, x + cardW / 2, topY + 40);
      const glyph = (hanja: string, element: Element, y: number, ko: string) => {
        ctx.fillStyle = ELEMENT_COLOR[element]; roundRect(ctx, x + 26, y, cardW - 52, 112, 16); ctx.fill();
        ctx.fillStyle = ELEMENT_TEXT_ON[element]; ctx.font = `900 80px ${serif}`; ctx.fillText(hanja, x + cardW / 2, y + 84);
        ctx.fillStyle = "#3a3022"; ctx.font = `600 20px ${serif}`; ctx.fillText(`${ko}·${element}(${ELEMENT_HANJA[element]})`, x + cardW / 2, y + 140);
      };
      glyph(p.stemHanja, p.stemElement, topY + 58, p.stemKo);
      glyph(p.branchHanja, p.branchElement, topY + 214, p.branchKo);
      x += cardW + gap;
    }

    /* ── 오행 대표 컬러 칩 ── */
    const chipY = 1245, chipW = 150, chipGap = 20;
    let cx = (W - (ELEMENTS.length * chipW + (ELEMENTS.length - 1) * chipGap)) / 2;
    for (const e of r.elements) {
      ctx.fillStyle = ELEMENT_COLOR[e.element]; roundRect(ctx, cx, chipY, chipW, 56, 14); ctx.fill();
      if (e.count === 0) { ctx.fillStyle = "rgba(11,15,25,.55)"; roundRect(ctx, cx, chipY, chipW, 56, 14); ctx.fill(); }
      ctx.fillStyle = e.count === 0 ? "rgba(239,230,210,.6)" : ELEMENT_TEXT_ON[e.element]; ctx.font = `700 24px ${serif}`;
      ctx.fillText(`${e.element}(${ELEMENT_HANJA[e.element]}) ${e.count}`, cx + chipW / 2, chipY + 37);
      cx += chipW + chipGap;
    }
    ctx.fillStyle = "rgba(239,230,210,.7)"; ctx.font = `400 24px ${serif}`;
    ctx.fillText(`강한 기운 ${r.strongest}(${ELEMENT_HANJA[r.strongest]})  ·  보충할 기운 ${r.missing[0] ?? r.weakest}(${ELEMENT_HANJA[r.missing[0] ?? r.weakest]})`, W / 2, 1348);

    /* ── 하단: 2026 티징 ── */
    const boxY = 1400, boxH = 300;
    ctx.fillStyle = "rgba(229,184,105,.08)"; roundRect(ctx, 80, boxY, W - 160, boxH, 26); ctx.fill();
    ctx.strokeStyle = "rgba(229,184,105,.55)"; ctx.lineWidth = 2; roundRect(ctx, 80, boxY, W - 160, boxH, 26); ctx.stroke();
    ctx.fillStyle = "#C5A059"; ctx.font = `500 24px ${serif}`;
    ctx.fillText("2026 丙午 · 나의 운기 반전 키워드", W / 2, boxY + 56);
    ctx.fillStyle = "#F3DFAE"; ctx.font = `900 42px ${serif}`;
    ctx.fillText(yearKeyword(r, 2026), W / 2, boxY + 118);
    ctx.strokeStyle = "rgba(229,184,105,.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(200, boxY + 156); ctx.lineTo(W - 200, boxY + 156); ctx.stroke();
    ctx.fillStyle = "rgba(239,230,210,.75)"; ctx.font = `500 27px ${serif}`;
    ctx.fillText("올해 꼭 잡아야 할 황금의 달", W / 2, boxY + 206);
    // 자물쇠 뱃지
    const bw = 300, bh = 58, bx0 = (W - bw) / 2, by0 = boxY + 226;
    ctx.fillStyle = "rgba(229,184,105,.18)"; roundRect(ctx, bx0, by0, bw, bh, 29); ctx.fill();
    ctx.setLineDash([8, 6]); ctx.strokeStyle = "rgba(229,184,105,.8)"; ctx.lineWidth = 2; roundRect(ctx, bx0, by0, bw, bh, 29); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#F3DFAE"; ctx.font = `800 30px ${serif}`;
    ctx.fillText("🔒 ??월 · VIP 간명 해금", W / 2, by0 + 40);

    /* ── 푸터 워터마크 ── */
    ctx.fillStyle = "rgba(239,230,210,.5)"; ctx.font = `400 24px ${serif}`;
    ctx.fillText("좋은 말로 위로하지 않습니다. 손재수의 달까지 데이터로 짚습니다.", W / 2, 1770);
    ctx.fillStyle = "#E5B869"; ctx.font = `700 30px ${serif}`;
    ctx.fillText(`내 사주 무료 간명하기  |  ${SITE_NAME} · ${SITE_DOMAIN}`, W / 2, 1826);
  }, [r]);

  const download = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.download = `unselog-${r.solar.year}${String(r.solar.month).padStart(2, "0")}${String(r.solar.day).padStart(2, "0")}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  }, [r]);

  const copy = useCallback(async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }, [shareUrl]);

  const guardian = guardianOf(r);
  const text = `${r.name ? `${r.name}님` : "나"}의 수호 동물은 ${guardian.ko}(${guardian.hanja}) — 사주 원국 ${r.pillars.map((p) => p.ganzhi).join(" ")} · 일간 ${r.dayMaster.title}`;

  const webShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${SITE_NAME} (${SITE_NAME_EN}) 사주 분석`, text, url: shareUrl }); return; } catch { /* cancelled */ }
    }
    copy();
  }, [shareUrl, text, copy]);

  const kakao = useCallback(() => {
    const go = () => {
      const K = window.Kakao;
      if (!K) return webShare();
      if (!K.isInitialized()) K.init(KAKAO_KEY);
      K.Share.sendDefault({
        objectType: "text",
        text,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        buttonTitle: "내 사주도 보기",
      });
    };
    if (!KAKAO_KEY) return webShare();
    if (window.Kakao) return go();
    const s = document.createElement("script");
    s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    s.crossOrigin = "anonymous";
    s.onload = go; s.onerror = () => webShare();
    document.head.appendChild(s);
  }, [shareUrl, text, webShare]);

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,300px)_1fr]">
      <canvas ref={canvasRef} className="mx-auto w-full max-w-[300px] rounded-2xl border border-gold-2/30 shadow-[0_12px_40px_rgba(0,0,0,.5)]" style={{ aspectRatio: "9 / 16" }} aria-label="사주 공유 카드 미리보기 (인스타그램 스토리 9:16)" />
      <div className="flex flex-col justify-center gap-3">
        <button onClick={kakao} className="flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-5 py-3.5 font-bold text-[#191919] transition hover:brightness-95">
          <MessageCircle size={18} fill="#191919" /> 카카오톡으로 공유
        </button>
        <button onClick={webShare} className="flex items-center justify-center gap-2 rounded-xl border border-gold-2/40 bg-ink-3 px-5 py-3.5 font-semibold text-fg transition hover:border-gold">
          <Share2 size={18} /> SNS · 메신저로 공유
        </button>
        <button onClick={download} className="flex items-center justify-center gap-2 rounded-xl border border-gold-2/40 bg-ink-3 px-5 py-3.5 font-semibold text-fg transition hover:border-gold">
          <Download size={18} /> 스토리 이미지로 저장 (1080×1920)
        </button>
        <button onClick={copy} className="flex items-center justify-center gap-2 rounded-xl border border-gold-2/40 bg-ink-3 px-5 py-3.5 font-semibold text-fg transition hover:border-gold">
          {copied ? <Check size={18} className="text-[#2F9E8F]" /> : <Link2 size={18} />} {copied ? "링크가 복사되었습니다" : "결과 링크 복사"}
        </button>
        <p className="text-[11px] leading-relaxed text-fg/40">
          공유 링크에는 이용자가 직접 선택한 생년월일·시간 정보만 URL 파라미터로 포함됩니다. 서버에는 어떤 정보도 저장되지 않으며, 링크를 공유할 상대를 신중히 선택해 주세요.
        </p>
      </div>
    </div>
  );
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
