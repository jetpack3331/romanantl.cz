import { describe, expect, it } from "vitest";
import { buildLocaleHref } from "@/lib/locale-links";

describe("buildLocaleHref", () => {
  it("maps Czech home from root", () => {
    expect(buildLocaleHref("/", "cs")).toBe("/");
    expect(buildLocaleHref("/", "en")).toBe("/en");
  });

  it("strips locale prefix when switching to Czech", () => {
    expect(buildLocaleHref("/en", "cs")).toBe("/");
    expect(buildLocaleHref("/en/ai-tvorba", "cs")).toBe("/ai-tvorba");
  });

  it("adds English prefix when switching from Czech path", () => {
    expect(buildLocaleHref("/ai-tvorba", "en")).toBe("/en/ai-tvorba");
  });
});
