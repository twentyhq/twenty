import { type Milliseconds } from 'cache-manager';
import { isDefined } from 'twenty-shared/utils';

import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type AsyncFactoryCallback<T> = () => Promise<T | null>;

const ONE_HOUR_IN_MS = 3600_000;

export class PromiseMemoizer<T> {
  private cache = new Map<CacheKey, { value: T; expiresAt: number }>();
  private pending = new Map<CacheKey, Promise<T | null>>();
  private ttlMs: number;
  // Bumped on every explicit clear; lets in-flight factories detect that a
  // clear ran after they started, so they never cache a stale result.
  private clearGeneration = 0;

  constructor(ttlMs: Milliseconds = ONE_HOUR_IN_MS) {
    this.ttlMs = ttlMs;
  }

  async memoizePromiseAndExecute(
    cacheKey: CacheKey,
    factory: AsyncFactoryCallback<T>,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<T | null> {
    const generationAtStart = this.clearGeneration;

    await this.clearExpiredKeys(onDelete);

    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry) {
      return cachedEntry.value;
    }

    const existingPromise = this.pending.get(cacheKey);

    if (existingPromise) {
      return existingPromise;
    }

    // Assigned right after the IIFE below; only read after its first await.
    let registeredPromise: Promise<T | null> | undefined;

    const newPromise = (async () => {
      try {
        const value = await factory();

        // If a clear ran while the factory was in flight (e.g. a cache
        // invalidation), caching the result would resurrect stale data.
        if (value && this.clearGeneration === generationAtStart) {
          this.cache.set(cacheKey, {
            value,
            expiresAt: Date.now() + this.ttlMs,
          });
        }

        return value;
      } finally {
        if (this.pending.get(cacheKey) === registeredPromise) {
          this.pending.delete(cacheKey);
        }
      }
    })();

    // Only share this promise with other callers if no clear ran since this
    // call started; otherwise they would join a pre-clear, stale computation.
    if (this.clearGeneration === generationAtStart) {
      registeredPromise = newPromise;
      this.pending.set(cacheKey, newPromise);
    }

    return newPromise;
  }

  async clearExpiredKeys(onDelete?: (value: T) => Promise<void> | void) {
    const now = Date.now();

    for (const [cacheKey, cachedEntry] of this.cache.entries()) {
      if (cachedEntry.expiresAt <= now) {
        // TTL expiry is not an invalidation: no generation bump, in-flight
        // factories may still cache their result.
        await this.deleteKey(cacheKey, onDelete);
      }
    }
  }

  async clearKey(
    cacheKey: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    this.clearGeneration += 1;

    this.pending.delete(cacheKey);

    await this.deleteKey(cacheKey, onDelete);
  }

  async clearKeys(
    cacheKeyPrefix: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    this.clearGeneration += 1;

    for (const cacheKey of [...this.cache.keys()]) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        await this.deleteKey(cacheKey, onDelete);
      }
    }

    for (const cacheKey of [...this.pending.keys()]) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        this.pending.delete(cacheKey);
      }
    }
  }

  async clearAll(onDelete?: (value: T) => Promise<void> | void): Promise<void> {
    this.clearGeneration += 1;

    for (const [, entry] of this.cache.entries()) {
      await onDelete?.(entry.value);
    }

    this.cache.clear();
  }

  private async deleteKey(
    cacheKey: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    const cachedValue = this.cache.get(cacheKey);

    if (isDefined(cachedValue)) {
      await onDelete?.(cachedValue.value);
    }
    this.cache.delete(cacheKey);
  }
}
