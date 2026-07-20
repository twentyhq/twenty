import { type Milliseconds } from 'cache-manager';
import { isDefined } from 'twenty-shared/utils';

import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type AsyncFactoryCallback<T> = () => Promise<T | null>;

const ONE_HOUR_IN_MS = 3600_000;

export class PromiseMemoizer<T> {
  private cache = new Map<CacheKey, { value: T; expiresAt: number }>();
  private pending = new Map<
    CacheKey,
    { promise: Promise<T | null>; token: object }
  >();
  private invalidatedPendingTokens = new WeakSet<object>();
  private ttlMs: number;

  constructor(ttlMs: Milliseconds = ONE_HOUR_IN_MS) {
    this.ttlMs = ttlMs;
  }

  async memoizePromiseAndExecute(
    cacheKey: CacheKey,
    factory: AsyncFactoryCallback<T>,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<T | null> {
    await this.clearExpiredKeys(onDelete);

    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry) {
      return cachedEntry.value;
    }

    const existingPromise = this.pending.get(cacheKey);

    if (existingPromise) {
      return existingPromise.promise;
    }

    const pendingToken = {};
    const newPromise = (async () => {
      try {
        const value = await factory();

        if (value && !this.invalidatedPendingTokens.has(pendingToken)) {
          this.cache.set(cacheKey, {
            value,
            expiresAt: Date.now() + this.ttlMs,
          });
        }

        return value;
      } finally {
        if (this.pending.get(cacheKey)?.token === pendingToken) {
          this.pending.delete(cacheKey);
        }
      }
    })();

    this.pending.set(cacheKey, {
      promise: newPromise,
      token: pendingToken,
    });

    return newPromise;
  }

  async clearExpiredKeys(onDelete?: (value: T) => Promise<void> | void) {
    const now = Date.now();

    for (const [cacheKey, cachedEntry] of this.cache.entries()) {
      if (cachedEntry.expiresAt <= now) {
        await this.clearKey(cacheKey, onDelete);
      }
    }
  }

  async clearKey(
    cacheKey: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    const cachedValue = this.cache.get(cacheKey);

    this.cache.delete(cacheKey);
    this.invalidatePending(cacheKey);

    if (isDefined(cachedValue)) {
      await onDelete?.(cachedValue.value);
    }
  }

  async clearKeys(
    cacheKeyPrefix: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    const cacheKeys = new Set([...this.cache.keys(), ...this.pending.keys()]);
    const deletedValues: T[] = [];

    for (const cacheKey of cacheKeys) {
      if (cacheKey.startsWith(cacheKeyPrefix)) {
        const cachedValue = this.cache.get(cacheKey);

        this.cache.delete(cacheKey);
        this.invalidatePending(cacheKey);

        if (isDefined(cachedValue)) {
          deletedValues.push(cachedValue.value);
        }
      }
    }

    for (const deletedValue of deletedValues) {
      await onDelete?.(deletedValue);
    }
  }

  async clearAll(onDelete?: (value: T) => Promise<void> | void): Promise<void> {
    const deletedValues = [...this.cache.values()].map((entry) => entry.value);

    for (const cacheKey of [...this.pending.keys()]) {
      this.invalidatePending(cacheKey);
    }

    this.cache.clear();

    for (const deletedValue of deletedValues) {
      await onDelete?.(deletedValue);
    }
  }

  private invalidatePending(cacheKey: CacheKey): void {
    const pendingEntry = this.pending.get(cacheKey);

    if (isDefined(pendingEntry)) {
      this.invalidatedPendingTokens.add(pendingEntry.token);
      this.pending.delete(cacheKey);
    }
  }
}
