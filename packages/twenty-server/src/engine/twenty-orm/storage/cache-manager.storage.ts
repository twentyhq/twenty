import { isDefined } from 'twenty-shared';

type CacheKey = `${string}-${string}`;

type AsyncFactoryCallback<T> = () => Promise<T | null>;

export class CacheManager<T> {
  private cache = new Map<CacheKey, T>();

  async execute(
    cacheKey: CacheKey,
    factory: AsyncFactoryCallback<T>,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<T | null> {
    const [workspaceId] = cacheKey.split('-');

    const cachedValue = this.cache.get(cacheKey);

    if (isDefined(cachedValue)) {
      return cachedValue;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${workspaceId}-`)) {
        const cachedValue = this.cache.get(key);

        if (cachedValue) {
          await onDelete?.(cachedValue);
        }
        this.cache.delete(key);
      }
    }

    const value = await factory();

    if (!value) {
      return null;
    }

    this.cache.set(cacheKey, value);

    return value;
  }

  async clearKey(
    cacheKey: CacheKey,
    onDelete?: (value: T) => Promise<void> | void,
  ): Promise<void> {
    const cachedValue = this.cache.get(cacheKey);

    if (isDefined(cachedValue)) {
      await onDelete?.(cachedValue);
      this.cache.delete(cacheKey);
    }
  }

  async clear(onDelete?: (value: T) => Promise<void> | void): Promise<void> {
    for (const value of this.cache.values()) {
      await onDelete?.(value);
      this.cache.delete(value as any);
    }
    this.cache.clear();
  }
}
