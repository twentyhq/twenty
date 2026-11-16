import { isDefined } from '@/utils/validation/isDefined';

// Keeps the results of the most recently used keys; a Map iterates in insertion order
export const memoizeLeastRecentlyUsed = <TValue extends NonNullable<unknown>>(
  compute: (key: string) => TValue,
  maxSize: number,
): ((key: string) => TValue) => {
  const valueByKey = new Map<string, TValue>();

  return (key) => {
    const cachedValue = valueByKey.get(key);

    if (isDefined(cachedValue)) {
      valueByKey.delete(key);
      valueByKey.set(key, cachedValue);

      return cachedValue;
    }

    const value = compute(key);

    if (valueByKey.size >= maxSize) {
      const leastRecentlyUsedKey = valueByKey.keys().next().value;

      if (isDefined(leastRecentlyUsedKey)) {
        valueByKey.delete(leastRecentlyUsedKey);
      }
    }

    valueByKey.set(key, value);

    return value;
  };
};
