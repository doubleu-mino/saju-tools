"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Unlock, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import { normalizeConcern } from "@/lib/saju";
import { planOf, won, saveUnlock, readPendingOrder, clearPendingOrder, type Plan } from "@/lib/unlock";

type State =
  | { kind: "pending" }
  | { kind: "ok"; plan: Plan; orderId: string; paymentKey: string; returnHref: string }
  | { kind: "bad"; reason: string; returnHref: string };

/**
 * 토스 결제 성공 리다이렉트 페이지.
 * 토스가 successUrl 뒤에 paymentKey·orderId·amount 를 붙여 돌려보냅니다.
 * 정적 사이트이므로 서버 결제 승인(confirm) 없이 금액·주문번호를 대조한 뒤 브라우저에 해금 상태를 저장합니다.
 */
export default function PaySuccess() {
  const [state, setState] = useState<State>({ kind: "pending" });

  useEffect(() => {
    // 리다이렉트 파라미터 판독은 마운트 후 비동기 콜백에서 수행 (SSR 불일치·동기 setState 회피)
    const id = window.setTimeout(() => setState(resolveFromUrl()), 0);
    return () => window.clearTimeout(id);
  }, []);

  return <SuccessView state={state} />;
}

function resolveFromUrl(): State {
    const p = new URLSearchParams(window.location.search);
    const planKey = p.get("plan");
    const plan = planOf(planKey);
    const orderId = p.get("orderId") ?? "";
    const paymentKey = p.get("paymentKey") ?? "";
    const amount = Number(p.get("amount"));
    const concern = normalizeConcern(p.get("c")) ?? undefined;
    const returnQuery = p.get("r") ?? "";
    const returnHref = returnQuery ? `/?${returnQuery}` : "/";

    if (!plan || !orderId || !paymentKey) {
      return { kind: "bad", reason: "결제 정보가 올바르지 않습니다. 결제가 완료되지 않았을 수 있습니다.", returnHref };
    }
    if (amount !== plan.price) {
      return { kind: "bad", reason: `결제 금액(${won(amount || 0)})이 상품 금액(${won(plan.price)})과 일치하지 않아 해금하지 않았습니다.`, returnHref };
    }
    const pending = readPendingOrder();
    if (pending && pending.orderId !== orderId) {
      return { kind: "bad", reason: "주문번호가 결제 요청과 일치하지 않습니다.", returnHref };
    }
    saveUnlock({ plan: plan.key, timestamp: Date.now(), orderId, concern: plan.key === "single" ? (normalizeConcern(pending?.concern) ?? concern) : undefined });
    clearPendingOrder();
    return { kind: "ok", plan, orderId, paymentKey, returnHref };
}

function SuccessView({ state }: { state: State }) {
  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-16 text-center">
      {state.kind === "pending" && (
        <p className="inline-flex items-center gap-2 text-sm text-fg/60"><Loader2 size={16} className="animate-spin text-gold" /> 결제 결과를 확인하는 중…</p>
      )}
      {state.kind === "ok" && (
        <div className="card ornament animate-rise rounded-2xl p-7">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-gold shadow-[0_0_28px_rgba(229,184,105,.3)]"><Unlock size={30} /></div>
          <p className="mt-4 text-[11px] tracking-[0.35em] text-gold-2">PAYMENT COMPLETE</p>
          <h1 className="gold-text mt-1 text-2xl font-black">해금이 완료되었습니다</h1>
          <p className="mt-3 text-sm leading-relaxed text-fg/70">
            <b className="text-gold-light">{state.plan.title.replace("👑 ", "")}</b> ({won(state.plan.price)})<br />
            이 브라우저에서 결과 화면의 자물쇠가 즉시 실제 계산값으로 열립니다.
          </p>
          <dl className="mt-4 rounded-xl border border-gold-2/25 bg-ink/50 p-3 text-left text-xs text-fg/60">
            <div className="flex justify-between gap-3"><dt>주문번호</dt><dd className="font-mono text-fg/85">{state.orderId}</dd></div>
            <div className="mt-1 flex justify-between gap-3"><dt>결제키</dt><dd className="truncate font-mono text-fg/85">{state.paymentKey.slice(0, 18)}…</dd></div>
          </dl>
          <Link href={state.returnHref} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-2 px-5 py-3.5 text-sm font-bold text-on-gold transition hover:brightness-110">
            해금된 결과 보러 가기 <ChevronRight size={16} />
          </Link>
          <p className="mt-3 text-[10px] leading-relaxed text-fg/40">주문번호를 보관해 주세요. 브라우저 데이터를 지운 경우 주문번호로 복구를 요청할 수 있습니다.</p>
        </div>
      )}
      {state.kind === "bad" && (
        <div className="card ornament animate-rise rounded-2xl p-7">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#C2413B]/50 bg-[#C2413B]/10 text-fire-text"><AlertTriangle size={30} /></div>
          <h1 className="mt-4 text-xl font-black text-fire-text">해금을 진행하지 못했습니다</h1>
          <p className="mt-3 text-sm leading-relaxed text-fg/70">{state.reason}</p>
          <Link href={state.returnHref} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold-2/40 px-5 py-3 text-sm text-gold transition hover:bg-gold/10">결과 화면으로 돌아가기</Link>
        </div>
      )}
    </div>
  );
}
