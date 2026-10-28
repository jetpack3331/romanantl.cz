import type { APIRoute } from "astro";
import { createClient } from "@/lib/crm/clients/repository";
import { validateClientUpdate } from "@/lib/crm/clients/validate";
import { getDb } from "@/lib/crm/db";
import { jsonResponse, readJsonBody } from "@/lib/crm/json-response";

export const prerender = false;

/** Creates a client entered by hand (no import key, source "ručně"). */
export const POST: APIRoute = async ({ request }) => {
  const validated = validateClientUpdate(await readJsonBody(request), { requireName: true });
  if (!validated.ok) {
    return jsonResponse({ error: "Zkontrolujte vyplněná pole", fieldErrors: validated.errors }, 400);
  }
  const client = createClient(getDb(), {
    ...validated.data,
    name: validated.data.name ?? "",
    source: "ručně",
  });
  return jsonResponse({ ok: true, client }, 201);
};
