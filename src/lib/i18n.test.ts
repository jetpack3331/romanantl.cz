import { describe, expect, it } from "vitest";
import { resolveLocaleFromPathname } from "@/lib/i18n";

describe("resolveLocaleFromPathname", () => {
  it("defaults to Czech for unprefixed paths", () => {
    expect(resolveLocaleFromPathname("/")).toBe("cs");
    expect(resolveLocaleFromPathname("/produktova-tvorba")).toBe("cs");
  });

  it("detects the locale from a prefixed path", () => {
    expect(resolveLocaleFromPathname("/en")).toBe("en");
    expect(resolveLocaleFromPathname("/en/produktova-tvorba")).toBe("en");
    expect(resolveLocaleFromPathname("/es/produktova-tvorba")).toBe("es");
  });

  it("falls back to Czech for an unknown prefix", () => {
    expect(resolveLocaleFromPathname("/de/produktova-tvorba")).toBe("cs");
  });
});
