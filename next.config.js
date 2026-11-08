/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 정적 배포: `npm run build` 실행 시 out/ 폴더로 내보내기
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

module.exports = nextConfig;
