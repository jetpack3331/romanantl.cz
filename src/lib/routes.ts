import { locales, type Locale } from "@/lib/i18n";

/**
 * Pages whose URL slug is translated per locale (e.g. /produktova-tvorba vs
 * /en/product-work vs /es/creacion-de-producto), unlike the Czech-only slugs
 * used elsewhere on the site.
 */
export type RouteKey = "product" | "experience";

const routeSlugs: Record<RouteKey, Record<Locale, string>> = {
  product: {
    cs: "produktova-tvorba",
    en: "product-work",
    es: "creacion-de-producto",
  },
  experience: {
    cs: "zkusenosti",
    en: "work-experience",
    es: "experiencia-laboral",
  },
};

export function routeSlug(key: RouteKey, locale: Locale): string {
  return routeSlugs[key][locale];
}

/** Site-relative path for a translated route, e.g. "/en/product-work". */
export function routePath(key: RouteKey, locale: Locale): string {
  const slug = routeSlug(key, locale);
  return locale === "cs" ? `/${slug}` : `/${locale}/${slug}`;
}

/** Finds which translated route a given slug belongs to, if any. */
export function routeKeyForSlug(slug: string): RouteKey | null {
  for (const key of Object.keys(routeSlugs) as RouteKey[]) {
    if (locales.some((locale) => routeSlugs[key][locale] === slug)) {
      return key;
    }
  }
  return null;
}

/** hreflang alternate URLs (absolute) for every locale of a translated route. */
export function routeAlternateLanguages(
  key: RouteKey,
  base: string
): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, `${base}${routePath(key, locale)}`])
  ) as Record<Locale, string>;
}
