import { readLruEntry } from '@/utils/cache/readLruEntry';
import { writeLruEntry } from '@/utils/cache/writeLruEntry';
import { isDefined } from '@/utils/validation/isDefined';

export const memoizeLeastRecentlyUsed = <TValue extends NonNullable<unknown>>({
  compute,
  maxEntries,
}: {
  compute: (key: string) => TValue;
  maxEntries: number;
}): ((key: string) => TValue) => {
  const map = new Map<string, TValue>();

  return (key) => {
    const cachedValue = readLruEntry({ map, key });

    if (isDefined(cachedValue)) {
      return cachedValue;
    }

    const value = compute(key);

    writeLruEntry({ map, key, value, maxEntries });

    return value;
  };
};
