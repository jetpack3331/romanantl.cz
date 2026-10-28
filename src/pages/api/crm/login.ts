import type { APIRoute } from "astro";
import { getClientIp, setCrmSession } from "@/lib/crm/auth";
import { getCrmAuthConfig } from "@/lib/crm/config";
import { jsonResponse, readJsonBody } from "@/lib/crm/json-response";
import { loginRateLimiter } from "@/lib/crm/login-rate-limit";
import { checkPassword } from "@/lib/crm/tokens";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const config = getCrmAuthConfig();
  if (!config) {
    return jsonResponse({ error: "CRM není nakonfigurované" }, 503);
  }

  const ip = getClientIp(request, clientAddress);
  if (loginRateLimiter.isBlocked(ip)) {
    return jsonResponse(
      { error: "Příliš mnoho pokusů, zkuste to za 15 minut" },
      429
    );
  }

  const body = await readJsonBody(request);
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  if (!password || !checkPassword(password, config.password)) {
    loginRateLimiter.recordFailure(ip);
    return jsonResponse({ error: "Nesprávné heslo" }, 401);
  }

  loginRateLimiter.reset(ip);
  setCrmSession(cookies, config.secret, config.password);
  return jsonResponse({ ok: true });
};
