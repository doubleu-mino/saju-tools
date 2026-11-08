"use client";

const TRIGRAMS = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];

export default function LoadingCompass() {
  return (
    <div className="card ornament animate-rise flex flex-col items-center rounded-2xl px-6 py-14 text-center">
      <div className="relative h-48 w-48">
        {/* 외곽 팔괘 링 */}
        <div className="animate-spin-slow absolute inset-0 rounded-full border border-gold-2/40">
          {TRIGRAMS.map((t, i) => (
            <span
              key={t}
              className="absolute left-1/2 top-1/2 text-xl text-gold"
              style={{ transform: `translate(-50%,-50%) rotate(${i * 45}deg) translateY(-84px) rotate(${-i * 45}deg)` }}
            >
              {t}
            </span>
          ))}
        </div>
        {/* 내부 12지지 링 */}
        <div className="animate-spin-rev absolute inset-6 rounded-full border border-dashed border-gold-2/40">
          {["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"].map((b, i) => (
            <span
              key={b}
              className="absolute left-1/2 top-1/2 text-[11px] text-fg/70"
              style={{ transform: `translate(-50%,-50%) rotate(${i * 30}deg) translateY(-58px) rotate(${-i * 30}deg)` }}
            >
              {b}
            </span>
          ))}
        </div>
        {/* 태극 + 나침반 바늘 */}
        <div className="absolute inset-[66px] rounded-full bg-gradient-to-br from-gold to-[#8C6D35] shadow-[0_0_30px_rgba(229,184,105,.45)]" />
        <svg viewBox="0 0 100 100" className="animate-needle absolute inset-0 h-full w-full">
          <polygon points="50,14 54,50 46,50" fill="#C2413B" />
          <polygon points="50,86 54,50 46,50" fill="var(--fg)" />
          <circle cx="50" cy="50" r="3" fill="var(--ink)" />
        </svg>
      </div>
      <p className="gold-text mt-8 text-lg font-bold">천간과 지지의 기운을 정렬하는 중입니다...</p>
      <p className="mt-2 text-sm text-fg/55">절기와 진태양시를 대조하여 사주 원국을 세우고 있습니다.</p>
    </div>
  );
}
