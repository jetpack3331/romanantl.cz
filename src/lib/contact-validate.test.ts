import { describe, expect, it } from "vitest";
import { validateContactPayload } from "@/lib/contact-validate";

describe("validateContactPayload", () => {
  it("accepts valid payload", () => {
    const r = validateContactPayload({
      name: "  Ada  ",
      email: "Ada@Example.COM",
      message: "Hello there, at least ten chars.",
      turnstileToken: "tok",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("Ada");
      expect(r.data.email).toBe("ada@example.com");
      expect(r.data.turnstileToken).toBe("tok");
    }
  });

  it("rejects invalid email", () => {
    const r = validateContactPayload({
      name: "Ada",
      email: "not-an-email",
      message: "1234567890",
    });
    expect(r.ok).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    const r = validateContactPayload({
      name: "Ada",
      email: "ada@example.com",
      message: "short",
    });
    expect(r.ok).toBe(false);
  });

  it("rejects non-object body", () => {
    const r = validateContactPayload(null);
    expect(r.ok).toBe(false);
  });
});
