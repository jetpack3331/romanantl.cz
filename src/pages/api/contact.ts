import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import { validateContactPayload } from "@/lib/contact-validate";
import { escapeHtml } from "@/lib/html";

export const prerender = false;

const TO = import.meta.env.CONTACT_EMAIL ?? "romcaantl@gmail.com";

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.SENDER_EMAIL || !import.meta.env.SENDER_PASSWORD) {
    return new Response(JSON.stringify({ error: "E-mail not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const turnstileSecret =
    import.meta.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
  const turnstileSiteKey =
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const turnstileEnabled = Boolean(turnstileSecret && turnstileSiteKey);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validated = validateContactPayload(body);
  if (!validated.ok) {
    return new Response(JSON.stringify(validated.response.body), {
      status: validated.response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, message, turnstileToken } = validated.data;

  if (turnstileEnabled) {
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: "Verification required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
      }
    );
    const verifyData = (await verifyRes.json()) as { success?: boolean };
    if (!verifyData.success) {
      return new Response(JSON.stringify({ error: "Verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: import.meta.env.SENDER_EMAIL,
      pass: import.meta.env.SENDER_PASSWORD,
    },
  });

  const from = `Roman Antl Portfolio <${import.meta.env.SENDER_EMAIL}>`;
  const subjectName = name.replace(/[\r\n]+/g, " ").slice(0, 100);
  const subject = `Contact from romanantl.cz: ${subjectName}`;

  try {
    await transporter.sendMail({
      from,
      to: TO,
      replyTo: email,
      subject,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><pre>${escapeHtml(message)}</pre>`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to send e-mail" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
