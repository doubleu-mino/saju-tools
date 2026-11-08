"use client";

import { useSyncExternalStore } from "react";

export const THEME_STORAGE_KEY = "unselog-theme"; // "yin" (dark) | "yang" (light)
type Mode = "yin" | "yang";

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};
const getSnapshot = (): Mode => (document.documentElement.classList.contains("light") ? "yang" : "yin");
const getServerSnapshot = (): Mode | null => null;

/** 태극(☯) 문양 — 음(陰)·양(陽) 테마 토글 */
export default function ThemeToggle() {
  // <html> class 를 단일 진실 공급원으로 삼아 SSR(null) ↔ 클라이언트 불일치 없이 동기화
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const apply = (next: Mode) => {
    const root = document.documentElement;
    root.classList.toggle("light", next === "yang");
    root.classList.toggle("dark", next === "yin");
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* private mode 등 */ }
  };

  const isYang = mode === "yang";
  const label = mode === null ? "테마 전환" : isYang ? "음(陰) 모드로 전환" : "양(陽) 모드로 전환";

  return (
    <button
      type="button"
      onClick={() => apply(isYang ? "yin" : "yang")}
      aria-label={label}
      title={label}
      className="yinyang-btn group inline-flex items-center gap-2 rounded-full border border-gold-2/40 bg-ink-3/80 py-1 pl-1 pr-3 text-[11px] tracking-[0.2em] text-gold-2 transition hover:border-gold"
    >
      <svg viewBox="0 0 100 100" width="28" height="28" aria-hidden="true" className="drop-shadow-[0_0_6px_rgba(229,184,105,.35)]">
        {/* 바깥 테두리 */}
        <circle cx="50" cy="50" r="48" fill="var(--fg)" stroke="var(--gold)" strokeWidth="2.5" />
        {/* 음(陰) 반쪽 */}
        <path d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2 Z" fill="var(--ink)" />
        {/* 두 점 */}
        <circle cx="50" cy="26" r="7" fill="var(--fg)" />
        <circle cx="50" cy="74" r="7" fill="var(--ink)" />
      </svg>
      <span className="hidden sm:inline" suppressHydrationWarning>{mode === null ? "陰·陽" : isYang ? "陽" : "陰"}</span>
    </button>
  );
}
