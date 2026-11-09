"use client";

import { useSyncExternalStore } from "react";
import { normalizeConcern, type ConcernKey } from "./saju";

export { PLANS, planOf, won } from "./plans";
export type { PlanKey, Plan } from "./plans";
import type { PlanKey } from "./plans";

/* ───────── 해금 상태 (localStorage) ───────── */
export const UNLOCK_KEY = "unselog-unlocked";
export const PENDING_ORDER_KEY = "unselog-pending-order";

export interface UnlockState {
  plan: PlanKey;
  timestamp: number;
  orderId?: string;
  /** 단품 해금권은 구매 당시 선택한 테마 1개에만 적용 */
  concern?: ConcernKey;
}
export interface PendingOrder {
  orderId: string;
  plan: PlanKey;
  amount: number;
  concern: ConcernKey;
  /** 결과 화면 복귀용 쿼리 (encodeInput 결과) */
  returnQuery: string;
  createdAt: number;
}

const CHANGE_EVENT = "unselog:unlock-change";

export function readUnlock(): UnlockState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<UnlockState>;
    if (v.plan !== "single" && v.plan !== "full") return null;
    return { plan: v.plan, timestamp: Number(v.timestamp) || Date.now(), orderId: v.orderId, concern: normalizeConcern(v.concern) ?? undefined };
  } catch { return null; }
}

export function saveUnlock(state: UnlockState) {
  try {
    const prev = readUnlock();
    // 풀패키지가 이미 있으면 단품으로 낮추지 않음
    const next = prev?.plan === "full" && state.plan === "single" ? prev : state;
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(next));
  } catch { /* 저장 불가 환경 */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearUnlock() {
  try { localStorage.removeItem(UNLOCK_KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function savePendingOrder(o: PendingOrder) {
  try { localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(o)); } catch { /* ignore */ }
}
export function readPendingOrder(): PendingOrder | null {
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    return raw ? (JSON.parse(raw) as PendingOrder) : null;
  } catch { return null; }
}
export function clearPendingOrder() {
  try { localStorage.removeItem(PENDING_ORDER_KEY); } catch { /* ignore */ }
}

/* ───────── React 훅 ───────── */
let cache: { raw: string | null; value: UnlockState | null } = { raw: null, value: null };
function snapshot(): UnlockState | null {
  let raw: string | null = null;
  try { raw = localStorage.getItem(UNLOCK_KEY); } catch { raw = null; }
  if (raw !== cache.raw) cache = { raw, value: readUnlock() };
  return cache.value;
}
const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(CHANGE_EVENT, cb); window.removeEventListener("storage", cb); };
};
const serverSnapshot = () => null;

/** 현재 해금 상태. SSR 중에는 null, 클라이언트 하이드레이션 후 localStorage 값으로 동기화됩니다. */
export function useUnlock(): UnlockState | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** 해금 범위 판정 */
export interface UnlockScope {
  /** PART 5 인라인 락 (선택 테마 키워드·귀인 성씨·물상·격국) */
  inline: boolean;
  /** PART 6 타임라인 황금의 달·손재수의 달 */
  timeline: boolean;
  plan: PlanKey | null;
}
export function scopeOf(u: UnlockState | null, concern: ConcernKey): UnlockScope {
  if (!u) return { inline: false, timeline: false, plan: null };
  if (u.plan === "full") return { inline: true, timeline: true, plan: "full" };
  return { inline: !u.concern || u.concern === concern, timeline: false, plan: "single" };
}
