import { transaction, type Db } from "@/lib/crm/db";
import { markClientsUnsubscribed } from "@/lib/crm/clients/repository";

export type SentEmail = {
  id: number;
  clientId: number | null;
  toEmail: string;
  companyName: string;
  clientUrl: string;
  senderName: string;
  subject: string;
  sentAt: string;
};

export type Unsubscribe = { email: string; unsubscribedAt: string };

const SELECT_SENT = `SELECT id, client_id AS clientId, to_email AS toEmail, company_name AS companyName,
  client_url AS clientUrl, sender_name AS senderName, subject, sent_at AS sentAt FROM sent_emails`;

const toSentEmail = (row: Record<string, unknown>) => row as unknown as SentEmail;

export function logSentEmail(db: Db, email: Omit<SentEmail, "id">): void {
  db.prepare(
    `INSERT INTO sent_emails (client_id, to_email, company_name, client_url, sender_name, subject, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    email.clientId,
    email.toEmail.trim().toLowerCase(),
    email.companyName,
    email.clientUrl,
    email.senderName,
    email.subject,
    email.sentAt
  );
}

export function listSentEmails(db: Db, limit = 200): SentEmail[] {
  return db.prepare(`${SELECT_SENT} ORDER BY sent_at DESC LIMIT ?`).all(limit).map(toSentEmail);
}

export function listSentEmailsForClient(db: Db, clientId: number): SentEmail[] {
  return db
    .prepare(`${SELECT_SENT} WHERE client_id = ? ORDER BY sent_at DESC`)
    .all(clientId)
    .map(toSentEmail);
}

export function countSentEmails(db: Db): number {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM sent_emails").get()?.n ?? 0);
}

export function wasSentTo(db: Db, email: string): boolean {
  return Boolean(
    db.prepare("SELECT 1 FROM sent_emails WHERE to_email = ? LIMIT 1").get(email.trim().toLowerCase())
  );
}

export function isUnsubscribed(db: Db, email: string): boolean {
  return Boolean(
    db.prepare("SELECT 1 FROM unsubscribes WHERE email = ?").get(email.trim().toLowerCase())
  );
}

export function listUnsubscribes(db: Db): Unsubscribe[] {
  return db
    .prepare("SELECT email, unsubscribed_at AS unsubscribedAt FROM unsubscribes ORDER BY unsubscribed_at DESC")
    .all()
    .map((row) => row as unknown as Unsubscribe);
}

/**
 * Stores the opt-out and marks matching clients as "do not contact".
 * Returns false when the address was already unsubscribed.
 */
export function addUnsubscribe(db: Db, email: string, now: Date = new Date()): boolean {
  const normalized = email.trim().toLowerCase();
  return transaction(db, () => {
    const result = db
      .prepare("INSERT OR IGNORE INTO unsubscribes (email, unsubscribed_at) VALUES (?, ?)")
      .run(normalized, now.toISOString());
    markClientsUnsubscribed(db, normalized, now);
    return Number(result.changes) > 0;
  });
}
