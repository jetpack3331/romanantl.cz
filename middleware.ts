import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isValidLocale } from "./i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Přesměrovat kořen na výchozí lokalizaci
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const segment = pathname.slice(1).split("/")[0];
  if (!isValidLocale(segment)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|profile_picture|.*\\.).*)"],
};
