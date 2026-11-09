"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SajuForm from "./SajuForm";
import LoadingCompass from "./LoadingCompass";
import SajuResult from "./SajuResult";
import TrustBadges from "./TrustBadges";
import QuickCards from "./QuickCards";
import { HOME_RESET_EVENT } from "./HomeLink";
import { SajuInput, SajuResult as SajuResultType, ConcernKey, calculateSaju, decodeInput, encodeInput } from "@/lib/saju";

type Stage = "form" | "loading" | "result";

export default function SajuApp() {
  const [stage, setStage] = useState<Stage>("form");
  const [input, setInput] = useState<SajuInput | null>(null);
  const [result, setResult] = useState<SajuResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetConcern, setPresetConcern] = useState<ConcernKey | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  // 공유 링크·결제 복귀 링크로 진입한 경우 자동 분석
  useEffect(() => {
    const decoded = decodeInput(window.location.search);
    if (!decoded) return;
    const id = window.setTimeout(() => run(decoded, false), 0);
    return () => window.clearTimeout(id);
  }, [run]);

  const reset = useCallback(() => {
    setStage("form");
    setResult(null);
    setError(null);
    setPresetConcern(null);
    window.history.replaceState(null, "", window.location.pathname);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // 헤더 로고 클릭 → 결과 화면을 입력 폼으로 초기화하고 최상단으로
  useEffect(() => {
    const onHome = () => { reset(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    window.addEventListener(HOME_RESET_EVENT, onHome);
    return () => window.removeEventListener(HOME_RESET_EVENT, onHome);
  }, [reset]);

  /** 퀵 카드 선택 → 폼의 테마 카드 즉시 선택 + 폼으로 부드럽게 스크롤 */
  const pickConcern = (c: ConcernKey) => {
    setPresetConcern(c);
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div ref={topRef} className="scroll-mt-20">
      {stage === "form" && (
        <>
          <QuickCards active={presetConcern ?? input?.concern ?? null} onPick={pickConcern} />
          <div ref={formRef} className="scroll-mt-24">
            {error && <p className="mb-4 rounded-lg border border-[#C2413B]/50 bg-[#C2413B]/10 px-3 py-2 text-sm text-fire-text">{error}</p>}
            <SajuForm initial={input} presetConcern={presetConcern} onSubmit={run} />
          </div>
        </>
      )}
      {stage === "loading" && <LoadingCompass />}
      {stage === "result" && result && <SajuResult result={result} onReset={reset} />}
      <div className="mt-8"><TrustBadges compact /></div>
    </div>
  );
}
