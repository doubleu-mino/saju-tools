# 운세로그 (UnseLog) — 정통 만세력 & 24개월 타임라인 사주 분석

프리미엄 정통 사주 만세력 포털. Next.js(App Router) + Tailwind CSS + Lucide, 100% 클라이언트 계산, Cloudflare Pages 정적 배포(`output: 'export'`).

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # out/ 폴더로 정적 내보내기
```

## Cloudflare Pages 설정

- Build command: `npm run build`
- Build output directory: `out`
- (선택) 환경변수 `NEXT_PUBLIC_KAKAO_JS_KEY`: 카카오 JavaScript 키. 미설정 시 Web Share / 링크 복사로 대체.

## 구조

- `lib/saju.ts` — 만세력 엔진(절기·진태양시·서머타임·127.5° 표준시·음력 변환·십성·대운)
- `lib/interpretations.ts` — 일간 10유형 해설, 오행 처방, 테마 리포트
- `components/SajuForm.tsx`, `SajuResult.tsx`, `ShareCard.tsx`, `LoadingCompass.tsx`
- `app/about`, `app/terms`, `app/privacy` — 애드센스 심사용 정적 페이지

## 환경변수

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 측정 ID (예: `G-XXXXXXXXXX`). 미설정 시 GA 스크립트를 넣지 않음 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스페이먼츠 결제위젯 클라이언트 키. 미설정 시 공식 문서 테스트 키(`test_gck_docs_…`)로 동작해 실제 청구 없음 |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오 JavaScript 키 (공유 버튼). 미설정 시 Web Share / 링크 복사로 대체 |

## 결제·해금 흐름 (정적 사이트)

1. 결과 화면 자물쇠 → `VipModal`에서 플랜 선택 → 토스 결제위젯 `requestPayment`
2. 토스가 `/pay/success/?plan=…&c=…&r=…&paymentKey=…&orderId=…&amount=…`로 리다이렉트
3. `components/PaySuccess.tsx`가 금액·주문번호를 대조한 뒤 `localStorage["unselog-unlocked"]`에 `{ plan, timestamp, orderId, concern }` 저장
4. `/?r…`로 복귀하면 `useUnlock()`이 상태를 읽어 `SajuResult`의 인라인 락·타임라인 자물쇠를 실제 값으로 전환

> 운영 전환 시에는 서버(Cloudflare Pages Function 등)에서 토스 결제 승인 API(`POST /v1/payments/confirm`)를 호출한 뒤 해금 토큰을 발급해야 합니다. 현재 구조는 테스트 모드용으로, 성공 URL만으로 해금이 되므로 실결제에 그대로 쓰면 안 됩니다.
