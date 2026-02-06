"use client";

import { useState } from "react";
import { z } from "zod";

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

export function ContactForm({ messages }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setFieldErrors({});
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Send failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setFieldErrors({ form: messages.errorMessage });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
  );
}
