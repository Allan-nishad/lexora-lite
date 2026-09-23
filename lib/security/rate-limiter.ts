/**
 * @file lib/security/rate-limiter.ts
 * @description In-memory sliding window rate limiter for API protection and abuse mitigation.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private store: Map<string, RateLimitRecord>;
  private windowMs: number;
  private maxRequests: number;

  /**
   * @param windowMs - Time window in milliseconds (default: 60,000ms = 1 minute)
   * @param maxRequests - Maximum requests allowed within windowMs (default: 30)
   */
  constructor(windowMs = 60000, maxRequests = 30) {
    this.store = new Map<string, RateLimitRecord>();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check whether a client identifier is allowed or rate-limited.
   *
   * @param identifier - IP address, token, or session ID
   * @returns Object containing `allowed`, `remaining`, and `resetMs`
   */
  public check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.store.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(identifier, record);
    }

    // Filter out timestamps outside the current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestTimestamp = record.timestamps[0];
      const resetMs = Math.max(0, oldestTimestamp + this.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    // Record this request
    record.timestamps.push(now);

    return {
      allowed: true,
      remaining: this.maxRequests - record.timestamps.length,
      resetMs: this.windowMs,
    };
  }

  /**
   * Cleanup expired keys periodically to prevent memory leaks.
   */
  public cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Reset the store (useful for unit tests)
   */
  public reset(): void {
    this.store.clear();
  }
}

// Global singleton rate limiter (30 requests per minute per IP/client)
export const globalRateLimiter = new SlidingWindowRateLimiter(60000, 30);
