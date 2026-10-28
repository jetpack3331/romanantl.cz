import { describe, expect, it } from "vitest";
import { validateClientUpdate } from "@/lib/crm/clients/validate";
import { activeNavigationHref } from "@/lib/crm/navigation";
import { formatCrmDate, safeHref, todayInPrague } from "@/lib/crm/format";

describe("validateClientUpdate", () => {
  it("keeps only known fields and trims them", () => {
    const result = validateClientUpdate({ callNote: "  ok ", status: "má zájem", nextStepDate: "", id: 5 });
    expect(result).toEqual({ ok: true, data: { callNote: "ok", status: "má zájem", nextStepDate: "" } });
  });

  it("rejects unknown status, bad date, empty name and long values", () => {
    const result = validateClientUpdate({
      status: "hacked",
      nextStepDate: "27.10.2026",
      name: " ",
      nextStep: "x".repeat(301),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["name", "nextStep", "nextStepDate", "status"]);
    }
  });
});

describe("navigation and formatting", () => {
  it("highlights the most specific module", () => {
    expect(activeNavigationHref("/crm/klienti/12")).toBe("/crm/klienti");
    expect(activeNavigationHref("/crm/klienti/import")).toBe("/crm/klienti/import");
    expect(activeNavigationHref("/crm/login")).toBeNull();
  });

  it("formats dates and sanitizes links", () => {
    expect(formatCrmDate("2026-10-27")).toBe("27. 10. 2026");
    expect(formatCrmDate("")).toBe("");
    expect(todayInPrague(new Date("2026-10-27T23:30:00Z"))).toBe("2026-10-28");
    expect(safeHref("http://firma.cz")).toBe("http://firma.cz");
    expect(safeHref("firma.cz")).toBe("https://firma.cz");
    expect(safeHref("javascript:alert(1)")).toBe("https://alert(1)");
  });
});

describe("validateClientUpdate - audit and numbers", () => {
  it("parses numbers (decimal comma), clears empty ones and checks the potential", () => {
    const result = validateClientUpdate({
      rating: "4,5",
      reviewCount: "12",
      webScore: "",
      mobilePerformance: "55",
      webPotential: "vysoký",
      platform: " WordPress ",
    });
    expect(result).toEqual({
      ok: true,
      data: {
        rating: 4.5,
        reviewCount: 12,
        webScore: null,
        mobilePerformance: 55,
        webPotential: "vysoký",
        platform: "WordPress",
      },
    });
  });

  it("rejects out-of-range, non-integer and unknown values", () => {
    const result = validateClientUpdate({
      rating: "6",
      webScore: "12.5",
      mobilePerformance: "abc",
      webPotential: "obrovský",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["mobilePerformance", "rating", "webPotential", "webScore"]);
    }
  });

  it("requires a name when creating", () => {
    expect(validateClientUpdate({ phone: "1" }, { requireName: true }).ok).toBe(false);
    expect(validateClientUpdate({ phone: "1" }).ok).toBe(true);
  });
});
