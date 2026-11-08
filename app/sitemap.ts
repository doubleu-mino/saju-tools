import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://saju-tools.pages.dev";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terms/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
