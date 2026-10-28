import type { APIRoute } from "astro";
import { getDb } from "@/lib/crm/db";
import { jsonResponse } from "@/lib/crm/json-response";
import { deleteSenderProfile, listSenderProfiles } from "@/lib/crm/outreach/sender-profiles";

export const prerender = false;

export const DELETE: APIRoute = ({ params }) => {
  const db = getDb();
  if (!deleteSenderProfile(db, Number(params.id))) {
    return jsonResponse({ error: "Profil nenalezen" }, 404);
  }
  return jsonResponse({ ok: true, profiles: listSenderProfiles(db) });
};
