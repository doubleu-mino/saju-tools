import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="relative z-20 border-b border-gold-2/20 bg-ink/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 place-items-center rounded-full border border-gold-2/40 bg-ink-3 text-xl font-black text-gold transition group-hover:rotate-12"
            style={{ fontFamily: "var(--font-hanja)" }}
            aria-hidden="true"
          >
            明
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] tracking-[0.35em] text-gold-2">明理院</span>
            <span className="gold-text block text-lg font-black tracking-wide">명리원</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <nav className="flex items-center gap-4 text-sm text-fg/70">
            <Link href="/about/" className="hover:text-gold">알고리즘</Link>
            <Link href="/privacy/" className="hidden hover:text-gold sm:block">개인정보</Link>
            <Link href="/terms/" className="hidden hover:text-gold sm:block">이용약관</Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
