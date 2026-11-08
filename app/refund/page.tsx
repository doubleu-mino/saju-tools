import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { SITE_NAME, BUSINESS } from "@/lib/site";
import { PLANS, won } from "@/lib/plans";

export const metadata: Metadata = {
  title: "전자상거래 환불규정",
  description: "운세로그(UnseLog) 유료 해금 콘텐츠의 청약철회·환불 기준을 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 안내합니다.",
};

export default function RefundPage() {
  return (
    <StaticPage eyebrow="REFUND POLICY" title="전자상거래 환불규정" updated="2026년 11월 8일">
      <p>
        본 규정은 {SITE_NAME}(이하 &ldquo;서비스&rdquo;)이 판매하는 유료 디지털 콘텐츠(VIP 간명 해금권)의 청약철회와 환불 기준을 「전자상거래 등에서의 소비자보호에 관한 법률」(이하 &ldquo;전자상거래법&rdquo;)과
        「콘텐츠산업 진흥법」에 따라 정한 것입니다.
      </p>

      <h2>제1조 (판매 상품)</h2>
      <ul>
        {PLANS.map((p) => (
          <li key={p.key}><strong>{p.title.replace("👑 ", "")}</strong> — {won(p.price)}{p.original ? ` (정가 ${won(p.original)}, 얼리버드 할인가)` : ""}. {p.desc}</li>
        ))}
      </ul>
      <p>모든 상품은 1회 결제로 제공되는 디지털 콘텐츠이며 정기 결제(구독)가 아닙니다. 결제 즉시 결제한 브라우저에서 잠긴 항목이 열리는 방식으로 제공됩니다.</p>

      <h2>제2조 (청약철회가 가능한 경우)</h2>
      <ul>
        <li>결제가 완료되었으나 서비스 오류로 <strong>해금 콘텐츠가 전혀 표시되지 않은 경우</strong>: 결제일로부터 7일 이내에 주문번호와 함께 요청하시면 전액 환불합니다.</li>
        <li>결제 금액이 상품 가격과 다르게 청구되었거나 <strong>중복 결제</strong>된 경우: 확인 후 초과분 또는 중복분을 전액 환불합니다.</li>
        <li>결제 후 콘텐츠를 열람하기 전(성공 페이지에서 결과 화면으로 돌아가지 않은 상태)에 요청한 경우: 결제일로부터 7일 이내 전액 환불합니다.</li>
      </ul>

      <h2>제3조 (청약철회가 제한되는 경우)</h2>
      <p>
        전자상거래법 제17조 제2항 및 동법 시행령 제21조에 따라, 아래 경우에는 청약철회가 제한됩니다. 서비스는 결제 전 이 사실을 결제창 하단에 고지합니다.
      </p>
      <ul>
        <li>해금 콘텐츠가 정상적으로 표시되어 <strong>디지털 콘텐츠의 제공이 개시된 경우</strong>(결과 화면에서 잠긴 값이 열린 경우).</li>
        <li>해석 내용이 이용자의 기대나 다른 만세력·상담 결과와 다르다는 이유. 해석은 전통 명리학 이론에 따른 참고 자료이며 특정 결과를 보증하지 않습니다.</li>
        <li>이용자가 생년월일·시간을 잘못 입력해 산출된 결과. 입력값은 결제 전 결과 화면에서 확인할 수 있습니다.</li>
      </ul>

      <h2>제4조 (해금 상태의 보관과 복구)</h2>
      <ul>
        <li>서비스는 로그인 없이 운영되므로 해금 상태는 결제한 기기의 브라우저 저장소에 보관됩니다.</li>
        <li>브라우저 데이터 삭제, 기기 변경 등으로 해금 상태가 사라진 경우, <strong>주문번호</strong>와 결제 수단 정보를 이메일로 보내주시면 확인 후 해금을 복구해 드립니다. 이 경우는 환불 사유가 아닌 복구 사유로 처리합니다.</li>
      </ul>

      <h2>제5조 (환불 절차)</h2>
      <ol>
        <li><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>로 주문번호, 결제일, 결제 수단, 환불 사유를 보내주세요.</li>
        <li>영업일 기준 3일 이내에 접수 확인과 처리 결과를 회신합니다.</li>
        <li>환불이 결정되면 토스페이먼츠를 통해 결제 수단으로 취소 처리하며, 카드사·은행에 따라 3~7영업일이 소요될 수 있습니다.</li>
      </ol>

      <h2>제6조 (분쟁 해결)</h2>
      <p>
        환불과 관련한 분쟁은 소비자분쟁해결기준(공정거래위원회 고시)에 따르며, 합의가 어려운 경우 한국소비자원 또는 전자거래분쟁조정위원회에 조정을 신청할 수 있습니다.
      </p>

      <h2>제7조 (사업자 정보)</h2>
      <ul>
        <li>상호명: {BUSINESS.name} ({BUSINESS.nameEn})</li>
        <li>대표자: {BUSINESS.owner}</li>
        <li>문의: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
        <li>사업자등록번호: {BUSINESS.registrationNo}</li>
        <li>통신판매업신고번호: {BUSINESS.mailOrderNo}</li>
      </ul>
    </StaticPage>
  );
}
