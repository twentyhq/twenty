// Key names have no colon, while a versioned key adds one before the workspace id
export const getKeyNameFromLocalCacheKey = (localCacheKey: string): string =>
  localCacheKey.slice(0, localCacheKey.indexOf(':'));
