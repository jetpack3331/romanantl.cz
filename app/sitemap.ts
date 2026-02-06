import type { MetadataRoute } from "next";
import { locales } from "@/i18n";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://romanantl.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return locales.map((locale) => ({
    url: locale === "cs" ? baseUrl : `${baseUrl}/${locale}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: locale === "cs" ? 1 : 0.9,
  }));
}
