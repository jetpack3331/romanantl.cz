const MAX_NAME_LENGTH = 200;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidatedContactPayload = {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
};

export type ContactValidationFailure = {
  status: number;
  body: { error: string };
};

/**
 * Validates JSON body for the contact form (after JSON parse).
 */
export function validateContactPayload(body: unknown):
  | { ok: true; data: ValidatedContactPayload }
  | { ok: false; response: ContactValidationFailure } {
  if (typeof body !== "object" || body === null) {
    return {
      ok: false,
      response: { status: 400, body: { error: "Invalid request body" } },
    };
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email =
    typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const message =
    typeof record.message === "string" ? record.message.trim() : "";
  const turnstileToken =
    typeof record.turnstileToken === "string"
      ? record.turnstileToken.trim()
      : "";

  if (!name || !email || !message) {
    return {
      ok: false,
      response: {
        status: 400,
        body: { error: "Name, email and message are required" },
      },
    };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      response: {
        status: 400,
        body: { error: `Name must be at most ${MAX_NAME_LENGTH} characters` },
      },
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      response: { status: 400, body: { error: "Invalid email address" } },
    };
  }

  if (message.length < MIN_MESSAGE_LENGTH) {
    return {
      ok: false,
      response: {
        status: 400,
        body: {
          error: `Message must be at least ${MIN_MESSAGE_LENGTH} characters`,
        },
      },
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      response: {
        status: 400,
        body: {
          error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters`,
        },
      },
    };
  }

  return {
    ok: true,
    data: { name, email, message, turnstileToken },
  };
}
