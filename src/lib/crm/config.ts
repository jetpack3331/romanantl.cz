import path from "node:path";

/**
 * CRM settings are read at request time. `process.env` is checked first
 * because private `import.meta.env` values are resolved at build time, and the
 * production image is built in CI without any secrets. In `astro dev` the
 * `.env` file is only exposed through `import.meta.env`, hence the fallback.
 */
function readEnv(key: string): string {
  const fromProcess = process.env[key];
  if (typeof fromProcess === "string" && fromProcess.trim()) {
    return fromProcess.trim();
  }
  const fromImportMeta = (import.meta.env as Record<string, unknown>)[key];
  return typeof fromImportMeta === "string" ? fromImportMeta.trim() : "";
}

const MIN_SECRET_LENGTH = 32;

export type CrmAuthConfig = {
  password: string;
  secret: string;
};

export type CrmSmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  /** STARTTLS is required on non-465 ports unless explicitly disabled for a local dev sink. */
  requireTls: boolean;
};

/** Returns null when the CRM is not configured (the routes then respond 503). */
export function getCrmAuthConfig(): CrmAuthConfig | null {
  const password = readEnv("CRM_PASSWORD");
  const secret = readEnv("CRM_SECRET");
  if (!password || secret.length < MIN_SECRET_LENGTH) {
    return null;
  }
  return { password, secret };
}

export function getCrmSmtpConfig(): CrmSmtpConfig | null {
  const host = readEnv("CRM_SMTP_HOST");
  const user = readEnv("CRM_SMTP_USER");
  const password = readEnv("CRM_SMTP_PASSWORD");
  if (!host || !user || !password) {
    return null;
  }
  const port = Number.parseInt(readEnv("CRM_SMTP_PORT") || "465", 10);
  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    user,
    password,
    from: readEnv("CRM_SMTP_FROM") || user,
    requireTls: readEnv("CRM_SMTP_ALLOW_PLAIN") !== "1",
  };
}

/** Migadu Micro plan allows 20 outgoing e-mails per day. */
const DEFAULT_DAILY_SEND_LIMIT = 20;

/** CRM_DAILY_SEND_LIMIT: empty = default (20), "0" = no limit, otherwise a positive integer. */
export function parseDailySendLimit(raw: string): number | null {
  if (!raw) return DEFAULT_DAILY_SEND_LIMIT;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) return DEFAULT_DAILY_SEND_LIMIT;
  return value === 0 ? null : value;
}

export function getCrmDailySendLimit(): number | null {
  return parseDailySendLimit(readEnv("CRM_DAILY_SEND_LIMIT"));
}

export function getCrmDataDir(): string {
  return path.resolve(readEnv("CRM_DATA_DIR") || "data");
}

export function getPublicSiteUrl(): string {
  return (readEnv("PUBLIC_SITE_URL") || "https://romanantl.cz").replace(
    /\/$/,
    ""
  );
}
