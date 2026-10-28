import type { APIRoute } from "astro";
import { getCrmAuthConfig } from "@/lib/crm/config";
import { getDb } from "@/lib/crm/db";
import { jsonResponse, readJsonBody } from "@/lib/crm/json-response";
import { addUnsubscribe } from "@/lib/crm/outreach/repository";
import { readUnsubscribeToken } from "@/lib/crm/tokens";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const config = getCrmAuthConfig();
  if (!config) {
    return jsonResponse({ error: "Odhlášení není dostupné" }, 503);
  }

  const body = await readJsonBody(request);
  const token =
    typeof body === "object" && body !== null && "token" in body
      ? String((body as { token: unknown }).token ?? "")
      : "";
  const email = readUnsubscribeToken(token, config.secret);
  if (!email) {
    return jsonResponse({ error: "Neplatný odkaz pro odhlášení" }, 400);
  }

  addUnsubscribe(getDb(), email);
  return jsonResponse({ ok: true });
};
