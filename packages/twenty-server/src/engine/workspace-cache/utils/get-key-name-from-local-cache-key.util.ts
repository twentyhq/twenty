export const getKeyNameFromLocalCacheKey = (localCacheKey: string): string =>
  localCacheKey.slice(0, localCacheKey.lastIndexOf(':'));
