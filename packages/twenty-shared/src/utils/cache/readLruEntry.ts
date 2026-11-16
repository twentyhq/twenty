import { isDefined } from '@/utils/validation/isDefined';

export const readLruEntry = <TKey, TValue>({
  map,
  key,
}: {
  map: Map<TKey, TValue>;
  key: TKey;
}): TValue | undefined => {
  const value = map.get(key);

  if (!isDefined(value)) {
    return undefined;
  }

  map.delete(key);
  map.set(key, value);

  return value;
};
