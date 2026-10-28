import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  checkPassword,
  createSessionToken,
  createUnsubscribeToken,
  readUnsubscribeToken,
  verifySessionToken,
} from "@/lib/crm/tokens";

const SECRET = "x".repeat(40);

describe("checkPassword", () => {
  it("accepts the exact password only", () => {
    expect(checkPassword("hunter2", "hunter2")).toBe(true);
    expect(checkPassword("hunter3", "hunter2")).toBe(false);
    expect(checkPassword("", "hunter2")).toBe(false);
  });
});

describe("session tokens", () => {
  it("verifies a fresh token", () => {
    const token = createSessionToken(SECRET, "pw", 1000);
    expect(verifySessionToken(token, SECRET, "pw", 2000)).toBe(true);
  });

  it("rejects expired tokens", () => {
    const token = createSessionToken(SECRET, "pw", 0);
    expect(
      verifySessionToken(token, SECRET, "pw", SESSION_MAX_AGE_SECONDS * 1000 + 1)
    ).toBe(false);
  });

  it("rejects tokens after a password change", () => {
    const token = createSessionToken(SECRET, "old", 1000);
    expect(verifySessionToken(token, SECRET, "new", 2000)).toBe(false);
  });

  it("rejects tampered or malformed tokens", () => {
    const [expiresAt, signature] = createSessionToken(SECRET, "pw", 1000).split(".");
    const extended = `${Number(expiresAt) + 1}.${signature}`;
    expect(verifySessionToken(extended, SECRET, "pw", 2000)).toBe(false);
    expect(verifySessionToken(undefined, SECRET, "pw")).toBe(false);
    expect(verifySessionToken("garbage", SECRET, "pw")).toBe(false);
  });
});

describe("unsubscribe tokens", () => {
  it("round-trips the normalized e-mail", () => {
    const token = createUnsubscribeToken(SECRET, " Info@Firma.CZ ");
    expect(readUnsubscribeToken(token, SECRET)).toBe("info@firma.cz");
  });

  it("rejects a token forged for another address", () => {
    const [, signature] = createUnsubscribeToken(SECRET, "a@b.cz").split(".");
    const forged = `${Buffer.from("c@d.cz").toString("base64url")}.${signature}`;
    expect(readUnsubscribeToken(forged, SECRET)).toBeNull();
  });

  it("rejects tokens signed with another secret", () => {
    const token = createUnsubscribeToken("y".repeat(40), "a@b.cz");
    expect(readUnsubscribeToken(token, SECRET)).toBeNull();
    expect(readUnsubscribeToken(null, SECRET)).toBeNull();
  });
});
