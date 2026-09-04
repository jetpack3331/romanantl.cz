export const locales = ["cs", "en", "es"] as const;
export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Detects the locale from a pathname (e.g. /en/product-work -> "en"), falling
 * back to the default locale ("cs") when there is no locale prefix.
 */
export function resolveLocaleFromPathname(pathname: string): Locale {
  const first = pathname.replace(/^\//, "").split("/", 1)[0];
  return first && isValidLocale(first) ? first : "cs";
}
