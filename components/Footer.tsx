import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-[#C5A059]/20 bg-[#0B0F19]/80">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-[#EFE6D2]/60">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="gold-text text-base font-bold">萬歲曆 사주툴스</p>
            <p className="mt-2 leading-relaxed">
              절기(節氣) 기준 정통 만세력 알고리즘으로 사주팔자를 산출합니다. 모든 계산은 이용자의 브라우저 안에서만
              이루어지며, 입력하신 생년월일·시간은 서버로 전송되거나 저장되지 않습니다.
            </p>
            <p className="mt-3 text-xs text-[#EFE6D2]/40">
              본 서비스의 해석은 전통 명리학 이론에 기반한 참고 자료이며, 의료·법률·재무적 판단의 근거로 사용될 수 없습니다.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/about/" className="hover:text-[#E5B869]">만세력 알고리즘 소개</Link>
            <Link href="/terms/" className="hover:text-[#E5B869]">이용약관</Link>
            <Link href="/privacy/" className="hover:text-[#E5B869]">개인정보처리방침</Link>
            <a href="mailto:doubleu.mino@gmail.com" className="inline-flex items-center gap-1.5 hover:text-[#E5B869]">
              <Mail size={14} /> doubleu.mino@gmail.com
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-[#EFE6D2]/35">© {new Date().getFullYear()} saju-tools. All rights reserved.</p>
      </div>
    </footer>
  );
}
