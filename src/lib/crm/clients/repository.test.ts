import { beforeEach, describe, expect, it } from "vitest";
import {
  createClient,
  deleteClient,
  getClient,
  importClients,
  listClients,
  markEmailSent,
  splitEmails,
  updateClient,
} from "@/lib/crm/clients/repository";
import { openDb, type Db } from "@/lib/crm/db";
import {
  addUnsubscribe,
  isUnsubscribed,
  listSentEmailsForClient,
  logSentEmail,
  wasSentTo,
} from "@/lib/crm/outreach/repository";

let db: Db;

beforeEach(() => {
  db = openDb(":memory:");
});

describe("migrations", () => {
  it("are idempotent", () => {
    expect(() => openDb(":memory:")).not.toThrow();
    const versions = db.prepare("SELECT version FROM schema_migrations").all();
    expect(versions.length).toBeGreaterThan(0);
  });
});

describe("clients", () => {
  it("filters by text, status, potential, e-mail and due date", () => {
    createClient(db, { name: "Alfa", emails: "a@alfa.cz", webPotential: "vysoký", webScore: 80 });
    createClient(db, { name: "Beta", status: "nevolat", nextStepDate: "2026-10-20" });
    createClient(db, { name: "Gama", nextStepDate: "2026-11-30", webScore: 10 });

    expect(listClients(db).map((c) => c.name)).toEqual(["Alfa", "Gama", "Beta"]);
    expect(listClients(db, { q: "alf" }).map((c) => c.name)).toEqual(["Alfa"]);
    expect(listClients(db, { status: "nevolat" }).map((c) => c.name)).toEqual(["Beta"]);
    expect(listClients(db, { potential: "vysoký", hasEmail: true })).toHaveLength(1);
    expect(listClients(db, { dueBy: "2026-10-27" }).map((c) => c.name)).toEqual(["Beta"]);
  });

  it("updates editable fields", () => {
    const client = createClient(db, { name: "Alfa" });
    const updated = updateClient(db, client.id, { callNote: "zavolat v pondělí", status: "má zájem" });
    expect(updated).toMatchObject({ callNote: "zavolat v pondělí", status: "má zájem" });
    expect(updateClient(db, 999, { name: "x" })).toBeNull();
  });

  it("re-import updates directory data but keeps CRM tracking work", () => {
    const first = importClients(db, [
      { importKey: "gmaps:1", name: "Alfa", phone: "111", status: "nekontaktováno" },
    ], "sheet");
    expect(first).toEqual({ created: 1, updated: 0 });
    const [client] = listClients(db);
    updateClient(db, client.id, { status: "má zájem", callNote: "domluveno" });

    const second = importClients(db, [
      { importKey: "gmaps:1", name: "Alfa s.r.o.", phone: "", status: "kontaktováno", callNote: "z tabulky", nextStep: "poslat nabídku" },
      { importKey: "gmaps:2", name: "Beta" },
    ], "sheet");
    expect(second).toEqual({ created: 1, updated: 1 });
    expect(getClient(db, client.id)).toMatchObject({
      name: "Alfa s.r.o.",
      phone: "111",
      status: "má zájem",
      callNote: "domluveno",
      nextStep: "poslat nabídku",
      source: "sheet",
    });
  });

  it("marks a not yet contacted client after an e-mail", () => {
    const fresh = createClient(db, { name: "Alfa" });
    const interested = createClient(db, { name: "Beta", status: "má zájem" });
    markEmailSent(db, fresh.id, new Date("2026-10-27T10:00:00Z"));
    markEmailSent(db, interested.id, new Date("2026-10-27T10:00:00Z"));
    expect(getClient(db, fresh.id)).toMatchObject({ status: "e-mail odeslán", lastContactAt: "2026-10-27" });
    expect(getClient(db, interested.id)?.status).toBe("má zájem");
  });

  it("deletes a client and keeps its sent e-mails without the link", () => {
    const client = createClient(db, { name: "Alfa" });
    logSentEmail(db, {
      clientId: client.id,
      toEmail: "a@alfa.cz",
      companyName: "Alfa",
      clientUrl: "alfa.cz",
      senderName: "Niki",
      subject: "Nabídka",
      sentAt: "2026-10-27T10:00:00.000Z",
    });
    expect(deleteClient(db, client.id)).toBe(true);
    expect(deleteClient(db, client.id)).toBe(false);
    expect(getClient(db, client.id)).toBeNull();
    expect(wasSentTo(db, "a@alfa.cz")).toBe(true);
    expect(db.prepare("SELECT client_id FROM sent_emails").get()?.client_id).toBeNull();
  });

  it("splits multi-address cells", () => {
    expect(splitEmails("A@x.cz, b@x.cz;c@x.cz  nope")).toEqual(["a@x.cz", "b@x.cz", "c@x.cz"]);
  });
});

describe("outreach", () => {
  it("logs sent e-mails per client", () => {
    const client = createClient(db, { name: "Alfa" });
    logSentEmail(db, {
      clientId: client.id,
      toEmail: "Info@Alfa.cz",
      companyName: "Alfa",
      clientUrl: "alfa.cz",
      senderName: "Niki",
      subject: "Nabídka",
      sentAt: "2026-10-27T10:00:00.000Z",
    });
    expect(wasSentTo(db, "info@alfa.cz")).toBe(true);
    expect(listSentEmailsForClient(db, client.id)).toHaveLength(1);
  });

  it("unsubscribes once and flags matching clients", () => {
    const client = createClient(db, { name: "Alfa", emails: "obchod@alfa.cz, info@alfa.cz" });
    const other = createClient(db, { name: "Beta", emails: "xinfo@alfa.cz" });
    expect(addUnsubscribe(db, "INFO@alfa.cz")).toBe(true);
    expect(addUnsubscribe(db, "info@alfa.cz")).toBe(false);
    expect(isUnsubscribed(db, "info@alfa.cz")).toBe(true);
    expect(getClient(db, client.id)?.status).toBe("nevolat");
    expect(getClient(db, other.id)?.status).toBe("nekontaktováno");
  });
});
