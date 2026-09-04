import { describe, expect, it } from "vitest";
import {
  routeAlternateLanguages,
  routeKeyForSlug,
  routePath,
  routeSlug,
} from "@/lib/routes";

describe("routeSlug / routePath", () => {
  it("returns the locale-specific slug", () => {
    expect(routeSlug("product", "cs")).toBe("produktova-tvorba");
    expect(routeSlug("product", "en")).toBe("product-work");
    expect(routeSlug("product", "es")).toBe("creacion-de-producto");
  });

  it("builds the site-relative path, with no prefix for Czech", () => {
    expect(routePath("product", "cs")).toBe("/produktova-tvorba");
    expect(routePath("product", "en")).toBe("/en/product-work");
    expect(routePath("experience", "es")).toBe("/es/experiencia-laboral");
  });
});

describe("routeKeyForSlug", () => {
  it("finds the route key regardless of which locale's slug is passed", () => {
    expect(routeKeyForSlug("produktova-tvorba")).toBe("product");
    expect(routeKeyForSlug("product-work")).toBe("product");
    expect(routeKeyForSlug("creacion-de-producto")).toBe("product");
    expect(routeKeyForSlug("zkusenosti")).toBe("experience");
    expect(routeKeyForSlug("work-experience")).toBe("experience");
    expect(routeKeyForSlug("experiencia-laboral")).toBe("experience");
  });

  it("returns null for an unknown slug", () => {
    expect(routeKeyForSlug("something-else")).toBeNull();
  });
});

describe("routeAlternateLanguages", () => {
  it("builds absolute alternate URLs per locale", () => {
    expect(routeAlternateLanguages("product", "https://romanantl.cz")).toEqual({
      cs: "https://romanantl.cz/produktova-tvorba",
      en: "https://romanantl.cz/en/product-work",
      es: "https://romanantl.cz/es/creacion-de-producto",
    });
  });
});
