import type { AstroCookies } from "astro";
import { getCrmAuthConfig } from "@/lib/crm/config";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/crm/tokens";

/** Paths reachable without a CRM session. */
const PUBLIC_CRM_PATHS = new Set(["/crm/login", "/api/crm/login"]);

export function isProtectedCrmPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (PUBLIC_CRM_PATHS.has(normalized)) return false;
  return (
    normalized === "/crm" ||
    normalized.startsWith("/crm/") ||
    normalized === "/api/crm" ||
    normalized.startsWith("/api/crm/")
  );
}

export function isCrmPath(pathname: string): boolean {
  return /^\/(api\/)?crm(\/|$)/.test(pathname);
}

export function hasCrmSession(cookies: AstroCookies): boolean {
  const config = getCrmAuthConfig();
  if (!config) return false;
  return verifySessionToken(
    cookies.get(SESSION_COOKIE)?.value,
    config.secret,
    config.password
  );
}

export function setCrmSession(
  cookies: AstroCookies,
  secret: string,
  password: string
): void {
  cookies.set(SESSION_COOKIE, createSessionToken(secret, password), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearCrmSession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

/** nginx sets X-Real-IP; fall back to the socket address in development. */
export function getClientIp(request: Request, clientAddress: string): string {
  return request.headers.get("x-real-ip")?.trim() || clientAddress || "unknown";
}
