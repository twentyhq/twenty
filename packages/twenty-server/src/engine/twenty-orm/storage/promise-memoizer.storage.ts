import { Milliseconds } from 'cache-manager';
import { isDefined } from 'twenty-shared/utils';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type AsyncFactoryCallback<T> = () => Promise<T | null>;

const ONE_HOUR_IN_MS = 3600_000;

export class PromiseMemoizer<T> {
  private cache = new Map<CacheKey, { value: T; lastUsed: number }>();
  private pending = new Map<CacheKey, Promise<T | null>>();
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
      cachedEntry.lastUsed = Date.now();

      return cachedEntry.value;
    }

    const existingPromise = this.pending.get(cacheKey);

    if (existingPromise) {
      return existingPromise;
    }

    if (process.env.NODE_ENV !== NodeEnvironment.TEST) {
      // eslint-disable-next-line no-console
      console.log(
        `Computing new Datasource for cacheKey: ${cacheKey} out of ${this.cache.size}`,
      );
    }

    const newPromise = (async () => {
      try {
        const value = await factory();

        if (value) {
          this.cache.set(cacheKey, { value, lastUsed: Date.now() });
        }

        return value;
      } finally {
        this.pending.delete(cacheKey);
      }
    })();

    this.pending.set(cacheKey, newPromise);

    return newPromise;
  }

  async clearExpiredKeys(onDelete?: (value: T) => Promise<void> | void) {
    const now = Date.now();

    for (const [cacheKey, cachedEntry] of this.cache.entries()) {
      if (cachedEntry.lastUsed < now - this.ttlMs) {
        await this.clearKey(cacheKey, onDelete);
      }
    }
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
