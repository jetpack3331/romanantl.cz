import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, isValidLocale } from "./i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Legacy: přesměruj vše z /cs/... na variantu bez /cs,
  // aby se /cs v URL vůbec nezobrazovalo.
  if (pathname === "/cs" || pathname === "/cs/") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith("/cs/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/cs/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  // 2) Pokud první segment je platný locale (např. /en/...),
  // necháme request běžet normálně.
  const segment = pathname.replace(/^\//, "").split("/")[0];
  if (segment && isValidLocale(segment)) {
    return NextResponse.next();
  }

  // 3) Vše ostatní přepiš (rewrite) na výchozí locale (cs),
  // ale URL v prohlížeči zůstane beze změny.
  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

// Aplikovat middleware na všechny běžné stránky (ne assety a _next).
export const config = {
  matcher: ["/((?!api|_next/|.*\\..*).*)"],
};

