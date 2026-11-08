"use client";

import { useEffect, useState } from "react";
import { X, Lock, BellRing, Check, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  themeLabel: string;
}

const WAITLIST_KEY = "myeongri-vip-waitlist";
/** 폼 수집 서비스(Formspree, Google Apps Script 등) 엔드포인트. 미설정 시 브라우저에만 저장됩니다. */
const WAITLIST_ENDPOINT = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT ?? "";

export default function VipModal({ open, onClose, themeLabel }: Props) {
  if (!open) return null;
  return <VipModalBody onClose={onClose} themeLabel={themeLabel} />;
}

/** 열릴 때마다 새로 마운트되어 입력·상태가 초기화됩니다. */
function VipModalBody({ onClose, themeLabel }: Omit<Props, "open">) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setStatus("error"); return; }
    setStatus("sending");
    try {
      if (WAITLIST_ENDPOINT) {
        await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: v, theme: themeLabel, source: "myeongri-vip-waitlist", at: new Date().toISOString() }),
        });
      }
      const list: string[] = JSON.parse(localStorage.getItem(WAITLIST_KEY) ?? "[]");
      if (!list.includes(v)) localStorage.setItem(WAITLIST_KEY, JSON.stringify([...list, v]));
    } catch { /* 네트워크 실패 시에도 로컬 기록은 유지 */ }
    setStatus("done");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-modal-title"
    >
      <div
        className="card ornament animate-modal relative w-full max-w-md rounded-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="닫기" className="absolute right-3 top-3 rounded-full p-1.5 text-fg/50 transition hover:bg-fg/10 hover:text-fg">
          <X size={18} />
        </button>

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/50 bg-gold/10 text-gold">
          <Lock size={24} />
        </div>
        <p className="mt-4 text-center text-[11px] tracking-[0.35em] text-gold-2">VIP 精密 看命</p>
        <h3 id="vip-modal-title" className="gold-text mt-1 text-center text-xl font-black sm:text-2xl">
          VIP 정밀 간명 리포트<br />오픈 준비 중입니다
        </h3>
        <p className="mt-3 text-center text-sm leading-relaxed text-fg/70">
          2026–2027 세운·대운 교차 분석과 월별 길흉표를 담은 <b className="text-gold-light">{themeLabel}</b> 심층 비책 전문을 준비하고 있습니다.
        </p>
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm">
          <span className="inline-flex items-center gap-1.5 font-bold text-gold-light"><Sparkles size={14} /> 사전 예약 시 얼리버드 50% 할인</span>
          <p className="mt-1 text-xs text-fg/60">오픈 알림과 할인 코드를 이메일로 보내드립니다.</p>
        </div>

        {status === "done" ? (
          <div className="mt-5 rounded-xl border border-wood/40 bg-wood/10 p-4 text-center">
            <p className="inline-flex items-center gap-1.5 font-bold text-wood-text"><Check size={16} /> 알림 신청이 완료되었습니다</p>
            <p className="mt-1 text-xs text-fg/60">오픈 시 가장 먼저 소식을 전해드리겠습니다.</p>
            <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl border border-gold-2/40 px-4 py-2.5 text-sm text-gold transition hover:bg-gold/10">닫기</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
            <label className="block">
              <span className="sr-only">이메일 주소</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="알림 받을 이메일 주소"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                className="input-dark w-full"
                aria-invalid={status === "error"}
              />
            </label>
            {status === "error" && <p className="text-xs text-fire-text">올바른 이메일 주소를 입력해 주세요.</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-2 px-5 py-3 text-sm font-bold text-on-gold transition hover:brightness-110 disabled:opacity-60"
            >
              <BellRing size={16} /> {status === "sending" ? "신청 중…" : "오픈 알림 신청하기"}
            </button>
            <button type="button" onClick={onClose} className="w-full rounded-xl px-4 py-2 text-xs text-fg/50 transition hover:text-fg">
              괜찮아요, 다음에 볼게요
            </button>
            <p className="text-center text-[10px] leading-relaxed text-fg/40">
              입력하신 이메일은 오픈 알림 발송 목적으로만 사용되며 언제든 수신을 거부할 수 있습니다.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
