import type { Metadata } from "next";
import PaySuccess from "@/components/PaySuccess";

export const metadata: Metadata = {
  title: "결제 완료 · 해금 처리",
  description: "결제가 완료되어 VIP 간명 항목을 해금합니다.",
  robots: { index: false, follow: false },
};

export default function PaySuccessPage() {
  return <PaySuccess />;
}
