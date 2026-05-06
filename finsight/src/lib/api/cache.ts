/**
 * Simple in-memory cache with TTL for server-side API responses.
 * Prevents hammering free-tier APIs with duplicate requests.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/** TTL constants */
export const TTL = {
  QUOTE: 60_000,          // 1 min
  HISTORY: 5 * 60_000,    // 5 min
  PROFILE: 24 * 60 * 60_000, // 24 hr
  NEWS: 5 * 60_000,       // 5 min
  SEARCH: 60_000,         // 1 min
  ANALYSIS: 4 * 60 * 60_000, // 4 hr
} as const;
