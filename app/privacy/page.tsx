import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = { title: "개인정보처리방침", description: "사주툴스 萬歲曆은 입력 데이터를 서버로 전송하거나 저장하지 않습니다." };

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="PRIVACY" title="개인정보처리방침" updated="2026년 11월 8일">
      <p>
        사주툴스 萬歲曆(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
        본 방침은 서비스가 어떤 정보를 어떻게 처리하는지 투명하게 알리기 위해 작성되었습니다.
      </p>

      <h2>1. 수집하는 개인정보 — 없음</h2>
      <p>
        서비스는 회원 가입, 로그인, 결제 기능을 제공하지 않으며 <strong>어떠한 개인정보도 수집·저장하지 않습니다.</strong>
      </p>
      <ul>
        <li>이용자가 입력하는 이름·성별·생년월일·출생 시간·출생 지역은 <strong>이용자의 브라우저 안에서만</strong> 계산에 사용되며, 서비스 서버로 전송되지 않습니다.</li>
        <li>서비스는 정적 웹사이트로 운영되어 입력 데이터를 수신·처리할 서버 프로그램 자체가 존재하지 않습니다.</li>
        <li>입력 데이터는 페이지를 벗어나거나 새로고침하면 즉시 파기됩니다. 서비스는 입력 데이터를 쿠키나 로컬 저장소에 저장하지 않습니다.</li>
      </ul>

      <h2>2. 공유 링크에 관한 안내</h2>
      <p>
        &ldquo;결과 링크 복사&rdquo; 또는 SNS 공유 기능을 사용할 경우, 이용자가 입력한 생년월일 등의 값이 URL 파라미터 형태로 링크에 포함됩니다.
        이 링크는 이용자의 선택으로만 생성·전달되며 서비스는 이를 저장하지 않습니다. 링크를 공유할 상대를 신중히 선택해 주시기 바랍니다.
      </p>

      <h2>3. 쿠키 및 제3자 광고</h2>
      <p>
        서비스는 무료 운영을 위해 Google AdSense 광고를 게재할 수 있습니다. Google을 비롯한 제3자 광고 사업자는 이용자의 본 웹사이트 또는
        다른 웹사이트 방문 기록을 바탕으로 광고를 게재하기 위해 쿠키를 사용할 수 있습니다.
      </p>
      <ul>
        <li>Google의 광고 쿠키 사용에 대한 자세한 내용은 <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google 광고 정책</a>에서 확인할 수 있습니다.</li>
        <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google 광고 설정</a>에서 맞춤 광고를 해제하거나, 브라우저 설정에서 쿠키를 차단할 수 있습니다.</li>
      </ul>

      <h2>4. 웹 호스팅 접속 기록</h2>
      <p>
        서비스는 Cloudflare Pages를 통해 제공됩니다. 호스팅 사업자는 보안 및 서비스 안정성을 위해 IP 주소, 접속 시간, 브라우저 종류 등의 접속 로그를
        자체 정책에 따라 일시적으로 처리할 수 있으며, 서비스 운영자는 이를 개인 식별 목적으로 이용하지 않습니다.
      </p>

      <h2>5. 아동의 개인정보</h2>
      <p>서비스는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.</p>

      <h2>6. 개인정보 보호책임자 및 문의</h2>
      <p>
        개인정보 처리에 관한 문의, 의견, 불만은 아래 연락처로 접수해 주시면 신속히 답변드리겠습니다.
        <br />이메일: <a href="mailto:doubleu.mino@gmail.com">doubleu.mino@gmail.com</a>
      </p>

      <h2>7. 방침의 변경</h2>
      <p>본 방침은 법령·정책 변경에 따라 개정될 수 있으며, 변경 사항은 본 페이지를 통해 공지합니다.</p>
    </StaticPage>
  );
}
