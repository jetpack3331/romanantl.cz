import { beforeEach, describe, expect, it } from "vitest";
import { openDb, type Db } from "@/lib/crm/db";
import { validateSenderProfile } from "@/lib/crm/outreach/email-template";
import {
  deleteSenderProfile,
  listSenderProfiles,
  saveSenderProfile,
} from "@/lib/crm/outreach/sender-profiles";

const NIKI = {
  label: "Niki",
  intro: "team",
  gender: "female",
  senderName: "Niki Nováková",
  businessName: "Niki Nováková",
  businessId: "12345678",
  senderPhone: "+420 777 000 000",
  senderEmail: "niki@example.cz",
  ourWebsite: "",
} as const;

let db: Db;

beforeEach(() => {
  db = openDb(":memory:");
});

describe("validateSenderProfile", () => {
  it("accepts sender fields without any client fields", () => {
    const result = validateSenderProfile({ ...NIKI, label: " Niki ", recipientEmail: "" });
    expect(result).toEqual({ ok: true, data: { ...NIKI } });
  });

  it("requires a label and valid sender fields", () => {
    const result = validateSenderProfile({ ...NIKI, label: "", senderEmail: "nope", businessId: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["businessId", "label", "senderEmail"]);
    }
  });
});

describe("sender profiles", () => {
  it("creates, overwrites by label, lists and deletes", () => {
    const created = saveSenderProfile(db, { ...NIKI });
    saveSenderProfile(db, { ...NIKI, label: "Roman", intro: "solo", gender: "male", senderName: "Roman Antl" });
    const updated = saveSenderProfile(db, { ...NIKI, senderPhone: "+420 600 000 000" });

    expect(updated.id).toBe(created.id);
    expect(listSenderProfiles(db).map((p) => [p.label, p.senderPhone])).toEqual([
      ["Niki", "+420 600 000 000"],
      ["Roman", "+420 777 000 000"],
    ]);
    expect(deleteSenderProfile(db, created.id)).toBe(true);
    expect(deleteSenderProfile(db, created.id)).toBe(false);
    expect(listSenderProfiles(db)).toHaveLength(1);
  });
});
