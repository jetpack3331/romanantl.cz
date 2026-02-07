"use client";

import Script from "next/script";
import { useRef, useState, useCallback, useEffect } from "react";
import { z } from "zod";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const contactSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  message: z.string().min(1, "messageRequired").min(10, "messageMin"),
});

type ContactMessages = {
  formFields: { name: string; email: string; message: string };
  submitLabel: string;
  sending: string;
  successMessage: string;
  errorMessage: string;
  errors: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    messageRequired: string;
    messageMin: string;
  };
  placeholders: { name: string; email: string; message: string };
};

type ContactFormProps = {
  messages: ContactMessages;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void; size?: string }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export function ContactForm({ messages }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileTokenRef = useRef<string>("");
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const onTurnstileSuccess = useCallback((token: string) => {
    turnstileTokenRef.current = token;
  }, []);

  useEffect(() => {
    if (!turnstileReady || !SITE_KEY || !turnstileContainerRef.current || !window.turnstile) return;
    const id = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: SITE_KEY,
      callback: onTurnstileSuccess,
      "error-callback": () => {
        turnstileTokenRef.current = "";
      },
      size: "invisible",
    });
    turnstileWidgetIdRef.current = id;
    return () => {
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileReady, onTurnstileSuccess]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string)?.trim();
    const email = (data.get("email") as string)?.trim();
    const message = (data.get("message") as string)?.trim();

    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        const msgKey = issue.message;
        if (messages.errors[msgKey as keyof typeof messages.errors]) {
          errors[key] = messages.errors[msgKey as keyof typeof messages.errors];
        }
      }
      setFieldErrors(errors);
      setStatus("error");
      return;
    }

    const token = turnstileTokenRef.current;
    if (!token && SITE_KEY) {
      setFieldErrors({ form: messages.errorMessage });
      setStatus("error");
      return;
    }

    setFieldErrors({});
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, turnstileToken: token || undefined }),
      });
      const dataRes = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof dataRes.error === "string" ? dataRes.error : "Send failed");
      }
      setStatus("success");
      form.reset();
      turnstileTokenRef.current = "";
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setFieldErrors({ form: err instanceof Error ? err.message : messages.errorMessage });
    }
  }

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setTurnstileReady(true)}
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div ref={turnstileContainerRef} className="min-h-0 overflow-hidden" aria-hidden="true" />
        <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-pastel-dark dark:text-pastel-cream">
          {messages.formFields.name}
        </span>
        <input
          type="text"
          name="name"
          disabled={status === "loading"}
          className="rounded-btn border border-pastel-sage bg-pastel-cream px-3 py-2 text-pastel-dark placeholder:text-pastel-accent/60 dark:border-pastel-dark-secondary dark:bg-pastel-dark-secondary dark:text-pastel-cream dark:placeholder:text-pastel-dark-accent/60"
          placeholder={messages.placeholders.name}
        />
        {fieldErrors.name && (
          <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>
        )}
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-pastel-dark dark:text-pastel-cream">
          {messages.formFields.email}
        </span>
        <input
          type="email"
          name="email"
          disabled={status === "loading"}
          className="rounded-btn border border-pastel-sage bg-pastel-cream px-3 py-2 text-pastel-dark placeholder:text-pastel-accent/60 dark:border-pastel-dark-secondary dark:bg-pastel-dark-secondary dark:text-pastel-cream dark:placeholder:text-pastel-dark-accent/60"
          placeholder={messages.placeholders.email}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
        )}
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-pastel-dark dark:text-pastel-cream">
          {messages.formFields.message}
        </span>
        <textarea
          name="message"
          rows={4}
          disabled={status === "loading"}
          className="rounded-btn border border-pastel-sage bg-pastel-cream px-3 py-2 text-pastel-dark placeholder:text-pastel-accent/60 dark:border-pastel-dark-secondary dark:bg-pastel-dark-secondary dark:text-pastel-cream dark:placeholder:text-pastel-dark-accent/60"
          placeholder={messages.placeholders.message}
        />
        {fieldErrors.message && (
          <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.message}</p>
        )}
      </label>
      <button type="submit" disabled={status === "loading"} className="btn-primary self-start">
        {status === "loading" ? messages.sending : messages.submitLabel}
      </button>
      {status === "success" && (
        <p className="text-sm text-pastel-accent dark:text-pastel-dark-accent">
          {messages.successMessage}
        </p>
      )}
      {fieldErrors.form && (
        <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.form}</p>
      )}
    </form>
    </>
  );
}
