import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/html";

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    expect(escapeHtml(`<a href="x">y&z</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;y&amp;z&lt;/a&gt;"
    );
  });
});
