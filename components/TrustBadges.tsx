import { ShieldCheck, Infinity as InfinityIcon, Sun } from "lucide-react";

const BADGES = [
  { icon: InfinityIcon, text: "평생 100% 무료 정통 만세력" },
  { icon: ShieldCheck, text: "개인정보 보관 제로 (입력 데이터 즉시 파기)" },
  { icon: Sun, text: "진태양시·서머타임 자동 보정" },
];

export default function TrustBadges({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`flex flex-wrap justify-center gap-2 ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}>
      {BADGES.map(({ icon: Icon, text }) => (
        <li
          key={text}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A059]/30 bg-[#161D2E]/70 px-3 py-1.5 text-[#E5B869]"
        >
          <Icon size={compact ? 12 : 14} className="shrink-0" />
          <span className="text-[#EFE6D2]/85">{text}</span>
        </li>
      ))}
    </ul>
  );
}
