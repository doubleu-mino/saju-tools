"use client";

import { useEffect, useRef, useState } from "react";
import { X, Lock, Check, Sparkles, Crown, Unlock, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import type { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { CONCERNS, type ConcernKey } from "@/lib/saju";
import { PLANS, PlanKey, UnlockState, planOf, won, savePendingOrder } from "@/lib/unlock";
import { SITE_NAME } from "@/lib/site";

interface Props {
  open: boolean;
  onClose: () => void;
  /** 결과 화면에서 보고 있는 테마 라벨 (예: 연애·인연) */
  themeLabel: string;
  /** 결과 화면에서 보고 있는 테마 키 — 단품 해금 테마의 기본값 */
  concern: ConcernKey;
  /** 결제 후 결과 화면 복귀용 쿼리 (encodeInput) */
  returnQuery: string;
  /** 사용자가 클릭한 자물쇠 힌트 (예: ??월) — 모달 헤드라인에 반영 */
  lockHint?: string | null;
  /** 리포트 내 잠긴 항목 수 */
  lockCount?: number;
  /** 이미 보유한 해금 상태 */
  owned?: UnlockState | null;
}

/** 해금 시 열리는 7가지 VIP 비책 */
const VIP_ITEMS = [
  "🔒 24개월 타임라인 중 황금의 달 & 절대 조심 손재수의 달 즉시 확인",
  "테마별 결정적 월(月) — 연락·서명·집행·갈무리의 운기 최정점 시기",
  "비전 간명식 — 용신·희신 소리오행으로 산출한 귀인 성씨 초성 2종",
  "천을귀인 띠 · 피해야 할 성씨 · 동업자/담당자 인연 판별",
  "삼재·관살·손재수를 무력화하는 보완 오행 · 비책 물상(物象)",
  "격국(格局)·용신·희신·기신 전문 간명 + 길방위·색상 처방",
  "12개월 월운 타임라인 전체 해금 + 월별 실천 처방 캘린더",
];

/** 토스페이먼츠 결제위젯 테스트 클라이언트 키 (공식 문서 공개 키). 운영 전환 시 환경변수로 교체. */
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const IS_TEST_KEY = TOSS_CLIENT_KEY.startsWith("test_");

export default function VipModal({ open, onClose, ...rest }: Omit<Props, "open"> & { open: boolean }) {
  if (!open) return null;
  return <VipModalBody onClose={onClose} {...rest} />;
}

type WidgetStatus = "loading" | "ready" | "error";

/** 열릴 때마다 새로 마운트되어 위젯·상태가 초기화됩니다. */
function VipModalBody({ onClose, themeLabel, concern, returnQuery, lockHint, lockCount, owned }: Omit<Props, "open">) {
  const ownsSingle = owned?.plan === "single";
  const [planKey, setPlanKey] = useState<PlanKey>("full");
  const plan = planOf(planKey) ?? PLANS[1];
  /** 단품 해금권을 적용할 테마 — 폼의 2차 심층 질문 4개 테마와 동일한 목록 */
  const [singleConcern, setSingleConcern] = useState<ConcernKey>(concern);
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>("loading");
  const [agreed, setAgreed] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsRef = useRef<ReturnType<PaymentWidgetInstance["renderPaymentMethods"]> | null>(null);

  // ESC 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  // 토스 결제위젯 로드 + 렌더 (SSR 회피를 위해 동적 import)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { loadPaymentWidget, ANONYMOUS } = await import("@tosspayments/payment-widget-sdk");
        const widget = await loadPaymentWidget(TOSS_CLIENT_KEY, ANONYMOUS);
        if (cancelled) return;
        widgetRef.current = widget;
        const initial = planOf("full")!;
        methodsRef.current = widget.renderPaymentMethods("#toss-payment-methods", { value: initial.price }, { variantKey: "DEFAULT" });
        const agreement = widget.renderAgreement("#toss-agreement", { variantKey: "AGREEMENT" });
        agreement.on("change", (s) => setAgreed(s.agreedRequiredTerms));
        methodsRef.current.on("ready", () => { if (!cancelled) setWidgetStatus("ready"); });
      } catch (e) {
        console.error("[unselog] toss widget load failed", e);
        if (!cancelled) setWidgetStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 플랜 변경 시 위젯 금액 갱신
  useEffect(() => {
    methodsRef.current?.updateAmount(plan.price);
  }, [plan.price]);

  const pay = async () => {
    const widget = widgetRef.current;
    if (!widget || paying) return;
    setError(null);
    setPaying(true);
    const orderId = `UL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    // 단품은 고른 테마에만 적용되므로, 결제 후 그 테마의 결과 화면으로 돌아가도록 복귀 쿼리의 테마(q)를 맞춘다
    const target = plan.key === "single" ? singleConcern : concern;
    const back = new URLSearchParams(returnQuery);
    back.set("q", target);
    const backQuery = back.toString();
    savePendingOrder({ orderId, plan: plan.key, amount: plan.price, concern: target, returnQuery: backQuery, createdAt: Date.now() });
    const origin = window.location.origin;
    const ctx = `plan=${plan.key}&c=${encodeURIComponent(target)}&r=${encodeURIComponent(backQuery)}`;
    try {
      await widget.requestPayment({
        orderId,
        orderName: plan.orderName,
        successUrl: `${origin}/pay/success/?${ctx}`,
        failUrl: `${origin}/pay/fail/?${ctx}`,
      });
    } catch (e) {
      const err = e as { code?: string; message?: string };
      if (err?.code === "USER_CANCEL") setError("결제가 취소되었습니다. 다시 시도하실 수 있습니다.");
      else setError(err?.message ?? "결제창을 여는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setPaying(false);
    }
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
        <p className="mt-4 text-center text-[11px] tracking-[0.35em] text-gold-2">{SITE_NAME.toUpperCase()} · VIP 看命 解禁</p>
        <h3 id="vip-modal-title" className="gold-text mt-1 text-center text-xl font-black leading-tight sm:text-2xl">
          잠긴 결정적 값을<br />데이터 그대로 엽니다
        </h3>
        <p className="mt-2 text-center text-[13px] font-semibold text-fg/80">좋은 달만 고르지 않습니다. 손재수의 달까지 2026-2027 그대로 보여드립니다.</p>
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
            <li key={t} className={`flex gap-2 ${i === 0 ? "-mx-1.5 -mt-1 rounded-lg border border-gold/50 bg-gold/15 px-1.5 py-1.5 font-bold text-gold-light" : ""}`}>
              <Unlock size={13} className="mt-0.5 shrink-0 text-gold" />
              <span><span className="mr-1 text-gold-2">{String(i + 1).padStart(2, "0")}</span>{t}</span>
            </li>
          ))}
        </ul>

        {/* 2티어 결제 옵션 */}
        <div role="radiogroup" aria-label="해금 옵션 선택" className="mt-4 space-y-2">
          {PLANS.map((pl, i) => {
            const active = pl.key === planKey;
            const disabled = ownsSingle && pl.key === "single";
            return (
              <div key={pl.key}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={disabled || paying}
                  onClick={() => setPlanKey(pl.key)}
                  className={`relative w-full rounded-xl border p-3.5 text-left transition disabled:opacity-50 ${
                    active ? "border-gold bg-gold/15 shadow-[inset_0_0_14px_rgba(229,184,105,.18)]" : "border-gold-2/25 bg-ink/50 hover:border-gold-2/60"
                  }`}
                >
                  {pl.badge && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-2 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-on-gold shadow">{pl.badge}</span>
                  )}
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${active ? "border-gold bg-gold" : "border-fg/35"}`}>
                      {active && <Check size={11} className="text-on-gold" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className={`text-sm font-bold ${active ? "text-gold-light" : "text-fg/85"}`}><span className="mr-1 text-[11px] text-gold-2">옵션 {i + 1}</span>{pl.title}</span>
                        <span className="flex items-baseline gap-1.5">
                          {pl.original && <span className="text-[11px] text-fg/45 line-through">정가 {won(pl.original)}</span>}
                          <span className={`text-lg font-black ${active ? "text-gold-light" : "text-fg/85"}`}>{won(pl.price)}</span>
                          {pl.original && <span className="rounded-full bg-[#C2413B] px-1.5 py-0.5 text-[10px] font-bold text-white">{Math.round((1 - pl.price / pl.original) * 100)}% 할인</span>}
                        </span>
                      </span>
                      <span className="mt-1 block text-[12px] leading-snug text-fg/60">{disabled ? "이미 보유 중인 해금권입니다. 풀패키지로 업그레이드할 수 있습니다." : pl.desc}</span>
                    </span>
                  </div>
                </button>
                {pl.key === "single" && active && !disabled && (
                  <div role="group" aria-label="단품 해금 테마 선택" className="mt-2 rounded-xl border border-gold-2/25 bg-ink/40 p-2.5">
                    <p className="mb-2 break-keep text-[11px] text-fg/55">해금할 테마 1개를 고르세요 <span className="text-fg/40">(결제 후 해당 테마 결과로 이동)</span></p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CONCERNS.map((c) => {
                        const on = c.key === singleConcern;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            aria-pressed={on}
                            disabled={paying}
                            onClick={() => setSingleConcern(c.key)}
                            className={`flex items-center gap-1.5 rounded-lg border px-2 py-2 text-left text-[12px] font-semibold leading-tight transition ${
                              on ? "border-gold bg-gold/15 text-gold-light" : "border-gold-2/25 bg-ink/50 text-fg/70 hover:border-gold-2/60"
                            }`}
                          >
                            <span className="leading-none" aria-hidden="true">{c.emoji}</span>
                            <span className="min-w-0 flex-1 break-keep">{c.short}</span>
                            {on && <Check size={12} className="shrink-0 text-gold" strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 토스페이먼츠 결제위젯 */}
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] tracking-wider text-gold-2"><CreditCard size={12} /> 결제 수단 선택 {IS_TEST_KEY && <span className="rounded-full border border-gold-2/40 px-1.5 py-0.5 text-[10px] text-fg/55">테스트 모드 · 실제 청구 없음</span>}</p>
          {widgetStatus === "loading" && (
            <p className="flex items-center justify-center gap-2 rounded-xl border border-gold-2/25 bg-ink/50 py-6 text-xs text-fg/55"><Loader2 size={14} className="animate-spin text-gold" /> 결제 수단을 불러오는 중…</p>
          )}
          {widgetStatus === "error" && (
            <p className="rounded-xl border border-[#C2413B]/50 bg-[#C2413B]/10 px-3 py-3 text-xs leading-relaxed text-fire-text">결제 모듈을 불러오지 못했습니다. 광고 차단 확장이 켜져 있다면 잠시 해제한 뒤 새로고침해 주세요.</p>
          )}
          <div className={widgetStatus === "ready" ? "space-y-2" : "h-0 overflow-hidden"}>
            <div id="toss-payment-methods" className="toss-widget" />
            <div id="toss-agreement" className="toss-widget" />
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg border border-[#C2413B]/50 bg-[#C2413B]/10 px-3 py-2 text-xs text-fire-text">{error}</p>}

        <button
          type="button"
          onClick={pay}
          disabled={widgetStatus !== "ready" || !agreed || paying}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-2 px-5 py-3.5 text-sm font-bold text-on-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {paying ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />} {paying ? "결제창 여는 중…" : plan.cta}
        </button>
        <button type="button" onClick={onClose} disabled={paying} className="mt-2 w-full rounded-xl px-4 py-2 text-xs text-fg/50 transition hover:text-fg">
          괜찮아요, 다음에 볼게요
        </button>
        <p className="mt-2 flex items-start justify-center gap-1.5 text-center text-[10px] leading-relaxed text-fg/40">
          <ShieldCheck size={12} className="mt-0.5 shrink-0" />
          <span>결제는 토스페이먼츠 보안 결제창에서 진행되며 카드 정보는 {SITE_NAME}에 저장되지 않습니다. 결제 완료 즉시 이 기기의 브라우저에 해금 상태가 저장되어 자물쇠가 열립니다. 디지털 콘텐츠 특성상 해금 이후 환불은 <a href="/refund/" className="underline underline-offset-2">환불규정</a>을 따릅니다.</span>
        </p>
        <p className="mt-1 text-center text-[10px] text-fg/35"><Sparkles size={10} className="mr-0.5 inline text-gold" /> 로그인 없이 결제되며, 해금 기록은 결제한 브라우저에 보관됩니다. 브라우저 데이터를 지우면 주문번호로 복구를 요청해 주세요.</p>
      </div>
    </div>
  );
}
