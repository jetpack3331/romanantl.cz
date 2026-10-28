import type { Db } from "@/lib/crm/db";
import type { SenderProfileInput } from "@/lib/crm/outreach/email-template";

export type SenderProfile = SenderProfileInput & { id: number };

const SELECT_PROFILE = `SELECT id, label, intro, gender, sender_name AS senderName,
  business_name AS businessName, business_id AS businessId, sender_phone AS senderPhone,
  sender_email AS senderEmail, our_website AS ourWebsite FROM sender_profiles`;

const toProfile = (row: Record<string, unknown>) =>
  ({ ...row, id: Number(row.id) }) as unknown as SenderProfile;

export function listSenderProfiles(db: Db): SenderProfile[] {
  return db.prepare(`${SELECT_PROFILE} ORDER BY label COLLATE NOCASE`).all().map(toProfile);
}

/** Creates the profile, or overwrites the one with the same label. */
export function saveSenderProfile(
  db: Db,
  profile: SenderProfileInput,
  now: Date = new Date()
): SenderProfile {
  db.prepare(
    `INSERT INTO sender_profiles (label, intro, gender, sender_name, business_name, business_id,
       sender_phone, sender_email, our_website, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (label) DO UPDATE SET intro = excluded.intro, gender = excluded.gender,
       sender_name = excluded.sender_name, business_name = excluded.business_name,
       business_id = excluded.business_id, sender_phone = excluded.sender_phone,
       sender_email = excluded.sender_email, our_website = excluded.our_website,
       updated_at = excluded.updated_at`
  ).run(
    profile.label,
    profile.intro,
    profile.gender,
    profile.senderName,
    profile.businessName,
    profile.businessId,
    profile.senderPhone,
    profile.senderEmail,
    profile.ourWebsite,
    now.toISOString()
  );
  return toProfile(
    db.prepare(`${SELECT_PROFILE} WHERE label = ?`).get(profile.label) as Record<string, unknown>
  );
}

export function deleteSenderProfile(db: Db, id: number): boolean {
  return Number(db.prepare("DELETE FROM sender_profiles WHERE id = ?").run(id).changes) > 0;
}
