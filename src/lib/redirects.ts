/**
 * Legacy URLs that were renamed and now permanently redirect to their new
 * location (e.g. after "AI tvorba" was renamed to "produktová tvorba", and
 * after the en/es routes got locale-specific slugs instead of reusing the
 * Czech one). Keyed by the old pathname.
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  "/ai-tvorba": "/produktova-tvorba",
  "/en/ai-tvorba": "/en/product-work",
  "/es/ai-tvorba": "/es/creacion-de-producto",
  "/en/produktova-tvorba": "/en/product-work",
  "/es/produktova-tvorba": "/es/creacion-de-producto",
  "/en/zkusenosti": "/en/work-experience",
  "/es/zkusenosti": "/es/experiencia-laboral",
};

export function resolveLegacyRedirect(pathname: string): string | null {
  return LEGACY_REDIRECTS[pathname] ?? null;
}
