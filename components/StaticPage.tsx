export default function StaticPage({ eyebrow, title, updated, children }: {
  eyebrow: string; title: string; updated?: string; children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-12">
      <p className="text-xs tracking-[0.4em] text-[#C5A059]">{eyebrow}</p>
      <h1 className="gold-text mt-2 text-3xl font-black sm:text-4xl">{title}</h1>
      {updated && <p className="mt-2 text-xs text-[#EFE6D2]/40">최종 수정일: {updated}</p>}
      <article className="prose-saju card ornament mt-8 rounded-2xl p-6 text-[15px] text-[#EFE6D2]/85 sm:p-10">
        {children}
      </article>
    </div>
  );
}
