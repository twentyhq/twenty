import { isUndefined } from '@sniptt/guards';

export const readLruEntry = <TKey, TValue>({
  map,
  key,
}: {
  map: Map<TKey, TValue>;
  key: TKey;
}): TValue | undefined => {
  const value = map.get(key);

  if (isUndefined(value)) {
    return undefined;
  }

  map.delete(key);
  map.set(key, value);

  return value;
};
