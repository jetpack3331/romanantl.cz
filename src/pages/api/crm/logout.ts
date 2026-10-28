import type { APIRoute } from "astro";
import { clearCrmSession } from "@/lib/crm/auth";
import { jsonResponse } from "@/lib/crm/json-response";

export const prerender = false;

export const POST: APIRoute = ({ cookies }) => {
  clearCrmSession(cookies);
  return jsonResponse({ ok: true });
};
