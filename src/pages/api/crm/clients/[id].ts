import type { APIRoute } from "astro";
import { deleteClient, updateClient } from "@/lib/crm/clients/repository";
import { validateClientUpdate } from "@/lib/crm/clients/validate";
import { getDb } from "@/lib/crm/db";
import { jsonResponse, readJsonBody } from "@/lib/crm/json-response";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return jsonResponse({ error: "Klient nenalezen" }, 404);

  const validated = validateClientUpdate(await readJsonBody(request));
  if (!validated.ok) {
    return jsonResponse({ error: "Zkontrolujte vyplněná pole", fieldErrors: validated.errors }, 400);
  }
  const client = updateClient(getDb(), id, validated.data);
  if (!client) return jsonResponse({ error: "Klient nenalezen" }, 404);
  return jsonResponse({ ok: true, client });
};

export const DELETE: APIRoute = ({ params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || !deleteClient(getDb(), id)) {
    return jsonResponse({ error: "Klient nenalezen" }, 404);
  }
  return jsonResponse({ ok: true });
};
