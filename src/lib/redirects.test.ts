import { describe, expect, it } from "vitest";
import { resolveLegacyRedirect } from "@/lib/redirects";

describe("resolveLegacyRedirect", () => {
  it("redirects the old ai-tvorba paths to their current locale-specific slug", () => {
    expect(resolveLegacyRedirect("/ai-tvorba")).toBe("/produktova-tvorba");
    expect(resolveLegacyRedirect("/en/ai-tvorba")).toBe("/en/product-work");
    expect(resolveLegacyRedirect("/es/ai-tvorba")).toBe(
      "/es/creacion-de-producto"
    );
  });

  it("redirects the old flat en/es produktova-tvorba paths to their translated slug", () => {
    expect(resolveLegacyRedirect("/en/produktova-tvorba")).toBe(
      "/en/product-work"
    );
    expect(resolveLegacyRedirect("/es/produktova-tvorba")).toBe(
      "/es/creacion-de-producto"
    );
  });

  it("redirects the old flat en/es zkusenosti paths to their translated slug", () => {
    expect(resolveLegacyRedirect("/en/zkusenosti")).toBe(
      "/en/work-experience"
    );
    expect(resolveLegacyRedirect("/es/zkusenosti")).toBe(
      "/es/experiencia-laboral"
    );
  });

  it("returns null for unknown paths", () => {
    expect(resolveLegacyRedirect("/produktova-tvorba")).toBeNull();
    expect(resolveLegacyRedirect("/")).toBeNull();
  });
});
