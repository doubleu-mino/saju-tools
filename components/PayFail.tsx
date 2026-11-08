"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { clearPendingOrder } from "@/lib/unlock";

/** 토스 결제 실패 리다이렉트 페이지 — code·message 를 표시하고 결과 화면으로 돌려보냅니다. */
export default function PayFail() {
  const [info, setInfo] = useState<{ code: string; message: string; returnHref: string } | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const p = new URLSearchParams(window.location.search);
      const r = p.get("r") ?? "";
      clearPendingOrder();
      setInfo({
        code: p.get("code") ?? "UNKNOWN",
        message: p.get("message") ?? "결제가 완료되지 않았습니다.",
        returnHref: r ? `/?${r}` : "/",
      });
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-16 text-center">
      <div className="card ornament animate-rise rounded-2xl p-7">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#C2413B]/50 bg-[#C2413B]/10 text-fire-text"><XCircle size={30} /></div>
        <p className="mt-4 text-[11px] tracking-[0.35em] text-gold-2">PAYMENT FAILED</p>
        <h1 className="mt-1 text-2xl font-black text-fg">결제가 완료되지 않았습니다</h1>
        <p className="mt-3 text-sm leading-relaxed text-fg/70">{info?.message ?? "결제 정보를 확인하는 중…"}</p>
        {info && <p className="mt-1 text-[11px] text-fg/40">오류 코드 {info.code}</p>}
        <p className="mt-3 text-xs text-fg/50">결제 금액은 청구되지 않았습니다. 결과 화면에서 다시 시도하실 수 있습니다.</p>
        <Link href={info?.returnHref ?? "/"} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold-2/40 px-5 py-3 text-sm text-gold transition hover:bg-gold/10">결과 화면으로 돌아가기</Link>
      </div>
    </div>
  );
}
