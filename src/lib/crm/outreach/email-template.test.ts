import { describe, expect, it } from "vitest";
import {
  EMPTY_FIELDS,
  renderEmail,
  validateEmailFields,
  type EmailFields,
} from "@/lib/crm/outreach/email-template";

const VALID: EmailFields = {
  ...EMPTY_FIELDS,
  senderName: "Niki Nováková",
  businessName: "Niki Nováková",
  businessId: "12345678",
  senderPhone: "+420 777 000 000",
  senderEmail: "niki@example.cz",
  ourWebsite: "romanantl.cz",
  recipientEmail: "Info@Firma.cz",
  companyName: "Firma s.r.o.",
  clientUrl: "www.firma.cz",
  websiteProblem: "Na telefonu se text nevejde na obrazovku.",
  proposedImprovement: "upravit rozložení webu pro mobily",
  customerBenefit: "si návštěvníci pohodlně přečetli nabídku",
  callTimeframe: "ve čtvrtek odpoledne",
};

const UNSUBSCRIBE = "https://romanantl.cz/odhlaseni?t=abc";

describe("validateEmailFields", () => {
  it("accepts a complete payload and normalizes the recipient", () => {
    const result = validateEmailFields(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.recipientEmail).toBe("info@firma.cz");
  });

  it("reports missing required fields but allows an empty website", () => {
    const result = validateEmailFields({ ...VALID, companyName: " ", ourWebsite: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.companyName).toBeDefined();
      expect(result.errors.ourWebsite).toBeUndefined();
    }
  });

  it("rejects invalid e-mails and overlong values", () => {
    const result = validateEmailFields({
      ...VALID,
      recipientEmail: "nope",
      callTimeframe: "x".repeat(201),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.recipientEmail).toBe("Neplatný e-mail");
      expect(result.errors.callTimeframe).toBeDefined();
    }
  });

  it("collapses line breaks so headers and sentences stay on one line", () => {
    const result = validateEmailFields({ ...VALID, companyName: "Firma\r\nBcc: x@y.cz" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.companyName).toBe("Firma Bcc: x@y.cz");
  });

  it("rejects non-object bodies", () => {
    expect(validateEmailFields(null).ok).toBe(false);
  });
});

describe("renderEmail", () => {
  it("fills every placeholder and includes the unsubscribe link", () => {
    const email = renderEmail(VALID, UNSUBSCRIBE);
    expect(email.subject).toBe("Nabídka úpravy webu Firma s.r.o.");
    expect(email.text).toContain("společně s Romanem");
    expect(email.text).toContain("jsme si všimli jedné věci: Na telefonu");
    expect(email.text).toContain("Ráda bych Vám ve čtvrtek odpoledne krátce zavolala a zjistila");
    expect(email.text).toContain(UNSUBSCRIBE);
    expect(email.text).toContain("Web: romanantl.cz");
    expect(email.text).not.toMatch(/\{\{|undefined/);
    expect(email.html).toContain(`href="${UNSUBSCRIBE}"`);
    expect(email.html).toContain('href="https://www.firma.cz"');
  });

  it("uses the solo male variant", () => {
    const email = renderEmail({ ...VALID, intro: "solo", gender: "male" }, UNSUBSCRIBE);
    expect(email.text).toContain("věnuji se tvorbě a úpravám webových stránek pro firmy");
    expect(email.text).toContain("jsem si všiml jedné");
    expect(email.text).toContain("Rád bych Vám ve čtvrtek odpoledne krátce zavolal a zjistil,");
  });

  it("omits the website line when empty", () => {
    const email = renderEmail({ ...VALID, ourWebsite: "" }, UNSUBSCRIBE);
    expect(email.text).not.toContain("Web:");
  });

  it("escapes HTML and never emits a javascript: link", () => {
    const email = renderEmail(
      { ...VALID, companyName: "<b>Evil</b>", clientUrl: "javascript:alert(1)" },
      UNSUBSCRIBE
    );
    expect(email.html).toContain("&lt;b&gt;Evil&lt;/b&gt;");
    expect(email.html).not.toContain('href="javascript:');
  });
});
