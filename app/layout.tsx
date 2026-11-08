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

const SITE_TITLE = "명리원 | 정통 만세력 사주팔자 무료 분석";
const SITE_DESC =
  "하늘이 내린 명(命)을 풀고, 때(時)를 읽다. 명리원(明理院)은 진태양시·서머타임 자동 보정, 절기 기준 정통 만세력으로 사주팔자 8글자와 오행 분포, 일간 성향, 인생 종합 총운을 무료로 분석하고 재물·직장·연애·건강 심층 리포트를 제공합니다. 입력 데이터는 서버로 전송되지 않습니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://saju-tools.pages.dev"),
  title: {
    default: SITE_TITLE,
    template: "%s | 명리원",
  },
  description: SITE_DESC,
  applicationName: "명리원 (明理院)",
  keywords: ["명리원", "사주", "만세력", "사주팔자", "오행", "무료 사주", "일간", "대운", "진태양시", "재물운", "직장운", "연애운", "건강운"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "명리원 (明理院)",
    title: SITE_TITLE,
    description: "하늘이 내린 명(命)을 풀고, 때(時)를 읽다 | 정통 만세력 & 심층 사주 분석",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: "하늘이 내린 명(命)을 풀고, 때(時)를 읽다 | 정통 만세력 & 심층 사주 분석",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F7F1" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F19" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** 첫 페인트 전에 저장된 음양 테마를 적용해 깜빡임을 방지합니다. 기본값은 음(陰)·다크. */
const THEME_INIT = `(function(){try{var t=localStorage.getItem("myeongri-theme");var r=document.documentElement;if(t==="yang"){r.classList.add("light");r.classList.remove("dark");}else{r.classList.add("dark");r.classList.remove("light");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${serif.variable} dark h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="starfield min-h-full flex flex-col bg-ink text-fg">
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
