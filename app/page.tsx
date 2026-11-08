import SajuApp from "@/components/SajuApp";
import TrustBadges from "@/components/TrustBadges";
import { Scroll, Scale, Sparkles, Moon } from "lucide-react";

const FEATURES = [
  { icon: Scroll, title: "절기 기준 정통 산출", desc: "입춘·경칩 등 12절(節)의 실제 천문 시각으로 연주·월주를 세웁니다." },
  { icon: Moon, title: "음력 평달·윤달 지원", desc: "1940~2026년 음력 생일을 정확한 양력으로 환산해 계산합니다." },
  { icon: Scale, title: "진태양시·표준시 보정", desc: "출생 지역 경도 보정과 1987~88년 서머타임, 127.5° 표준시 시기를 자동 반영합니다." },
  { icon: Sparkles, title: "십성·대운 해석", desc: "일간 기준 십성 분포와 10년 대운 흐름까지 한 번에 열람합니다." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:pt-16">
      {/* 히어로 */}
      <section className="mb-10 text-center">
        <p className="animate-rise text-xs tracking-[0.5em] text-gold-2">明理院 · 正統 萬歲曆 · 四柱推命</p>
        <h1 className="animate-rise delay-1 mt-4 text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
          <span className="gold-text">하늘이 내린 명(命)을 풀고,</span>
          <br />
          <span className="text-fg">때(時)를 읽다</span>
        </h1>
        <p className="animate-rise delay-2 mt-4 text-sm tracking-[0.2em] text-gold-2 sm:text-base">정통 만세력 &amp; 심층 사주 분석</p>
        <p className="animate-rise delay-2 mx-auto mt-4 max-w-2xl text-base leading-relaxed text-fg/65 sm:text-lg">
          사주원국 8글자와 오행 분포, 일간의 본성과 인생 종합 총운은 무료로 완전 공개하고,
          <br className="hidden sm:block" /> 재물·직장·연애·건강 심층 리포트까지 브라우저 안에서 정밀하게 풀어드립니다.
        </p>
        <div className="animate-rise delay-3 mt-7"><TrustBadges /></div>
      </section>

      <div className="mx-auto max-w-3xl">
        <SajuApp />
      </div>

      {/* 특징 */}
      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card rounded-2xl p-5">
            <Icon size={22} className="text-gold" />
            <h3 className="mt-3 font-bold text-gold-light">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-fg/60">{desc}</p>
          </div>
        ))}
      </section>

      {/* SEO 텍스트 */}
      <section className="prose-saju mt-16 text-fg/75">
        <h2>사주팔자(四柱八字)란 무엇인가요?</h2>
        <p>
          사주팔자는 태어난 연·월·일·시 네 개의 기둥(四柱)에 각각 천간(天干)과 지지(地支) 한 글자씩, 모두 여덟 글자(八字)를 배치한 명식입니다.
          10개의 천간(갑·을·병·정·무·기·경·신·임·계)과 12개의 지지(자·축·인·묘·진·사·오·미·신·유·술·해)는 각각 음양과 목·화·토·금·수 오행의 성질을 지니며,
          여덟 글자 사이의 생(生)과 극(剋), 균형과 치우침을 읽어 타고난 기질과 운의 흐름을 해석합니다.
        </p>
        <h2>만세력의 정확도가 왜 중요한가요?</h2>
        <p>
          사주의 월주는 달력의 월이 아니라 절기(節氣)로 바뀝니다. 예컨대 입춘(立春) 이전에 태어났다면 양력으로 새해가 지났더라도 전년도의 연주를 씁니다.
          또한 우리나라는 동경 135° 표준시를 사용하므로 실제 태양의 위치(진태양시)와 약 30분의 차이가 있고, 1987~1988년에는 서머타임이 시행되어 1시간이 더 어긋납니다.
          명리원 만세력은 이 모든 요소를 자동으로 보정하여 시주와 일주의 오차를 최소화합니다.
        </p>
        <h2>일간(日干)이 나를 상징하는 이유</h2>
        <p>
          여덟 글자 가운데 태어난 날의 천간을 일간(日干) 또는 일주(日主)라 부르며, 명리학에서는 이를 &lsquo;나 자신&rsquo;으로 봅니다.
          나머지 일곱 글자는 일간과의 관계에 따라 비겁·식상·재성·관성·인성의 십성(十星)으로 분류되고, 이 분포가 재물·직업·인간관계의 성향을 보여줍니다.
        </p>
      </section>
    </div>
  );
}
