# saju-tools — 萬歲曆 사주툴스

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
