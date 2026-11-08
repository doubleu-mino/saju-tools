import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/terms/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
