import { beforeEach, describe, expect, it } from "vitest";
import { parseDailySendLimit } from "@/lib/crm/config";
import { openDb, type Db } from "@/lib/crm/db";
import { logSentEmail } from "@/lib/crm/outreach/repository";
import { getSendQuota, isQuotaExhausted } from "@/lib/crm/outreach/send-quota";

const NOW = new Date("2026-10-29T15:00:00.000Z");

let db: Db;

function sentAt(iso: string) {
  logSentEmail(db, {
    clientId: null,
    toEmail: `${iso}@example.cz`,
    companyName: "Firma",
    clientUrl: "firma.cz",
    senderName: "Niki",
    subject: "Nabídka",
    sentAt: iso,
  });
}

beforeEach(() => {
  db = openDb(":memory:");
});

describe("parseDailySendLimit", () => {
  it("defaults to 20, 0 disables the limit, invalid values fall back to the default", () => {
    expect(parseDailySendLimit("")).toBe(20);
    expect(parseDailySendLimit("5")).toBe(5);
    expect(parseDailySendLimit("0")).toBeNull();
    expect(parseDailySendLimit("-1")).toBe(20);
    expect(parseDailySendLimit("abc")).toBe(20);
  });
});

describe("getSendQuota", () => {
  it("counts only e-mails from the last 24 hours", () => {
    sentAt("2026-10-28T14:59:59.000Z"); // just outside the window
    sentAt("2026-10-28T15:30:00.000Z");
    sentAt("2026-10-29T10:00:00.000Z");
    expect(getSendQuota(db, 20, NOW)).toEqual({ limit: 20, sent: 2, nextFreeAt: null });
  });

  it("reports when the next e-mail can go out once the limit is reached", () => {
    sentAt("2026-10-28T16:00:00.000Z");
    sentAt("2026-10-28T18:00:00.000Z");
    sentAt("2026-10-29T09:00:00.000Z");
    const quota = getSendQuota(db, 2, NOW);
    expect(isQuotaExhausted(quota)).toBe(true);
    // 3 sent, limit 2: the two oldest must expire, the second one at 18:00 + 24 h
    expect(quota.nextFreeAt).toBe("2026-10-29T18:00:00.000Z");
  });

  it("never blocks without a limit", () => {
    sentAt("2026-10-29T09:00:00.000Z");
    const quota = getSendQuota(db, null, NOW);
    expect(quota).toEqual({ limit: null, sent: 1, nextFreeAt: null });
    expect(isQuotaExhausted(quota)).toBe(false);
  });
});
