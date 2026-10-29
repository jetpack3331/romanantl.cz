import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import { getClient, markEmailSent } from "@/lib/crm/clients/repository";
import {
  getCrmAuthConfig,
  getCrmDailySendLimit,
  getCrmSmtpConfig,
  getPublicSiteUrl,
} from "@/lib/crm/config";
import { getDb } from "@/lib/crm/db";
import { jsonResponse, readJsonBody } from "@/lib/crm/json-response";
import { renderEmail, validateEmailFields } from "@/lib/crm/outreach/email-template";
import { isUnsubscribed, logSentEmail, wasSentTo } from "@/lib/crm/outreach/repository";
import { getSendQuota, isQuotaExhausted } from "@/lib/crm/outreach/send-quota";
import { formatCrmDate } from "@/lib/crm/format";
import { createUnsubscribeToken } from "@/lib/crm/tokens";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const auth = getCrmAuthConfig();
  const smtp = getCrmSmtpConfig();
  if (!auth || !smtp) {
    return jsonResponse({ error: "SMTP není nakonfigurované" }, 503);
  }

  const body = await readJsonBody(request);
  const validated = validateEmailFields(body);
  if (!validated.ok) {
    return jsonResponse(
      { error: "Zkontrolujte vyplněná pole", fieldErrors: validated.errors },
      400
    );
  }
  const fields = validated.data;
  const record = body as Record<string, unknown>;
  const allowRepeat = record.allowRepeat === true;
  const db = getDb();
  const client =
    typeof record.clientId === "number" ? getClient(db, record.clientId) : null;

  const limit = getCrmDailySendLimit();
  const quota = getSendQuota(db, limit);
  if (isQuotaExhausted(quota)) {
    return jsonResponse(
      {
        error: `Denní limit ${quota.limit} e-mailů je vyčerpaný. Další půjde odeslat ${formatCrmDate(quota.nextFreeAt ?? "")}.`,
        sendQuota: quota,
      },
      429
    );
  }

  if (isUnsubscribed(db, fields.recipientEmail)) {
    return jsonResponse(
      { error: "Tento kontakt se odhlásil, e-mail nelze odeslat" },
      409
    );
  }
  if (!allowRepeat && wasSentTo(db, fields.recipientEmail)) {
    return jsonResponse(
      {
        error: "Na tuto adresu už e-mail odešel",
        alreadySent: true,
      },
      409
    );
  }

  const unsubscribeUrl = `${getPublicSiteUrl()}/odhlaseni?t=${createUnsubscribeToken(
    auth.secret,
    fields.recipientEmail
  )}`;
  const email = renderEmail(fields, unsubscribeUrl);

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    // Other ports (587) must upgrade via STARTTLS; never send the password in plain text
    requireTLS: smtp.port !== 465 && smtp.requireTls,
    // Fail fast instead of leaving the form spinning on a dead connection
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
    auth: { user: smtp.user, pass: smtp.password },
  });

  try {
    await transporter.sendMail({
      from: { name: fields.senderName, address: smtp.from },
      to: fields.recipientEmail,
      replyTo: { name: fields.senderName, address: fields.senderEmail },
      subject: email.subject,
      text: email.text,
      html: email.html,
      list: { unsubscribe: { url: unsubscribeUrl, comment: "Odhlásit" } },
    });
  } catch (error) {
    console.error("CRM e-mail failed", error);
    return jsonResponse({ error: "Odeslání e-mailu selhalo" }, 502);
  }

  const now = new Date();
  logSentEmail(db, {
    clientId: client?.id ?? null,
    toEmail: fields.recipientEmail,
    companyName: fields.companyName,
    clientUrl: fields.clientUrl,
    senderName: fields.senderName,
    subject: email.subject,
    sentAt: now.toISOString(),
  });
  if (client) markEmailSent(db, client.id, now);

  return jsonResponse({
    ok: true,
    clientId: client?.id ?? null,
    sendQuota: getSendQuota(db, limit, now),
  });
};
