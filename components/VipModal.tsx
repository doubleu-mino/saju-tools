"use client";

import { useEffect, useState } from "react";
import { X, Lock, BellRing, Check, Sparkles, Crown, Unlock } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  /** 선택한 고민 라벨 (예: 재회·인연) */
  themeLabel: string;
  /** 사용자가 클릭한 자물쇠 힌트 (예: ??월) — 모달 헤드라인에 반영 */
  lockHint?: string | null;
  /** 리포트 내 잠긴 항목 수 */
  lockCount?: number;
}

/** 해금 시 열리는 7가지 VIP 비책 */
const VIP_ITEMS = [
  "인생 역전 황금의 달 · 절대 조심 손재수의 달 (2026·2027)",
  "고민별 결정적 월(月) — 연락·서명·집행·결말의 정확한 달",
  "재벌가 비전 간명식 — 평생 부를 결정짓는 귀인 성씨 초성 2종",
  "천을귀인 띠 · 피해야 할 성씨 · 동업자/담당자 인연 판별",
  "삼재·관살·손재수를 무력화하는 보완 오행 · 비책 물상(物象)",
  "격국(格局)·용신·희신·기신 전문 간명 + 길방위·색상 처방",
  "12개월 월운 타임라인 전체 해금 + 월별 실천 처방 캘린더",
];

const WAITLIST_KEY = "myeongri-vip-waitlist";
/** 폼 수집 서비스(Formspree, Google Apps Script 등) 엔드포인트. 미설정 시 브라우저에만 저장됩니다. */
const WAITLIST_ENDPOINT = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT ?? "";

export default function VipModal({ open, onClose, themeLabel, lockHint, lockCount }: Props) {
  if (!open) return null;
  return <VipModalBody onClose={onClose} themeLabel={themeLabel} lockHint={lockHint} lockCount={lockCount} />;
}

/** 열릴 때마다 새로 마운트되어 입력·상태가 초기화됩니다. */
function VipModalBody({ onClose, themeLabel, lockHint, lockCount }: Omit<Props, "open">) {
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
          body: JSON.stringify({ email: v, theme: themeLabel, lock: lockHint ?? null, source: "myeongri-vip-waitlist", at: new Date().toISOString() }),
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
        className="card ornament animate-modal relative max-h-[94vh] w-full max-w-md overflow-y-auto rounded-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="닫기" className="absolute right-3 top-3 rounded-full p-1.5 text-fg/50 transition hover:bg-fg/10 hover:text-fg">
          <X size={18} />
        </button>

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/50 bg-gold/10 text-gold shadow-[0_0_28px_rgba(229,184,105,.3)]">
          <Crown size={26} />
        </div>
        <p className="mt-4 text-center text-[11px] tracking-[0.35em] text-gold-2">上位 1% · 財閥家 VIP 看命</p>
        <h3 id="vip-modal-title" className="gold-text mt-1 text-center text-xl font-black leading-tight sm:text-2xl">
          상위 1% 재벌가<br />VIP 간명 비책 해금
        </h3>
        <p className="mt-3 text-center text-sm leading-relaxed text-fg/70">
          {lockHint ? (
            <>방금 누르신 <span className="inline-lock !cursor-default"><Lock size={11} /> {lockHint}</span> 자리는 <b className="text-gold-light">{themeLabel}</b> 간명의 결정적 열쇠입니다.</>
          ) : (
            <><b className="text-gold-light">{themeLabel}</b> 간명에서 잠긴 결정적 열쇠를 한 번에 엽니다.</>
          )}
          {lockCount ? <> 리포트 안에 잠긴 항목은 모두 <b className="text-gold-light">{lockCount}곳</b>입니다.</> : null}
        </p>

        <ul className="mt-4 space-y-1.5 rounded-xl border border-gold-2/25 bg-ink/50 p-3.5 text-[13px] leading-snug text-fg/80">
          {VIP_ITEMS.map((t, i) => (
            <li key={t} className="flex gap-2">
              <Unlock size={13} className="mt-0.5 shrink-0 text-gold" />
              <span><span className="mr-1 text-gold-2">{String(i + 1).padStart(2, "0")}</span>{t}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm">
          <span className="inline-flex items-center gap-1.5 font-bold text-gold-light"><Sparkles size={14} /> 사전 예약 시 얼리버드 50% 할인</span>
          <p className="mt-1 text-xs text-fg/60">VIP 해금 오픈 즉시 할인 코드와 함께 내 간명 결과 링크를 이메일로 보내드립니다.</p>
        </div>

        {status === "done" ? (
          <div className="mt-5 rounded-xl border border-wood/40 bg-wood/10 p-4 text-center">
            <p className="inline-flex items-center gap-1.5 font-bold text-wood-text"><Check size={16} /> VIP 사전 예약이 완료되었습니다</p>
            <p className="mt-1 text-xs text-fg/60">해금 오픈 시 얼리버드 50% 코드를 가장 먼저 보내드립니다.</p>
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
              <BellRing size={16} /> {status === "sending" ? "신청 중…" : "얼리버드 50% 해금 사전 예약"}
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
