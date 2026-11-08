"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

/** 헤더 로고 클릭 → 홈 상태 초기화 이벤트. SajuApp이 수신해 결과 화면을 입력 폼으로 되돌립니다. */
export const HOME_RESET_EVENT = "unselog:home-reset";

export default function HomeLink({ className, children, ariaLabel }: { className?: string; children: ReactNode; ariaLabel?: string }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.location.pathname.replace(/\/+$/, "") !== "") return; // 다른 페이지에서는 일반 내비게이션
    e.preventDefault();
    window.history.replaceState(null, "", "/");
    window.dispatchEvent(new Event(HOME_RESET_EVENT));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Link href="/" onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
