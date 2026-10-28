import type { ClientData } from "@/lib/crm/clients/repository";
import { CLIENT_STATUSES, WEB_POTENTIALS } from "@/lib/crm/clients/statuses";

/** Text fields editable on the client card, with their maximum length. */
const EDITABLE_TEXT_FIELDS = {
  name: 200,
  website: 500,
  address: 300,
  phone: 100,
  emails: 500,
  googleMapsUrl: 1000,
  webProblems: 2000,
  platform: 100,
  nextStep: 300,
  callNote: 5000,
  calledBy: 100,
} as const satisfies Partial<Record<keyof ClientData, number>>;

/** Numeric fields with their allowed range; an empty value clears the field. */
const EDITABLE_NUMBER_FIELDS = {
  rating: { min: 0, max: 5, integer: false },
  reviewCount: { min: 0, max: 1_000_000, integer: true },
  webScore: { min: 0, max: 100, integer: true },
  mobilePerformance: { min: 0, max: 100, integer: true },
} as const satisfies Partial<Record<keyof ClientData, { min: number; max: number; integer: boolean }>>;

export type ClientUpdate = Partial<
  Pick<
    ClientData,
    | keyof typeof EDITABLE_TEXT_FIELDS
    | keyof typeof EDITABLE_NUMBER_FIELDS
    | "status"
    | "nextStepDate"
    | "webPotential"
  >
>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a client edit. Only fields present in the body are changed; with
 * `requireName` (creating a client) the company name is mandatory.
 */
export function validateClientUpdate(
  body: unknown,
  { requireName = false }: { requireName?: boolean } = {}
):
  | { ok: true; data: ClientUpdate }
  | { ok: false; errors: Record<string, string> } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: { form: "Neplatná data" } };
  }
  const record = body as Record<string, unknown>;
  const data: ClientUpdate = {};
  const errors: Record<string, string> = {};

  for (const [key, max] of Object.entries(EDITABLE_TEXT_FIELDS) as [
    keyof typeof EDITABLE_TEXT_FIELDS,
    number,
  ][]) {
    if (!(key in record)) continue;
    const value = typeof record[key] === "string" ? (record[key] as string).trim() : "";
    if (value.length > max) errors[key] = `Maximálně ${max} znaků`;
    data[key] = value;
  }
  if (("name" in data || requireName) && !data.name) errors.name = "Povinné pole";

  for (const [key, rule] of Object.entries(EDITABLE_NUMBER_FIELDS) as [
    keyof typeof EDITABLE_NUMBER_FIELDS,
    (typeof EDITABLE_NUMBER_FIELDS)[keyof typeof EDITABLE_NUMBER_FIELDS],
  ][]) {
    if (!(key in record)) continue;
    const raw = String(record[key] ?? "").trim().replace(",", ".");
    if (!raw) {
      data[key] = null;
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || (rule.integer && !Number.isInteger(value))) {
      errors[key] = rule.integer ? "Zadejte celé číslo" : "Zadejte číslo";
    } else if (value < rule.min || value > rule.max) {
      errors[key] = `Rozsah ${rule.min} až ${rule.max}`;
    } else {
      data[key] = value;
    }
  }

  if ("status" in record) {
    const status = String(record.status ?? "");
    if ((CLIENT_STATUSES as readonly string[]).includes(status)) data.status = status;
    else errors.status = "Neznámý stav";
  }
  if ("webPotential" in record) {
    const potential = String(record.webPotential ?? "").trim();
    if (!potential || (WEB_POTENTIALS as readonly string[]).includes(potential)) {
      data.webPotential = potential;
    } else {
      errors.webPotential = "Neznámý potenciál";
    }
  }
  if ("nextStepDate" in record) {
    const date = String(record.nextStepDate ?? "").trim();
    if (date && !ISO_DATE.test(date)) errors.nextStepDate = "Datum ve formátu RRRR-MM-DD";
    else data.nextStepDate = date;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data };
}
