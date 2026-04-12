import type { Locale } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";

/**
 * Build target URL for language switcher from current pathname (e.g. /en/ai-tvorba).
 */
export function buildLocaleHref(pathname: string, targetLocale: Locale): string {
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const first = segments[0];
  const hasLocale = first !== undefined && isValidLocale(first);
  const rest = hasLocale ? segments.slice(1) : segments;
  const restPath = rest.join("/");

  if (targetLocale === "cs") {
    return restPath ? `/${restPath}` : "/";
  }

  return restPath ? `/${targetLocale}/${restPath}` : `/${targetLocale}`;
}
