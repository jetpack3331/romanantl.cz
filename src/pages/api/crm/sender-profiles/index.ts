import type { APIRoute } from "astro";
import { getDb } from "@/lib/crm/db";
import { jsonResponse, readJsonBody } from "@/lib/crm/json-response";
import { validateSenderProfile } from "@/lib/crm/outreach/email-template";
import { listSenderProfiles, saveSenderProfile } from "@/lib/crm/outreach/sender-profiles";

export const prerender = false;

/** Creates or overwrites (by label) a sender profile; returns it with the full list. */
export const POST: APIRoute = async ({ request }) => {
  const validated = validateSenderProfile(await readJsonBody(request));
  if (!validated.ok) {
    return jsonResponse({ error: "Zkontrolujte údaje odesílatele", fieldErrors: validated.errors }, 400);
  }
  const db = getDb();
  const profile = saveSenderProfile(db, validated.data);
  return jsonResponse({ ok: true, profile, profiles: listSenderProfiles(db) });
};
