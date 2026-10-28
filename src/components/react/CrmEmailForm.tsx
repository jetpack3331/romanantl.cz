import { useEffect, useMemo, useState } from "react";
import {
  CLIENT_FIELDS,
  EMPTY_FIELDS,
  SENDER_FIELDS,
  renderEmail,
  type EmailFields,
  type FieldErrors,
} from "@/lib/crm/outreach/email-template";
import type { SenderProfile } from "@/lib/crm/outreach/sender-profiles";

/** Remembers which sender profile this browser uses (e.g. Niki's laptop -> "Niki"). */
const PROFILE_STORAGE_KEY = "crm-sender-profile";

type FieldConfig = {
  key: keyof EmailFields;
  label: string;
  hint?: string;
  multiline?: boolean;
  type?: string;
};

const SENDER_FIELD_CONFIG: FieldConfig[] = [
  { key: "senderName", label: "Jméno odesílatele" },
  { key: "businessName", label: "Podnikatel / firma" },
  { key: "businessId", label: "IČO" },
  { key: "senderPhone", label: "Telefon", type: "tel" },
  { key: "senderEmail", label: "E-mail pro odpověď", type: "email" },
  { key: "ourWebsite", label: "Náš web (nepovinné)", hint: "Prázdné = řádek se vynechá." },
];

const CLIENT_FIELD_CONFIG: FieldConfig[] = [
  { key: "recipientEmail", label: "E-mail příjemce", type: "email" },
  { key: "companyName", label: "Název firmy", hint: "V základním tvaru." },
  { key: "clientUrl", label: "URL webu klienta" },
  {
    key: "websiteProblem",
    label: "Problém webu",
    hint: "Celá věta s tečkou, ručně ověřená potíž.",
    multiline: true,
  },
  {
    key: "proposedImprovement",
    label: "Navrhujeme …",
    hint: "Bez tečky na konci.",
    multiline: true,
  },
  {
    key: "customerBenefit",
    label: "Díky tomu by …",
    hint: "Bez tečky na konci.",
    multiline: true,
  },
  { key: "callTimeframe", label: "Kdy zavolat", hint: "Např. „ve čtvrtek odpoledne“." },
];

const PREVIEW_UNSUBSCRIBE_URL = "https://romanantl.cz/odhlaseni?t=…";

const inputClass =
  "rounded-btn border border-pastel-sage bg-pastel-cream px-3 py-2 text-pastel-dark";

function readRememberedProfileId(): number | null {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function rememberProfileId(id: number | null): void {
  try {
    if (id === null) window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    else window.localStorage.setItem(PROFILE_STORAGE_KEY, String(id));
  } catch {
    // Storage may be unavailable (private mode); the first profile is used then.
  }
}

function profileFields(profile: SenderProfile): Partial<EmailFields> {
  const fields: Partial<EmailFields> = { intro: profile.intro, gender: profile.gender };
  for (const key of SENDER_FIELDS) fields[key] = profile[key];
  return fields;
}

/** CRM client the e-mail is written for; prefills the client fields. */
export type EmailFormClient = {
  id: number;
  name: string;
  website: string;
  emails: string[];
  webPotential: string;
  webProblems: string;
};

type CrmEmailFormProps = {
  client?: EmailFormClient | null;
  senderProfiles: SenderProfile[];
};

function clientPrefill(client: EmailFormClient | null | undefined): Partial<EmailFields> {
  if (!client) return {};
  return {
    companyName: client.name,
    clientUrl: client.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    recipientEmail: client.emails[0] ?? "",
  };
}

export function CrmEmailForm({ client, senderProfiles }: CrmEmailFormProps) {
  const [fields, setFields] = useState<EmailFields>({ ...EMPTY_FIELDS, ...clientPrefill(client) });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [alreadySent, setAlreadySent] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);

  const [profiles, setProfiles] = useState<SenderProfile[]>(senderProfiles);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profileLabel, setProfileLabel] = useState("");
  const [profileMessage, setProfileMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function applyProfile(profile: SenderProfile | undefined) {
    setProfileMessage(null);
    if (!profile) {
      setProfileId(null);
      rememberProfileId(null);
      return;
    }
    setFields((current) => ({ ...current, ...profileFields(profile) }));
    setProfileId(profile.id);
    setProfileLabel(profile.label);
    rememberProfileId(profile.id);
  }

  useEffect(() => {
    const rememberedId = readRememberedProfileId();
    applyProfile(senderProfiles.find((p) => p.id === rememberedId) ?? senderProfiles[0]);
    // Runs once on mount with the server-provided profiles.
  }, []);

  async function saveProfile() {
    setProfileMessage(null);
    const sender: Partial<EmailFields> = { intro: fields.intro, gender: fields.gender };
    for (const key of SENDER_FIELDS) sender[key] = fields[key];
    const res = await fetch("/api/crm/sender-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sender, label: profileLabel }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      setFieldErrors(data?.fieldErrors ?? {});
      setProfileMessage({ ok: false, text: data?.fieldErrors?.label ?? data?.error ?? "Uložení selhalo" });
      return;
    }
    setFieldErrors({});
    setProfiles(data.profiles);
    applyProfile(data.profile);
    setProfileMessage({ ok: true, text: `Uloženo. Profil „${data.profile.label}“ se bude předvyplňovat.` });
  }

  async function deleteProfile() {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile || !window.confirm(`Smazat profil odesílatele „${profile.label}“?`)) return;
    const res = await fetch(`/api/crm/sender-profiles/${profile.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      setProfileMessage({ ok: false, text: data?.error ?? "Smazání selhalo" });
      return;
    }
    setProfiles(data.profiles);
    setProfileId(null);
    setProfileLabel("");
    rememberProfileId(null);
    setProfileMessage({ ok: true, text: "Profil smazán." });
  }

  const preview = useMemo(() => renderEmail(fields, PREVIEW_UNSUBSCRIBE_URL), [fields]);

  function update<K extends keyof EmailFields>(key: K, value: EmailFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    if (key === "recipientEmail") {
      setAlreadySent(false);
      setAllowRepeat(false);
    }
  }

  async function send() {
    setStatus("loading");
    setMessage("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/crm/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, allowRepeat, clientId: client?.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = "/crm/login";
        return;
      }
      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setAlreadySent(data.alreadySent === true);
        throw new Error(typeof data.error === "string" ? data.error : "Odeslání selhalo");
      }
      setStatus("success");
      setMessage(`E-mail pro ${fields.companyName} odeslán.`);
      setAlreadySent(false);
      setAllowRepeat(false);
      setFields((current) => {
        const next = { ...current };
        for (const key of CLIENT_FIELDS) next[key] = "";
        return next;
      });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Odeslání selhalo");
    }
  }

  const hasEmailChoice = (client?.emails.length ?? 0) > 1;

  function renderField({ key, label, hint, multiline, type }: FieldConfig) {
    const value = fields[key];
    return (
      <label key={key} className="flex flex-col gap-1">
        <span className="text-sm font-medium text-pastel-dark">{label}</span>
        {multiline ? (
          <textarea
            name={key}
            rows={3}
            value={value}
            disabled={status === "loading"}
            onChange={(e) => update(key, e.target.value)}
            className={inputClass}
          />
        ) : (
          <input
            type={type ?? "text"}
            name={key}
            value={value}
            list={key === "recipientEmail" && hasEmailChoice ? "client-emails" : undefined}
            disabled={status === "loading"}
            onChange={(e) => update(key, e.target.value)}
            className={inputClass}
          />
        )}
        {hint && <span className="text-xs text-pastel-dark/60">{hint}</span>}
        {fieldErrors[key] && <span className="text-sm text-red-600">{fieldErrors[key]}</span>}
      </label>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex flex-col gap-6"
        noValidate
      >
        <fieldset className="card flex flex-col gap-4 p-5">
          <legend className="font-display px-1 text-lg font-bold">Klient</legend>
          {client && (
            <div className="rounded-btn bg-pastel-cream p-3 text-sm">
              <a href={`/crm/klienti/${client.id}`} className="font-semibold underline">
                {client.name}
              </a>
              {client.webPotential && (
                <span className="text-pastel-dark/60"> - potenciál webu: {client.webPotential}</span>
              )}
              {client.webProblems && (
                <p className="mt-1 text-xs text-pastel-dark/70">
                  Audit: {client.webProblems}. Do e-mailu napište jen jeden ručně ověřený problém.
                </p>
              )}
              {hasEmailChoice && (
                <p className="mt-1 text-xs text-pastel-dark/70">
                  Klient má více e-mailů, vyberte v poli příjemce: {client.emails.join(", ")}
                </p>
              )}
              <datalist id="client-emails">
                {client.emails.map((email) => (
                  <option key={email} value={email} />
                ))}
              </datalist>
            </div>
          )}
          {CLIENT_FIELD_CONFIG.map(renderField)}
        </fieldset>

        <fieldset className="card flex flex-col gap-4 p-5">
          <legend className="font-display px-1 text-lg font-bold">Odesílatel</legend>
          <div className="flex flex-col gap-2 rounded-btn bg-pastel-cream p-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Profil odesílatele</span>
              <select
                value={profileId ?? ""}
                onChange={(e) =>
                  applyProfile(profiles.find((p) => p.id === Number(e.target.value)))
                }
                className={inputClass}
              >
                <option value="">- vyplnit ručně -</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-pastel-dark/60">Název profilu</span>
                <input
                  value={profileLabel}
                  onChange={(e) => setProfileLabel(e.target.value)}
                  placeholder="např. Niki"
                  className={inputClass}
                />
              </label>
              <button
                type="button"
                onClick={() => void saveProfile()}
                className="rounded-btn border border-pastel-accent px-3 py-2 text-sm hover:bg-pastel-sand"
              >
                Uložit jako výchozí
              </button>
              {profileId !== null && (
                <button
                  type="button"
                  onClick={() => void deleteProfile()}
                  className="px-2 py-2 text-sm text-red-700 underline"
                >
                  Smazat
                </button>
              )}
            </div>
            <p className="text-xs text-pastel-dark/60">
              Vyplňte údaje níže a uložte je pod svým jménem. Profil se pak předvyplní při každém
              dalším e-mailu (i na jiném zařízení); tento prohlížeč si pamatuje, který profil používáte.
              Uložením pod stejným názvem profil aktualizujete.
            </p>
            {profileMessage && (
              <p className={`text-sm ${profileMessage.ok ? "text-pastel-accent-hover" : "text-red-600"}`}>
                {profileMessage.text}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Úvod</span>
              <select
                value={fields.intro}
                onChange={(e) => update("intro", e.target.value === "solo" ? "solo" : "team")}
                className={inputClass}
              >
                <option value="team">Společně s Romanem</option>
                <option value="solo">Sám/sama za sebe</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Rod</span>
              <select
                value={fields.gender}
                onChange={(e) => update("gender", e.target.value === "male" ? "male" : "female")}
                className={inputClass}
              >
                <option value="female">Žena (ráda bych…)</option>
                <option value="male">Muž (rád bych…)</option>
              </select>
            </label>
          </div>
          {SENDER_FIELD_CONFIG.map(renderField)}
        </fieldset>

        {alreadySent && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowRepeat}
              onChange={(e) => setAllowRepeat(e.target.checked)}
            />
            Na tuto adresu už e-mail odešel, přesto poslat znovu
          </label>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={status === "loading"} className="btn-primary">
            {status === "loading" ? "Odesílám…" : "Odeslat e-mail"}
          </button>
          {message && (
            <p
              className={`text-sm ${status === "success" ? "text-pastel-accent-hover" : "text-red-600"}`}
              role="status"
            >
              {message}
              {status === "success" && client && (
                <>
                  {" "}
                  <a href={`/crm/klienti/${client.id}`} className="underline">
                    Zpět na kartu klienta
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      </form>

      <section className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="font-display text-lg font-bold">Náhled</h2>
        <div className="card mt-3 bg-white p-5">
          <p className="text-sm">
            <span className="text-pastel-dark/60">Předmět:</span> {preview.subject}
          </p>
          <hr className="my-3 border-pastel-sand" />
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: preview.html }}
          />
        </div>
      </section>
    </div>
  );
}
