import Link from "next/link";
import { Mail } from "lucide-react";
import { BUSINESS, SITE_NAME, SITE_NAME_EN, SITE_TAGLINE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-gold-2/20 bg-ink/80">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-fg/60">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="gold-text text-base font-bold">{SITE_NAME} ({SITE_NAME_EN})</p>
            <p className="mt-1 text-xs text-gold-2">{SITE_TAGLINE}</p>
            <p className="mt-3 leading-relaxed">
              24절기 천문 시각·진태양시·한국 서머타임을 보정한 정통 만세력으로 사주팔자를 산출합니다. 사주 계산은 이용자의 브라우저 안에서만
              이루어지며, 입력하신 생년월일·시간은 서버로 전송되거나 저장되지 않습니다.
            </p>
            <p className="mt-3 text-xs text-fg/40">
              본 서비스의 해석은 전통 명리학 이론에 기반한 참고 자료이며, 의료·법률·재무적 판단의 근거로 사용될 수 없습니다.
            </p>
          </div>
          <nav className="flex flex-col gap-2" aria-label="바닥글 링크">
            <Link href="/about/" className="hover:text-gold">계산 방식·검증 리포트</Link>
            <Link href="/terms/" className="hover:text-gold">이용약관</Link>
            <Link href="/privacy/" className="hover:text-gold">개인정보처리방침</Link>
            <Link href="/refund/" className="hover:text-gold">전자상거래 환불규정</Link>
            <a href={`mailto:${BUSINESS.email}`} className="inline-flex items-center gap-1.5 hover:text-gold">
              <Mail size={14} /> {BUSINESS.email}
            </a>
          </nav>
        </div>

        {/* 사업자 표기 (PG·전자상거래 심사용) */}
        <dl className="mt-8 grid gap-x-6 gap-y-1 border-t border-gold-2/15 pt-6 text-xs text-fg/45 sm:grid-cols-2">
          <div className="flex gap-2"><dt className="shrink-0 text-fg/60">상호명</dt><dd>{BUSINESS.name} ({BUSINESS.nameEn})</dd></div>
          <div className="flex gap-2"><dt className="shrink-0 text-fg/60">대표자</dt><dd>{BUSINESS.owner}</dd></div>
          <div className="flex gap-2"><dt className="shrink-0 text-fg/60">문의</dt><dd><a href={`mailto:${BUSINESS.email}`} className="hover:text-gold">{BUSINESS.email}</a></dd></div>
          <div className="flex gap-2"><dt className="shrink-0 text-fg/60">사업자등록번호</dt><dd>{BUSINESS.registrationNo}</dd></div>
          <div className="flex gap-2"><dt className="shrink-0 text-fg/60">통신판매업신고</dt><dd>{BUSINESS.mailOrderNo}</dd></div>
          <div className="flex gap-2"><dt className="shrink-0 text-fg/60">사업장 주소</dt><dd>{BUSINESS.address}</dd></div>
        </dl>
        <p className="mt-6 text-xs text-fg/35">© {new Date().getFullYear()} {SITE_NAME} {SITE_NAME_EN}. All rights reserved.</p>
      </div>
    </footer>
  );
}
