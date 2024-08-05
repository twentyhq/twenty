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

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Remove old entries with the same workspaceId
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${workspaceId}-`)) {
        await onDelete?.(this.cache.get(key)!);
        this.cache.delete(key);
      }
    }

    // Create a new value using the factory callback
    const value = await factory();

    if (!value) {
      return null;
    }

    this.cache.set(cacheKey, value);

    return value;
  }

  async clear(onDelete?: (value: T) => Promise<void> | void): Promise<void> {
    for (const value of this.cache.values()) {
      await onDelete?.(value);
      this.cache.delete(value as any);
    }
    this.cache.clear();
  }
}
