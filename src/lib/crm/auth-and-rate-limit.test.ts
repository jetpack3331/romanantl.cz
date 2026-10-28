import { describe, expect, it } from "vitest";
import { getClientIp, isCrmPath, isProtectedCrmPath } from "@/lib/crm/auth";
import { LoginRateLimiter } from "@/lib/crm/login-rate-limit";

describe("isProtectedCrmPath", () => {
  it("protects CRM pages and API routes", () => {
    expect(isProtectedCrmPath("/crm")).toBe(true);
    expect(isProtectedCrmPath("/crm/")).toBe(true);
    expect(isProtectedCrmPath("/api/crm/send")).toBe(true);
  });

  it("leaves login and unrelated paths public", () => {
    expect(isProtectedCrmPath("/crm/login")).toBe(false);
    expect(isProtectedCrmPath("/api/crm/login")).toBe(false);
    expect(isProtectedCrmPath("/crmx")).toBe(false);
    expect(isProtectedCrmPath("/odhlaseni")).toBe(false);
    expect(isProtectedCrmPath("/api/unsubscribe")).toBe(false);
  });
});

describe("isCrmPath", () => {
  it("matches the CRM area only", () => {
    expect(isCrmPath("/crm/login")).toBe(true);
    expect(isCrmPath("/api/crm/send")).toBe(true);
    expect(isCrmPath("/crmx")).toBe(false);
  });
});

describe("getClientIp", () => {
  it("prefers the nginx X-Real-IP header", () => {
    const request = new Request("http://x", { headers: { "x-real-ip": "1.2.3.4" } });
    expect(getClientIp(request, "127.0.0.1")).toBe("1.2.3.4");
    expect(getClientIp(new Request("http://x"), "127.0.0.1")).toBe("127.0.0.1");
  });
});

describe("LoginRateLimiter", () => {
  it("blocks after too many failures and unblocks after the window", () => {
    const limiter = new LoginRateLimiter(3, 1000);
    for (let i = 0; i < 3; i += 1) limiter.recordFailure("ip", 0);
    expect(limiter.isBlocked("ip", 500)).toBe(true);
    expect(limiter.isBlocked("other", 500)).toBe(false);
    expect(limiter.isBlocked("ip", 1000)).toBe(false);
  });

  it("resets after a successful login", () => {
    const limiter = new LoginRateLimiter(1, 1000);
    limiter.recordFailure("ip", 0);
    limiter.reset("ip");
    expect(limiter.isBlocked("ip", 1)).toBe(false);
  });
});
