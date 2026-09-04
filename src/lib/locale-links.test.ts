import { describe, expect, it } from "vitest";
import { buildLocaleHref } from "@/lib/locale-links";

describe("buildLocaleHref", () => {
  it("maps Czech home from root", () => {
    expect(buildLocaleHref("/", "cs")).toBe("/");
    expect(buildLocaleHref("/", "en")).toBe("/en");
  });

  it("strips locale prefix when switching to Czech", () => {
    expect(buildLocaleHref("/en", "cs")).toBe("/");
    expect(buildLocaleHref("/en/product-work", "cs")).toBe("/produktova-tvorba");
  });

  it("adds English prefix and translates the slug when switching from Czech", () => {
    expect(buildLocaleHref("/produktova-tvorba", "en")).toBe("/en/product-work");
  });

  it("adds Spanish prefix and translates the slug when switching from Czech", () => {
    expect(buildLocaleHref("/produktova-tvorba", "es")).toBe(
      "/es/creacion-de-producto"
    );
  });

  it("swaps translated slugs directly between non-Czech locales", () => {
    expect(buildLocaleHref("/en/product-work", "es")).toBe(
      "/es/creacion-de-producto"
    );
  });

  it("translates the work-experience route too", () => {
    expect(buildLocaleHref("/zkusenosti", "en")).toBe("/en/work-experience");
    expect(buildLocaleHref("/en/work-experience", "es")).toBe(
      "/es/experiencia-laboral"
    );
  });

  it("leaves an unrecognized slug unchanged", () => {
    expect(buildLocaleHref("/something-else", "en")).toBe(
      "/en/something-else"
    );
  });
});
