export const redisKeyBuilder = (parts: Record<string, string | number>) => {
  return Object.entries(parts)
    .map(([k, v]) => `${k}:${v}`)
    .join(':');
};
