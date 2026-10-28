import type { SQLInputValue } from "node:sqlite";
import { transaction, type Db } from "@/lib/crm/db";
import {
  DEFAULT_STATUS,
  DO_NOT_CONTACT_STATUS,
  EMAIL_SENT_STATUS,
} from "@/lib/crm/clients/statuses";
import {
  DEFAULT_CLIENT_SORT,
  clientOrderBy,
  type ClientSort,
} from "@/lib/crm/clients/sorting";

export type Client = {
  id: number;
  importKey: string | null;
  name: string;
  website: string;
  address: string;
  phone: string;
  emails: string;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUrl: string;
  webPotential: string;
  webScore: number | null;
  webProblems: string;
  platform: string;
  mobilePerformance: number | null;
  status: string;
  nextStep: string;
  nextStepDate: string;
  lastContactAt: string;
  callNote: string;
  calledBy: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

/** Contact and audit data that comes from the lead spreadsheet. */
const DIRECTORY_FIELDS = [
  "name",
  "website",
  "address",
  "phone",
  "emails",
  "rating",
  "reviewCount",
  "googleMapsUrl",
  "webPotential",
  "webScore",
  "webProblems",
  "platform",
  "mobilePerformance",
] as const;

/** Pipeline data maintained in the CRM. */
const TRACKING_FIELDS = [
  "status",
  "nextStep",
  "nextStepDate",
  "lastContactAt",
  "callNote",
  "calledBy",
] as const;

type DirectoryField = (typeof DIRECTORY_FIELDS)[number];
type TrackingField = (typeof TRACKING_FIELDS)[number];
export type ClientData = Pick<Client, DirectoryField | TrackingField>;

const COLUMNS: Record<keyof Client, string> = {
  id: "id",
  importKey: "import_key",
  name: "name",
  website: "website",
  address: "address",
  phone: "phone",
  emails: "emails",
  rating: "rating",
  reviewCount: "review_count",
  googleMapsUrl: "google_maps_url",
  webPotential: "web_potential",
  webScore: "web_score",
  webProblems: "web_problems",
  platform: "platform",
  mobilePerformance: "mobile_performance",
  status: "status",
  nextStep: "next_step",
  nextStepDate: "next_step_date",
  lastContactAt: "last_contact_at",
  callNote: "call_note",
  calledBy: "called_by",
  source: "source",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const SELECT_CLIENT = `SELECT ${Object.entries(COLUMNS)
  .map(([key, column]) => `${column} AS ${key}`)
  .join(", ")} FROM clients`;

function toClient(row: Record<string, unknown>): Client {
  return { ...(row as unknown as Client), id: Number(row.id) };
}

/** Splits the `emails` cell ("a@x.cz, b@x.cz") into normalized addresses. */
export function splitEmails(emails: string): string[] {
  return emails
    .split(/[,;\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.includes("@"));
}

const czechCollator = new Intl.Collator("cs", { sensitivity: "base", numeric: true });

export type ClientFilters = {
  q?: string;
  status?: string;
  potential?: string;
  hasEmail?: boolean;
  /** Only clients whose next step is due on or before this ISO date. */
  dueBy?: string;
};

export function listClients(
  db: Db,
  filters: ClientFilters = {},
  selectedSort: ClientSort | null = null
): Client[] {
  const sort = selectedSort ?? DEFAULT_CLIENT_SORT;
  const where: string[] = [];
  const params: SQLInputValue[] = [];
  if (filters.q) {
    where.push("(name LIKE ? OR website LIKE ? OR emails LIKE ? OR phone LIKE ? OR call_note LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like, like, like, like);
  }
  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.potential) {
    where.push("web_potential = ?");
    params.push(filters.potential);
  }
  if (filters.hasEmail) where.push("emails <> ''");
  if (filters.dueBy) {
    where.push("next_step_date <> '' AND next_step_date <= ?");
    params.push(filters.dueBy);
  }
  const sql = `${SELECT_CLIENT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""}
    ORDER BY ${clientOrderBy(sort)}`;
  const clients = db.prepare(sql).all(...params).map(toClient);
  if (sort.key !== "firma") return clients;
  // SQLite orders by code point (Š after Z); Czech collation needs Intl
  const sorted = clients.sort((a, b) => czechCollator.compare(a.name, b.name));
  return sort.direction === "desc" ? sorted.reverse() : sorted;
}

export function getClient(db: Db, id: number): Client | null {
  const row = db.prepare(`${SELECT_CLIENT} WHERE id = ?`).get(id);
  return row ? toClient(row) : null;
}

export function countClientsByStatus(db: Db): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of db.prepare("SELECT status, COUNT(*) AS n FROM clients GROUP BY status").all()) {
    counts[String(row.status)] = Number(row.n);
  }
  return counts;
}

function writeColumns(db: Db, id: number, data: Partial<Client>, now: string): void {
  const entries = Object.entries(data).filter(([key]) => key in COLUMNS && key !== "id");
  if (entries.length === 0) return;
  const assignments = entries.map(([key]) => `${COLUMNS[key as keyof Client]} = ?`);
  db.prepare(`UPDATE clients SET ${assignments.join(", ")}, updated_at = ? WHERE id = ?`).run(
    ...entries.map(([, value]) => value as SQLInputValue),
    now,
    id
  );
}

export function updateClient(
  db: Db,
  id: number,
  data: Partial<ClientData>,
  now: Date = new Date()
): Client | null {
  if (!getClient(db, id)) return null;
  writeColumns(db, id, data, now.toISOString());
  return getClient(db, id);
}

export function createClient(
  db: Db,
  data: Partial<ClientData> & { name: string; importKey?: string | null; source?: string },
  now: Date = new Date()
): Client {
  const timestamp = now.toISOString();
  const result = db
    .prepare(
      "INSERT INTO clients (name, import_key, source, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(data.name, data.importKey ?? null, data.source ?? "", data.status || DEFAULT_STATUS, timestamp, timestamp);
  const id = Number(result.lastInsertRowid);
  const rest: Partial<Client> = { ...data };
  delete rest.importKey;
  delete rest.source;
  writeColumns(db, id, rest, timestamp);
  return getClient(db, id) as Client;
}

/** Deletes the client; its sent e-mails stay in the log without the link. */
export function deleteClient(db: Db, id: number): boolean {
  return Number(db.prepare("DELETE FROM clients WHERE id = ?").run(id).changes) > 0;
}

export type ImportedClient = Partial<ClientData> & { name: string; importKey: string };

const isBlank = (value: unknown) => value === null || value === undefined || value === "";

/**
 * Creates or updates clients by import key. Directory fields are overwritten
 * by non-empty values from the file; tracking fields (status, notes, next
 * step) are only filled in when the CRM has nothing yet, so re-importing the
 * spreadsheet never undoes work done in the CRM.
 */
export function importClients(
  db: Db,
  rows: ImportedClient[],
  source: string,
  now: Date = new Date()
): { created: number; updated: number } {
  let created = 0;
  let updated = 0;
  transaction(db, () => {
    for (const row of rows) {
      const existingRow = db.prepare(`${SELECT_CLIENT} WHERE import_key = ?`).get(row.importKey);
      if (!existingRow) {
        createClient(db, { ...row, source }, now);
        created += 1;
        continue;
      }
      const existing = toClient(existingRow);
      const patch: Partial<Client> = {};
      for (const key of DIRECTORY_FIELDS) {
        if (!isBlank(row[key]) && row[key] !== existing[key]) {
          Object.assign(patch, { [key]: row[key] });
        }
      }
      for (const key of TRACKING_FIELDS) {
        const current = existing[key];
        const empty = key === "status" ? current === DEFAULT_STATUS : isBlank(current);
        if (empty && !isBlank(row[key]) && row[key] !== current) {
          Object.assign(patch, { [key]: row[key] });
        }
      }
      if (Object.keys(patch).length > 0) {
        writeColumns(db, existing.id, patch, now.toISOString());
        updated += 1;
      }
    }
  });
  return { created, updated };
}

/** Records an outreach e-mail on the client card. */
export function markEmailSent(db: Db, id: number, now: Date = new Date()): void {
  const client = getClient(db, id);
  if (!client) return;
  writeColumns(
    db,
    id,
    {
      lastContactAt: now.toISOString().slice(0, 10),
      ...(client.status === DEFAULT_STATUS ? { status: EMAIL_SENT_STATUS } : {}),
    },
    now.toISOString()
  );
}

/** Flags every client that lists the address as "do not contact". */
export function markClientsUnsubscribed(db: Db, email: string, now: Date = new Date()): number {
  const normalized = email.trim().toLowerCase();
  const candidates = db
    .prepare("SELECT id, emails FROM clients WHERE LOWER(emails) LIKE ?")
    .all(`%${normalized}%`);
  let count = 0;
  for (const row of candidates) {
    if (splitEmails(String(row.emails)).includes(normalized)) {
      writeColumns(db, Number(row.id), { status: DO_NOT_CONTACT_STATUS }, now.toISOString());
      count += 1;
    }
  }
  return count;
}
