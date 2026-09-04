import { defineMiddleware } from "astro:middleware";
import { resolveLegacyRedirect } from "@/lib/redirects";

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

  return next();
});
