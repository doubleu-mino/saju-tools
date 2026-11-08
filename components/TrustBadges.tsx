import { ShieldCheck, UserX, Sun } from "lucide-react";

/** 신뢰 배지 3종 — 홈·결과·소개 페이지 공통 */
export const TRUST_BADGES = [
  { icon: UserX, text: "로그인·회원가입 없음" },
  { icon: ShieldCheck, text: "입력 데이터 서버 미전송 (로컬 100%)" },
  { icon: Sun, text: "절기·진태양시 정밀 보정" },
];

export default function TrustBadges({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`flex flex-wrap justify-center gap-2 ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}>
      {TRUST_BADGES.map(({ icon: Icon, text }) => (
        <li
          key={text}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold-2/30 bg-ink-3/70 px-3 py-1.5 text-gold"
        >
          <Icon size={compact ? 12 : 14} className="shrink-0" />
          <span className="text-fg/85">{text}</span>
        </li>
      ))}
    </ul>
  );
}
