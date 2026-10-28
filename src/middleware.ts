import { defineMiddleware } from "astro:middleware";
import { resolveLegacyRedirect } from "@/lib/redirects";
import {
  hasCrmSession,
  isCrmPath,
  isProtectedCrmPath,
} from "@/lib/crm/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;

  if (pathname === "/cs" || pathname === "/cs/") {
    return context.redirect("/", 308);
  }

  if (pathname.startsWith("/cs/")) {
    const nextPath = pathname.replace(/^\/cs/, "") || "/";
    return context.redirect(nextPath, 308);
  }

  const legacyRedirect = resolveLegacyRedirect(pathname);
  if (legacyRedirect) {
    return context.redirect(legacyRedirect, 308);
  }

  if (isProtectedCrmPath(pathname) && !hasCrmSession(context.cookies)) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return context.redirect("/crm/login", 302);
  }

  const response = await next();
  if (isCrmPath(pathname) || pathname === "/odhlaseni") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
  }
  return response;
});
