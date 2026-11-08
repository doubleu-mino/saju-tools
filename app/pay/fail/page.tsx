import type { Metadata } from "next";
import PayFail from "@/components/PayFail";

export const metadata: Metadata = {
  title: "결제 실패",
  description: "결제가 완료되지 않았습니다.",
  robots: { index: false, follow: false },
};

export default function PayFailPage() {
  return <PayFail />;
}
