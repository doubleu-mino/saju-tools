"use client";

import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import type { LockKind, LockToken, Segment } from "@/lib/pinpoint";
import { isLock } from "@/lib/pinpoint";

export interface LockClick { kind: LockKind; hint: string }

interface LockProps {
  token: LockToken;
  onUnlock: (c: LockClick) => void;
}

const KIND_LABEL: Record<LockKind, string> = {
  month: "결정적 달", surname: "귀인 성씨", item: "비책 물상", color: "비책 색상", pattern: "격국", direction: "길방위", age: "전성기 대운", zodiac: "귀인 띠",
};

/**
 * 문장 속 결정적 단어 자리에 들어가는 인라인 자물쇠 뱃지.
 * 클릭 시 자물쇠가 살짝 흔들린 뒤 VIP 모달을 엽니다. (정보 공백 기법)
 */
export default function InlineLock({ token, onUnlock }: LockProps) {
  const [shaking, setShaking] = useState(false);
  const timer = useRef<number | null>(null);
  const click = () => {
    if (shaking) return;
    setShaking(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setShaking(false);
      onUnlock({ kind: token.kind, hint: token.hint });
    }, 480);
  };
  return (
    <button
      type="button"
      onClick={click}
      className={`inline-lock ${shaking ? "is-shaking" : ""}`}
      title={`VIP 해금 · ${KIND_LABEL[token.kind]}`}
      aria-label={`VIP 해금 필요 — ${KIND_LABEL[token.kind]} ${token.hint}`}
    >
      <Lock size={11} className="inline-lock__icon" aria-hidden="true" />
      <span>{token.hint}</span>
    </button>
  );
}

/** Segment 배열을 문장 + 인라인 자물쇠로 렌더링 */
export function LockedText({ segments, onUnlock }: { segments: Segment[]; onUnlock: (c: LockClick) => void }) {
  return (
    <>
      {segments.map((s, i) => (isLock(s) ? <InlineLock key={i} token={s} onUnlock={onUnlock} /> : <span key={i}>{s}</span>))}
    </>
  );
}
