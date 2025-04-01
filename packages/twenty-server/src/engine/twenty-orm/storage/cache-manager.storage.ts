import { Milliseconds } from 'cache-manager';
import { isDefined } from 'twenty-shared/utils';

import { CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type AsyncFactoryCallback<T> = () => Promise<T | null>;

export class CacheManager<T> {
  private cache = new Map<CacheKey, { value: T; ttl: number }>();
  private pending = new Map<CacheKey, Promise<T | null>>();
  private ttlMs: number;

  constructor(ttlMs: Milliseconds = 300_000) {
    this.ttlMs = ttlMs;
  }

  async memoizePromiseAndExecute(
    cacheKey: CacheKey,
    factory: AsyncFactoryCallback<T>,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<T | null> {
    const now = Date.now();
    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry) {
      if (cachedEntry.ttl > now) {
        return cachedEntry.value;
      }
      this.cache.delete(cacheKey);
      await onDelete?.(cachedEntry.value);
    }

    const existingPromise = this.pending.get(cacheKey);

    if (existingPromise) {
      return existingPromise;
    }

    const newPromise = (async () => {
      try {
        const value = await factory();

        if (value) {
          this.cache.set(cacheKey, { value, ttl: now + this.ttlMs });
        }

        return value;
      } finally {
        this.pending.delete(cacheKey);
      }
    })();

    this.pending.set(cacheKey, newPromise);

    return newPromise;
  }

  async clearKey(
    cacheKey: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    const cachedValue = this.cache.get(cacheKey);

    if (isDefined(cachedValue)) {
      await onDelete?.(cachedValue.value);
    }
    this.cache.delete(cacheKey);
  }

  async clearKeys(
    cacheKeyPrefix: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    for (const cacheKey of [...this.cache.keys()]) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        await this.clearKey(cacheKey, onDelete);
      }
    }
  }

  async clearAll(onDelete?: (value: T) => Promise<void> | void): Promise<void> {
    for (const [, entry] of this.cache.entries()) {
      await onDelete?.(entry.value);
    }

    this.cache.clear();
  }
}
