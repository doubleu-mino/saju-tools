import Link from "next/link";
import { Compass } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-20 border-b border-[#C5A059]/20 bg-[#0B0F19]/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[#C5A059]/40 bg-[#161D2E] text-[#E5B869] transition group-hover:rotate-45">
            <Compass size={18} />
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] tracking-[0.3em] text-[#C5A059]">SAJU-TOOLS</span>
            <span className="gold-text block text-lg font-black tracking-wide">萬歲曆 사주툴스</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[#EFE6D2]/70">
          <Link href="/about/" className="hover:text-[#E5B869]">알고리즘</Link>
          <Link href="/privacy/" className="hidden hover:text-[#E5B869] sm:block">개인정보</Link>
          <Link href="/terms/" className="hidden hover:text-[#E5B869] sm:block">이용약관</Link>
        </nav>
      </div>
    </header>
  );
}
