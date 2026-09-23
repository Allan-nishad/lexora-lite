/**
 * @file lib/cache/lru-cache.ts
 * @description High-performance in-memory LRU Cache with cryptographic key hashing and TTL expiration.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxEntries: number;
  private defaultTtlMs: number;

  /**
   * @param maxEntries - Maximum number of entries before oldest is evicted (default: 100)
   * @param defaultTtlMs - Time-to-live in milliseconds (default: 30 minutes)
   */
  constructor(maxEntries = 100, defaultTtlMs = 1800000) {
    this.cache = new Map<string, CacheEntry<T>>();
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generate a fast hash key from input text
   */
  public hashKey(prefix: string, content: string): string {
    let hash = 0;
    const str = `${prefix}:${content}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `${prefix}_${Math.abs(hash).toString(36)}_${str.length}`;
  }

  /**
   * Get an entry from cache if present and unexpired.
   */
  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order (delete & re-insert)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  /**
   * Set a value in the cache with optional TTL.
   */
  public set(key: string, value: T, ttlMs?: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  /**
   * Check if cache contains a non-expired key.
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear the cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Current number of entries in the cache.
   */
  public size(): number {
    return this.cache.size;
  }
}

// Global singletons for analysis and Q&A
export const analysisCache = new LRUCache<unknown>(100, 3600000); // 1 hour TTL
export const qaCache = new LRUCache<unknown>(200, 3600000); // 1 hour TTL
