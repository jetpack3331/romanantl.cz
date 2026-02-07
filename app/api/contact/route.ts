import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TO = process.env.CONTACT_EMAIL ?? "romcaantl@gmail.com";

export async function POST(request: Request) {
  if (!process.env.SENDER_EMAIL || !process.env.SENDER_PASSWORD) {
    return NextResponse.json(
      { error: "E-mail not configured" },
      { status: 503 }
    );
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

  let body: { name?: string; email?: string; message?: string; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";

  if (turnstileSecret) {
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Verification required" },
        { status: 400 }
      );
    }
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: turnstileToken,
      }),
    });
    const verifyData = (await verifyRes.json()) as { success?: boolean };
    if (!verifyData.success) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 }
      );
    }
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required" },
      { status: 400 }
    );
  }

  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Name must be at most ${MAX_NAME_LENGTH} characters` },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  const from = `Roman Antl Portfolio <${process.env.SENDER_EMAIL}>`;
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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send e-mail" },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
