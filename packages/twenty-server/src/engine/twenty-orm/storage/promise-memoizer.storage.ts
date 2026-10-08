import { type Milliseconds } from 'cache-manager';

import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type AsyncFactoryCallback<T> = () => Promise<T | null>;

type PromiseMemoizerEntry<T> =
  | {
      state: 'pending';
      generation: symbol;
      promise: Promise<T | null>;
    }
  | {
      state: 'resolved';
      value: T;
      expiresAt: number;
    };

const ONE_HOUR_IN_MS = 3600_000;

export class PromiseMemoizer<T> {
  private cache = new Map<CacheKey, PromiseMemoizerEntry<T>>();
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

    const existingEntry = this.cache.get(cacheKey);

    if (existingEntry) {
      return existingEntry.state === 'resolved'
        ? existingEntry.value
        : existingEntry.promise;
    }

    const generation = Symbol();

    const newPromise = (async () => {
      try {
        const value = await factory();

        const currentEntry = this.cache.get(cacheKey);

        if (
          value &&
          currentEntry?.state === 'pending' &&
          currentEntry.generation === generation
        ) {
          this.cache.set(cacheKey, {
            state: 'resolved',
            value,
            expiresAt: Date.now() + this.ttlMs,
          });
        }

        return value;
      } finally {
        const currentEntry = this.cache.get(cacheKey);

        if (
          currentEntry?.state === 'pending' &&
          currentEntry.generation === generation
        ) {
          this.cache.delete(cacheKey);
        }
      }
    })();

    this.cache.set(cacheKey, {
      state: 'pending',
      generation,
      promise: newPromise,
    });

    return newPromise;
  }

  async clearExpiredKeys(onDelete?: (value: T) => Promise<void> | void) {
    const now = Date.now();

    for (const [cacheKey, cachedEntry] of this.cache.entries()) {
      if (cachedEntry.state === 'resolved' && cachedEntry.expiresAt <= now) {
        await this.clearKey(cacheKey, onDelete);
      }
    }
  }

  async clearKey(
    cacheKey: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    const cachedValue = this.cache.get(cacheKey);

    if (cachedValue?.state === 'resolved') {
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
      if (entry.state === 'resolved') {
        await onDelete?.(entry.value);
      }
    }

    this.cache.clear();
  }
}
