export const redisKeyBuilder = (parts: Record<string, string | number>) => {
  return Object.entries(parts)
    .sort((a, b) => (a[0].charCodeAt(0) > b[0].charCodeAt(0) ? 1 : -1))
    .map(([k, v]) => `${k}:${v}`)
    .join(':');
};
