"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SajuForm from "./SajuForm";
import LoadingCompass from "./LoadingCompass";
import SajuResult from "./SajuResult";
import TrustBadges from "./TrustBadges";
import { SajuInput, SajuResult as SajuResultType, calculateSaju, decodeInput, encodeInput } from "@/lib/saju";

type Stage = "form" | "loading" | "result";

export default function SajuApp() {
  const [stage, setStage] = useState<Stage>("form");
  const [input, setInput] = useState<SajuInput | null>(null);
  const [result, setResult] = useState<SajuResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const run = useCallback((i: SajuInput, pushUrl = true) => {
    setInput(i);
    setError(null);
    setStage("loading");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      try {
        const r = calculateSaju(i);
        setResult(r);
        setStage("result");
        if (pushUrl) window.history.replaceState(null, "", `${window.location.pathname}?${encodeInput(i)}`);
      } catch (e) {
        setError((e as Error).message);
        setStage("form");
      }
    }, 1500);
  }, []);

  // 공유 링크로 진입한 경우 자동 분석
  useEffect(() => {
    const decoded = decodeInput(window.location.search);
    if (!decoded) return;
    const id = window.setTimeout(() => run(decoded, false), 0);
    return () => window.clearTimeout(id);
  }, [run]);

  const reset = () => {
    setStage("form");
    setResult(null);
    window.history.replaceState(null, "", window.location.pathname);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={topRef} className="scroll-mt-20">
      {stage === "form" && (
        <>
          {error && <p className="mb-4 rounded-lg border border-[#C2413B]/50 bg-[#C2413B]/10 px-3 py-2 text-sm text-[#F5B5B0]">{error}</p>}
          <SajuForm initial={input} onSubmit={run} />
        </>
      )}
      {stage === "loading" && <LoadingCompass />}
      {stage === "result" && result && <SajuResult result={result} onReset={reset} />}
      <div className="mt-8"><TrustBadges compact /></div>
    </div>
  );
}
