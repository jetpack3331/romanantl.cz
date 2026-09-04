import type { Locale } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";
import { routeKeyForSlug, routeSlug } from "@/lib/routes";

/**
 * Build target URL for language switcher from current pathname (e.g.
 * /en/product-work). If the first path segment is a translated route slug
 * (see routes.ts), it is swapped for its equivalent in the target locale.
 */
export function buildLocaleHref(pathname: string, targetLocale: Locale): string {
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const first = segments[0];
  const hasLocale = first !== undefined && isValidLocale(first);
  const rest = hasLocale ? segments.slice(1) : segments;

  if (rest.length === 0) {
    return targetLocale === "cs" ? "/" : `/${targetLocale}`;
  }

  const [slug, ...remainder] = rest;
  const routeKey = routeKeyForSlug(slug);
  const targetSlug = routeKey ? routeSlug(routeKey, targetLocale) : slug;
  const restPath = [targetSlug, ...remainder].join("/");

  return targetLocale === "cs" ? `/${restPath}` : `/${targetLocale}/${restPath}`;
}
