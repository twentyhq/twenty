export const readLruEntry = <Key, Value>({
  map,
  key,
}: {
  map: Map<Key, Value>;
  key: Key;
}): Value | undefined => {
  const value = map.get(key);

  if (value === undefined) {
    return undefined;
  }

  map.delete(key);
  map.set(key, value);

  return value;
};

export const writeLruEntry = <Key, Value>({
  map,
  key,
  value,
  maxEntries,
}: {
  map: Map<Key, Value>;
  key: Key;
  value: Value;
  maxEntries: number;
}): void => {
  map.delete(key);
  map.set(key, value);

  while (map.size > maxEntries) {
    const leastRecentlyUsed = map.keys().next();

    if (leastRecentlyUsed.done) {
      return;
    }

    map.delete(leastRecentlyUsed.value);
  }
};
