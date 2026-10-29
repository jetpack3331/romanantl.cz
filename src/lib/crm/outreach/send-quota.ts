import type { Db } from "@/lib/crm/db";

/** Rolling window the SMTP provider's daily limit is checked against. */
const WINDOW_MS = 24 * 60 * 60 * 1000;

export type SendQuota = {
  /** null = no limit configured */
  limit: number | null;
  /** E-mails sent by the CRM in the last 24 hours. */
  sent: number;
  /** When the next e-mail can be sent again (ISO), only set when the limit is reached. */
  nextFreeAt: string | null;
};

/**
 * Counts CRM e-mails in the last 24 hours. A rolling window is used because
 * it never exceeds the provider's daily limit, whichever way the provider
 * resets it.
 */
export function getSendQuota(db: Db, limit: number | null, now: Date = new Date()): SendQuota {
  const since = new Date(now.getTime() - WINDOW_MS).toISOString();
  const sentAt = db
    .prepare("SELECT sent_at FROM sent_emails WHERE sent_at > ? ORDER BY sent_at ASC")
    .all(since)
    .map((row) => String(row.sent_at));
  const sent = sentAt.length;
  if (limit === null || sent < limit) return { limit, sent, nextFreeAt: null };
  // Sending one more needs (sent - limit + 1) of the oldest e-mails to leave the window
  const freedBy = sentAt[sent - limit];
  return {
    limit,
    sent,
    nextFreeAt: new Date(new Date(freedBy).getTime() + WINDOW_MS).toISOString(),
  };
}

export function isQuotaExhausted(quota: SendQuota): boolean {
  return quota.limit !== null && quota.sent >= quota.limit;
}
