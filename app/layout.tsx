import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const serif = Noto_Serif_KR({
  variable: "--font-serif",
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://saju-tools.pages.dev"),
  title: {
    default: "사주툴스 萬歲曆 — 평생 무료 정통 사주 만세력",
    template: "%s | 사주툴스 萬歲曆",
  },
  description:
    "진태양시·서머타임 자동 보정, 절기 기준 정통 만세력으로 사주팔자 8글자와 오행 밸런스, 일간 기질, 재물·직장·연애·총운을 무료로 분석합니다. 입력 데이터는 서버로 전송되지 않습니다.",
  keywords: ["사주", "만세력", "사주팔자", "오행", "무료 사주", "일간", "대운", "진태양시"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "사주툴스 萬歲曆",
    title: "사주툴스 萬歲曆 — 평생 무료 정통 사주 만세력",
    description: "천간·지지 8글자와 오행 밸런스를 정밀하게 분석하는 프리미엄 무료 만세력",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${serif.variable} dark h-full antialiased`}>
      <body className="starfield min-h-full flex flex-col bg-[#0B0F19] text-[#EFE6D2]">
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
