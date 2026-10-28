import type { APIRoute } from "astro";
import { parseClientsCsv } from "@/lib/crm/clients/import";
import { importClients } from "@/lib/crm/clients/repository";
import { getDb } from "@/lib/crm/db";
import { jsonResponse, readJsonBody } from "@/lib/crm/json-response";

export const prerender = false;

const MAX_CSV_LENGTH = 5_000_000;

/** Body: { csv: string, source?: string } - the file is read in the browser and sent as JSON. */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonBody(request);
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const csv = typeof record.csv === "string" ? record.csv : "";
  const source = typeof record.source === "string" ? record.source.trim().slice(0, 200) : "";
  if (!csv) return jsonResponse({ error: "Vyberte CSV soubor" }, 400);
  if (csv.length > MAX_CSV_LENGTH) return jsonResponse({ error: "Soubor je příliš velký" }, 413);

  try {
    const parsed = parseClientsCsv(csv);
    const result = importClients(getDb(), parsed.clients, source || "import");
    return jsonResponse({ ok: true, ...result, skipped: parsed.skipped, columns: parsed.columns });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Import selhal" }, 400);
  }
};
