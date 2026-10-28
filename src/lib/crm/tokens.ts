import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "crm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(key: string, value: string): string {
  return createHmac("sha256", key).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * The session key mixes in the password, so changing CRM_PASSWORD logs out
 * every existing session.
 */
function sessionKey(secret: string, password: string): string {
  return sign(secret, `session:${password}`);
}

export function checkPassword(candidate: string, password: string): boolean {
  // Compare digests so the comparison is constant-time regardless of length.
  const digest = (value: string) =>
    createHmac("sha256", "crm-password").update(value).digest("hex");
  return safeEqual(digest(candidate), digest(password));
}

export function createSessionToken(
  secret: string,
  password: string,
  now: number = Date.now()
): string {
  const expiresAt = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(sessionKey(secret, password), expiresAt)}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
  password: string,
  now: number = Date.now()
): boolean {
  if (!token) return false;
  const [expiresAt, signature, ...rest] = token.split(".");
  if (!expiresAt || !signature || rest.length > 0) return false;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= now) return false;
  return safeEqual(signature, sign(sessionKey(secret, password), expiresAt));
}

/**
 * Unsubscribe tokens carry the recipient address and an HMAC, so the public
 * unsubscribe page needs no database lookup and links cannot be forged for
 * other addresses. They never expire; rotating CRM_SECRET breaks old links.
 */
export function createUnsubscribeToken(secret: string, email: string): string {
  const normalized = email.trim().toLowerCase();
  const payload = Buffer.from(normalized).toString("base64url");
  return `${payload}.${sign(secret, `unsubscribe:${normalized}`)}`;
}

export function readUnsubscribeToken(
  token: string | null | undefined,
  secret: string
): string | null {
  if (!token) return null;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;
  const email = Buffer.from(payload, "base64url").toString("utf8");
  if (!email.includes("@")) return null;
  return safeEqual(signature, sign(secret, `unsubscribe:${email}`))
    ? email
    : null;
}
