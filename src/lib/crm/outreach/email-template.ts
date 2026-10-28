/**
 * "E-mail before a call" template (source: scripts/google-places/email_before_call.md).
 * Pure module: shared by the CRM form preview (browser) and the send endpoint.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SENDER_FIELDS = [
  "senderName",
  "businessName",
  "businessId",
  "senderPhone",
  "senderEmail",
  "ourWebsite",
] as const;

export const CLIENT_FIELDS = [
  "recipientEmail",
  "companyName",
  "clientUrl",
  "websiteProblem",
  "proposedImprovement",
  "customerBenefit",
  "callTimeframe",
] as const;

export type SenderField = (typeof SENDER_FIELDS)[number];
export type ClientField = (typeof CLIENT_FIELDS)[number];

/** "team": Niki writes on behalf of herself and Roman; "solo": the sender works alone. */
export type Intro = "team" | "solo";
export type Gender = "female" | "male";

export type EmailFields = Record<SenderField | ClientField, string> & {
  intro: Intro;
  gender: Gender;
};

const OPTIONAL_FIELDS: ReadonlySet<string> = new Set(["ourWebsite"]);
const LONG_FIELDS: ReadonlySet<string> = new Set([
  "websiteProblem",
  "proposedImprovement",
  "customerBenefit",
]);
const MAX_SHORT_LENGTH = 200;
const MAX_LONG_LENGTH = 1000;

export const EMPTY_FIELDS: EmailFields = {
  intro: "team",
  gender: "female",
  senderName: "",
  businessName: "",
  businessId: "",
  senderPhone: "",
  senderEmail: "",
  ourWebsite: "",
  recipientEmail: "",
  companyName: "",
  clientUrl: "",
  websiteProblem: "",
  proposedImprovement: "",
  customerBenefit: "",
  callTimeframe: "",
};

export type FieldErrors = Partial<Record<keyof EmailFields, string>>;

/**
 * Normalizes and checks the given text fields of a request body; shared by the
 * e-mail form and saved sender profiles.
 */
function readFields<K extends SenderField | ClientField>(
  record: Record<string, unknown>,
  keys: readonly K[]
): { values: Record<K, string>; errors: FieldErrors } {
  const values = {} as Record<K, string>;
  const errors: FieldErrors = {};
  for (const key of keys) {
    const raw = record[key];
    // Collapse line breaks: every field is rendered inline within a sentence.
    let value =
      typeof raw === "string" ? raw.replace(/\s*[\r\n]+\s*/g, " ").trim() : "";
    if (key === "recipientEmail") value = value.toLowerCase();
    const max = LONG_FIELDS.has(key) ? MAX_LONG_LENGTH : MAX_SHORT_LENGTH;
    if (!value && !OPTIONAL_FIELDS.has(key)) {
      errors[key] = "Povinné pole";
    } else if (value.length > max) {
      errors[key] = `Maximálně ${max} znaků`;
    } else if (
      (key === "recipientEmail" || key === "senderEmail") &&
      value &&
      !EMAIL_REGEX.test(value)
    ) {
      errors[key] = "Neplatný e-mail";
    }
    values[key] = value;
  }
  return { values, errors };
}

function readVariant(record: Record<string, unknown>): Pick<EmailFields, "intro" | "gender"> {
  return {
    intro: record.intro === "solo" ? "solo" : "team",
    gender: record.gender === "male" ? "male" : "female",
  };
}

export function validateEmailFields(body: unknown):
  | { ok: true; data: EmailFields }
  | { ok: false; errors: FieldErrors } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: { companyName: "Neplatná data formuláře" } };
  }
  const record = body as Record<string, unknown>;
  const { values, errors } = readFields(record, [...SENDER_FIELDS, ...CLIENT_FIELDS]);
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, data: { ...readVariant(record), ...values } };
}

export type SenderFields = Pick<EmailFields, SenderField | "intro" | "gender">;
export type SenderProfileInput = SenderFields & { label: string };

const MAX_PROFILE_LABEL_LENGTH = 60;

/** Validates a saved sender profile: its label plus the sender part of the form. */
export function validateSenderProfile(body: unknown):
  | { ok: true; data: SenderProfileInput }
  | { ok: false; errors: FieldErrors & { label?: string } } {
  const record =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const { values, errors } = readFields(record, SENDER_FIELDS);
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const allErrors: FieldErrors & { label?: string } = { ...errors };
  if (!label) allErrors.label = "Zadejte název profilu";
  else if (label.length > MAX_PROFILE_LABEL_LENGTH) {
    allErrors.label = `Maximálně ${MAX_PROFILE_LABEL_LENGTH} znaků`;
  }
  return Object.keys(allErrors).length > 0
    ? { ok: false, errors: allErrors }
    : { ok: true, data: { label, ...readVariant(record), ...values } };
}

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

/** A chunk of a paragraph: plain text or a link. */
type Segment = string | { href: string; label: string };
type Paragraph = Segment[];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function buildParagraphs(f: EmailFields, unsubscribeUrl: string): Paragraph[] {
  const female = f.gender === "female";
  const intro =
    f.intro === "team"
      ? `jmenuji se ${f.senderName} a společně s Romanem pomáháme firmám s tvorbou a úpravami webových stránek.`
      : `jmenuji se ${f.senderName} a věnuji se tvorbě a úpravám webových stránek pro firmy.`;
  const noticed = f.intro === "team" ? "jsme si všimli" : "jsem si všiml" + (female ? "a" : "");

  const signature: Paragraph = [
    `${f.senderName}\n${f.businessName}, IČO: ${f.businessId}\nTelefon: ${f.senderPhone}\nE-mail: ${f.senderEmail}`,
  ];
  if (f.ourWebsite) {
    signature.push("\nWeb: ", { href: withProtocol(f.ourWebsite), label: f.ourWebsite });
  }

  return [
    ["Dobrý den,"],
    [intro],
    [
      "Při procházení webu ",
      { href: withProtocol(f.clientUrl), label: f.clientUrl },
      ` společnosti ${f.companyName} ${noticed} jedné věci: ${f.websiteProblem}`,
    ],
    [`Navrhujeme ${f.proposedImprovement}. Díky tomu by ${f.customerBenefit}.`],
    [
      `${female ? "Ráda" : "Rád"} bych Vám ${f.callTimeframe} krátce ${female ? "zavolala" : "zavolal"} a zjistil${female ? "a" : ""}, jestli je to pro Vás aktuální téma. Píšu předem, abyste měli čas si návrh v klidu přečíst. Pokud se Vám hodí konkrétní čas, stačí mi odpovědět na tento e-mail.`,
    ],
    [
      "Pokud o nabídku ani další kontakt nemáte zájem, stačí se ",
      { href: unsubscribeUrl, label: "odhlásit jedním kliknutím" },
      " a už se neozveme.",
    ],
    ["Děkuji a přeji hezký den,"],
    signature,
  ];
}

function paragraphToText(paragraph: Paragraph): string {
  return paragraph
    .map((segment) =>
      typeof segment === "string"
        ? segment
        : segment.label === segment.href || withProtocol(segment.label) === segment.href
          ? segment.label
          : `${segment.label} (${segment.href})`
    )
    .join("");
}

function paragraphToHtml(paragraph: Paragraph): string {
  const inner = paragraph
    .map((segment) =>
      typeof segment === "string"
        ? escapeHtml(segment).replace(/\n/g, "<br>")
        : `<a href="${escapeHtml(segment.href)}">${escapeHtml(segment.label)}</a>`
    )
    .join("");
  return `<p style="margin:0 0 1em">${inner}</p>`;
}

export function renderEmail(
  fields: EmailFields,
  unsubscribeUrl: string
): RenderedEmail {
  const paragraphs = buildParagraphs(fields, unsubscribeUrl);
  return {
    subject: `Nabídka úpravy webu ${fields.companyName}`.replace(/[\r\n]+/g, " "),
    text: paragraphs.map(paragraphToText).join("\n\n"),
    html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1c2318">${paragraphs
      .map(paragraphToHtml)
      .join("")}</div>`,
  };
}
