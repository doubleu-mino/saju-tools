"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Link2, MessageCircle, Share2, Check } from "lucide-react";
import { SajuResult, ELEMENT_COLOR, ELEMENT_TEXT_ON, ELEMENT_HANJA, encodeInput, THEMES } from "@/lib/saju";

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

  // 공유 이미지 렌더링 (Canvas)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = 1080, H = 1350;
    c.width = W; c.height = H;

    // 배경
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0B0F19"); bg.addColorStop(1, "#141B2D");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 200, 10, W / 2, 200, 700);
    glow.addColorStop(0, "rgba(229,184,105,.18)"); glow.addColorStop(1, "rgba(229,184,105,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // 테두리
    ctx.strokeStyle = "rgba(197,160,89,.45)"; ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.strokeStyle = "rgba(197,160,89,.2)"; ctx.lineWidth = 1;
    ctx.strokeRect(56, 56, W - 112, H - 112);

    const serif = `"Noto Serif KR", "Nanum Myeongjo", "Apple SD Gothic Neo", serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#C5A059"; ctx.font = `500 26px ${serif}`;
    ctx.fillText("四 柱 八 字 · 萬 歲 曆", W / 2, 130);

    ctx.fillStyle = "#E5B869"; ctx.font = `900 64px ${serif}`;
    ctx.fillText(`${r.name ? `${r.name}님` : "나"}의 사주 원국`, W / 2, 215);

    ctx.fillStyle = "rgba(239,230,210,.7)"; ctx.font = `400 28px ${serif}`;
    ctx.fillText(`양력 ${r.solar.year}.${String(r.solar.month).padStart(2, "0")}.${String(r.solar.day).padStart(2, "0")} · ${r.input.gender === "male" ? "乾命" : "坤命"} · ${r.zodiac}띠`, W / 2, 268);

    // 기둥
    const pillars = [...r.pillars].reverse();
    const n = pillars.length;
    const cardW = 200, gap = 28;
    const totalW = n * cardW + (n - 1) * gap;
    let x = (W - totalW) / 2;
    const topY = 330;
    for (const p of pillars) {
      // 한지 카드
      ctx.fillStyle = "#F1E7CF";
      roundRect(ctx, x, topY, cardW, 520, 22); ctx.fill();
      if (p.key === "day") { ctx.strokeStyle = "#E5B869"; ctx.lineWidth = 6; roundRect(ctx, x, topY, cardW, 520, 22); ctx.stroke(); }
      ctx.fillStyle = "#6b5a3c"; ctx.font = `600 22px ${serif}`;
      ctx.fillText(p.label, x + cardW / 2, topY + 44);

      const drawGlyph = (hanja: string, element: keyof typeof ELEMENT_COLOR, y: number, ko: string) => {
        ctx.fillStyle = ELEMENT_COLOR[element];
        roundRect(ctx, x + 30, y, cardW - 60, 140, 18); ctx.fill();
        ctx.fillStyle = ELEMENT_TEXT_ON[element]; ctx.font = `900 96px ${serif}`;
        ctx.fillText(hanja, x + cardW / 2, y + 104);
        ctx.fillStyle = "#3a3022"; ctx.font = `600 22px ${serif}`;
        ctx.fillText(`${ko} · ${element}(${ELEMENT_HANJA[element]})`, x + cardW / 2, y + 172);
      };
      drawGlyph(p.stemHanja, p.stemElement, topY + 70, p.stemKo);
      drawGlyph(p.branchHanja, p.branchElement, topY + 290, p.branchKo);
      x += cardW + gap;
    }

    // 일간 & 오행
    ctx.fillStyle = "#E5B869"; ctx.font = `700 34px ${serif}`;
    ctx.fillText(`일간 ${r.dayMaster.hanja} · ${r.dayMaster.title} · ${r.strength.label}`, W / 2, 920);

    const barY = 980, barW = 820, barH = 34;
    let bx = (W - barW) / 2;
    for (const e of r.elements) {
      const w = (e.count / Math.max(1, r.elements.reduce((s, v) => s + v.count, 0))) * barW;
      if (w > 0) {
        ctx.fillStyle = ELEMENT_COLOR[e.element]; ctx.fillRect(bx, barY, w, barH);
        if (w > 50) { ctx.fillStyle = ELEMENT_TEXT_ON[e.element]; ctx.font = `700 20px ${serif}`; ctx.fillText(`${ELEMENT_HANJA[e.element]} ${e.count}`, bx + w / 2, barY + 24); }
        bx += w;
      }
    }
    ctx.strokeStyle = "rgba(197,160,89,.5)"; ctx.lineWidth = 2; ctx.strokeRect((W - barW) / 2, barY, barW, barH);

    ctx.fillStyle = "rgba(239,230,210,.75)"; ctx.font = `400 26px ${serif}`;
    ctx.fillText(`강한 기운 ${r.strongest}(${ELEMENT_HANJA[r.strongest]})  ·  보충할 기운 ${(r.missing[0] ?? r.weakest)}(${ELEMENT_HANJA[r.missing[0] ?? r.weakest]})`, W / 2, 1070);

    const theme = THEMES.find((t) => t.key === r.input.theme)!;
    ctx.fillStyle = "rgba(239,230,210,.55)"; ctx.font = `400 24px ${serif}`;
    ctx.fillText(`관심 테마 · ${theme.label}`, W / 2, 1120);

    ctx.fillStyle = "#C5A059"; ctx.font = `600 24px ${serif}`;
    ctx.fillText("평생 무료 정통 만세력 · saju-tools", W / 2, 1250);
  }, [r]);

  const download = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.download = `saju-${r.solar.year}${String(r.solar.month).padStart(2, "0")}${String(r.solar.day).padStart(2, "0")}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  }, [r]);

  const copy = useCallback(async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }, [shareUrl]);

  const text = `${r.name ? `${r.name}님` : "나"}의 사주 원국 — ${r.pillars.map((p) => p.ganzhi).join(" ")} · 일간 ${r.dayMaster.title}`;

  const webShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "사주툴스 萬歲曆", text, url: shareUrl }); return; } catch { /* cancelled */ }
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
    <div className="grid gap-5 md:grid-cols-[minmax(0,360px)_1fr]">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-[#C5A059]/30 shadow-[0_12px_40px_rgba(0,0,0,.5)]" aria-label="사주 공유 카드 미리보기" />
      <div className="flex flex-col justify-center gap-3">
        <button onClick={kakao} className="flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-5 py-3.5 font-bold text-[#191919] transition hover:brightness-95">
          <MessageCircle size={18} fill="#191919" /> 카카오톡으로 공유
        </button>
        <button onClick={webShare} className="flex items-center justify-center gap-2 rounded-xl border border-[#C5A059]/40 bg-[#161D2E] px-5 py-3.5 font-semibold text-[#EFE6D2] transition hover:border-[#E5B869]">
          <Share2 size={18} /> SNS · 메신저로 공유
        </button>
        <button onClick={download} className="flex items-center justify-center gap-2 rounded-xl border border-[#C5A059]/40 bg-[#161D2E] px-5 py-3.5 font-semibold text-[#EFE6D2] transition hover:border-[#E5B869]">
          <Download size={18} /> 이미지로 저장 (1080×1350)
        </button>
        <button onClick={copy} className="flex items-center justify-center gap-2 rounded-xl border border-[#C5A059]/40 bg-[#161D2E] px-5 py-3.5 font-semibold text-[#EFE6D2] transition hover:border-[#E5B869]">
          {copied ? <Check size={18} className="text-[#2F9E8F]" /> : <Link2 size={18} />} {copied ? "링크가 복사되었습니다" : "결과 링크 복사"}
        </button>
        <p className="text-[11px] leading-relaxed text-[#EFE6D2]/40">
          공유 링크에는 이용자가 직접 선택한 생년월일·시간 정보만 URL 파라미터로 포함됩니다. 서버에는 어떤 정보도 저장되지 않으며, 링크를 공유할 상대를 신중히 선택해 주세요.
        </p>
      </div>
    </div>
  );
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
