import { describe, expect, it } from "vitest";
import { getMessages } from "@/lib/get-messages";

describe("getMessages", () => {
  it("returns Czech by default for cs", () => {
    const t = getMessages("cs");
    expect(t.meta.title.length).toBeGreaterThan(0);
  });

  it("returns English for en", () => {
    const t = getMessages("en");
    expect(t.nav.home).toBe("Home");
  });
});
