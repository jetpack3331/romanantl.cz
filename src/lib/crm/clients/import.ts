import { parseCsv } from "@/lib/crm/clients/csv";
import type { ClientData, ImportedClient } from "@/lib/crm/clients/repository";

/**
 * Column headers accepted for each client field: the Czech headers of the
 * lead spreadsheet (leady_*.csv / Google Sheet) and the English headers of the
 * scraper's companies_*.csv.
 */
const HEADER_ALIASES: Record<keyof ClientData, string[]> = {
  name: ["název firmy", "name"],
  website: ["web", "website"],
  address: ["adresa", "address"],
  phone: ["telefon", "phone"],
  emails: ["e-mail", "email"],
  rating: ["hodnocení", "rating"],
  reviewCount: ["počet recenzí", "review_count"],
  googleMapsUrl: ["google maps", "google_maps_url"],
  webPotential: ["potenciál webu"],
  webScore: ["skóre webu"],
  webProblems: ["problémy webu"],
  platform: ["platforma"],
  mobilePerformance: ["výkon mobil"],
  status: ["stav kontaktu"],
  nextStep: ["další krok"],
  nextStepDate: ["datum dalšího kroku"],
  lastContactAt: ["poslední kontakt"],
  callNote: ["poznámka z hovoru"],
  calledBy: ["volal(a)"],
};

const NUMBER_FIELDS = new Set<keyof ClientData>(["rating"]);
const INTEGER_FIELDS = new Set<keyof ClientData>(["reviewCount", "webScore", "mobilePerformance"]);
const DATE_FIELDS = new Set<keyof ClientData>(["nextStepDate", "lastContactAt"]);

function parseNumber(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

/** "27.10.2026" or "2026-10-27" -> "2026-10-27"; anything else is kept as typed. */
export function normalizeDate(value: string): string {
  const czech = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/.exec(value);
  if (czech) {
    return `${czech[3]}-${czech[2].padStart(2, "0")}-${czech[1].padStart(2, "0")}`;
  }
  return value;
}

function normalizeWebsite(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/** Google Maps `cid` identifies the place; website or name are fallbacks. */
export function importKeyFor(client: Partial<ClientData> & { name: string }): string {
  const cid = /[?&]cid=(\d+)/.exec(client.googleMapsUrl ?? "")?.[1];
  if (cid) return `gmaps:${cid}`;
  if (client.website) return `web:${normalizeWebsite(client.website)}`;
  return `name:${client.name.trim().toLowerCase()}`;
}

export type ParsedImport = {
  clients: ImportedClient[];
  skipped: number;
  /** Recognized columns, for the import summary. */
  columns: (keyof ClientData)[];
};

export function parseClientsCsv(csv: string): ParsedImport {
  const [header, ...rows] = parseCsv(csv);
  if (!header) throw new Error("Soubor je prázdný");

  const normalizedHeader = header.map((cell) => cell.trim().toLowerCase());
  const columnIndex = new Map<keyof ClientData, number>();
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [keyof ClientData, string[]][]) {
    const index = normalizedHeader.findIndex((cell) => aliases.includes(cell));
    if (index >= 0) columnIndex.set(field, index);
  }
  if (!columnIndex.has("name")) {
    throw new Error("Chybí sloupec „Název firmy“");
  }

  const clients: ImportedClient[] = [];
  let skipped = 0;
  for (const row of rows) {
    const client: Partial<ClientData> = {};
    for (const [field, index] of columnIndex) {
      const raw = (row[index] ?? "").trim();
      if (NUMBER_FIELDS.has(field)) {
        Object.assign(client, { [field]: raw ? parseNumber(raw) : null });
      } else if (INTEGER_FIELDS.has(field)) {
        const parsed = raw ? parseNumber(raw) : null;
        Object.assign(client, { [field]: parsed === null ? null : Math.round(parsed) });
      } else if (DATE_FIELDS.has(field)) {
        Object.assign(client, { [field]: normalizeDate(raw) });
      } else {
        Object.assign(client, { [field]: raw });
      }
    }
    if (!client.name) {
      skipped += 1;
      continue;
    }
    const named = client as Partial<ClientData> & { name: string };
    clients.push({ ...named, importKey: importKeyFor(named) });
  }
  return { clients, skipped, columns: [...columnIndex.keys()] };
}
