export const getProviderFromCacheKey = (cacheKey: string): string =>
  cacheKey.slice(0, cacheKey.lastIndexOf(':'));
