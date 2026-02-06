import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Roman Antl Portfolio <onboarding@resend.dev>";
const TO = process.env.CONTACT_EMAIL ?? "romcaantl@gmail.com";

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "E-mail není nakonfigurován (RESEND_API_KEY)." },
      { status: 503 }
    );
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Vyplňte jméno, e-mail a zprávu." },
      { status: 400 }
    );
  }

  if (message.length > 5000) {
    return NextResponse.json(
      { error: "Zpráva je příliš dlouhá." },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `Kontakt z webu: ${name}`,
      text: `Od: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>Od:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><pre>${escapeHtml(message)}</pre>`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: "Nepodařilo se odeslat e-mail." },
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
