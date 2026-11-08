import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_NAME_EN, SITE_TITLE, SITE_TAGLINE, SITE_DESC, CONTACT_EMAIL } from "@/lib/site";

const serif = Noto_Serif_KR({
  variable: "--font-serif",
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: `${SITE_NAME} (${SITE_NAME_EN})`,
  keywords: ["운세로그", "UnseLog", "사주", "만세력", "사주팔자", "오행", "무료 사주", "일간", "대운", "진태양시", "손재수", "2027 신년운세", "월별 운세", "재물운", "직장운", "연애운"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: `${SITE_NAME} (${SITE_NAME_EN})`,
    title: SITE_TITLE,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_TAGLINE,
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
const THEME_INIT = `(function(){try{var t=localStorage.getItem("unselog-theme");var r=document.documentElement;if(t==="yang"){r.classList.add("light");r.classList.remove("dark");}else{r.classList.add("dark");r.classList.remove("light");}}catch(e){}})();`;

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

/* ───────── 구조화 데이터 (JSON-LD) ───────── */
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: [SITE_NAME_EN, "운세로그 사주", "unselog"],
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  email: CONTACT_EMAIL,
  description: SITE_DESC,
};
const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: `${SITE_NAME} (${SITE_NAME_EN})`,
  alternateName: SITE_NAME_EN,
  url: SITE_URL,
  description: SITE_DESC,
  inLanguage: "ko",
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};
const ld = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${serif.variable} dark h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(ORGANIZATION_LD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(WEBSITE_LD) }} />
      </head>
      <body className="starfield min-h-full flex flex-col bg-ink text-fg">
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
            </Script>
          </>
        )}
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
