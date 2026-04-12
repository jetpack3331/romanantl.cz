import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;

  if (pathname === "/cs" || pathname === "/cs/") {
    return context.redirect("/", 308);
  }

  if (pathname.startsWith("/cs/")) {
    const nextPath = pathname.replace(/^\/cs/, "") || "/";
    return context.redirect(nextPath, 308);
  }

  return next();
});
