/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly SENDER_EMAIL?: string;
  readonly SENDER_PASSWORD?: string;
  readonly CONTACT_EMAIL?: string;
  readonly CRM_PASSWORD?: string;
  readonly CRM_SECRET?: string;
  readonly CRM_SMTP_HOST?: string;
  readonly CRM_SMTP_PORT?: string;
  readonly CRM_SMTP_USER?: string;
  readonly CRM_SMTP_PASSWORD?: string;
  readonly CRM_SMTP_FROM?: string;
  readonly CRM_DATA_DIR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
