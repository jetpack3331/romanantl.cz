const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;

type Entry = { failures: number; windowStart: number };

/**
 * In-memory limiter for failed CRM logins, keyed by client IP. It resets on
 * container restart, which is acceptable for a single-instance deployment.
 */
export class LoginRateLimiter {
  private readonly entries = new Map<string, Entry>();

  constructor(
    private readonly maxFailures = MAX_FAILURES,
    private readonly windowMs = WINDOW_MS
  ) {}

  isBlocked(key: string, now: number = Date.now()): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;
    if (now - entry.windowStart >= this.windowMs) {
      this.entries.delete(key);
      return false;
    }
    return entry.failures >= this.maxFailures;
  }

  recordFailure(key: string, now: number = Date.now()): void {
    const entry = this.entries.get(key);
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.entries.set(key, { failures: 1, windowStart: now });
      return;
    }
    entry.failures += 1;
  }

  reset(key: string): void {
    this.entries.delete(key);
  }
}

export const loginRateLimiter = new LoginRateLimiter();
