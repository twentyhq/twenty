type AsyncFactoryCallback<T> = () => Promise<T | null>;

export class CacheManager<T> {
  private cache = new Map<string, T>();
  private maxCacheSize = 1000;

  async getOrCreate(
    cacheKey: `${string}-${string}`,
    factory: AsyncFactoryCallback<T>,
  ): Promise<T | null> {
    const [workspaceId] = cacheKey.split('-');

    // If the cacheKey exists, return the cached value
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Remove old entries with the same workspaceId
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${workspaceId}-`)) {
        this.cache.delete(key);
      }
    }

    // Create a new value using the factory callback
    const value = await factory();

    if (!value) {
      return null;
    }

    this.cache.set(cacheKey, value);

    // Ensure the cache doesn't exceed the maximum size
    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    return value;
  }
}
