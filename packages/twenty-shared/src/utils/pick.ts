type Key = string | number | symbol;

export function pick<
  T extends Record<Key, unknown>,
  const K extends readonly Key[]
>(
  source: T | null | undefined,
  keys: K,
): Partial<Pick<T, Extract<K[number], keyof T>>> {
  if (source == null) return {};

  const result: Partial<Pick<T, Extract<K[number], keyof T>>> = {};

  for (const key of keys) {
    if (key == null) continue;
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    result[key as Extract<K[number], keyof T>] =
      source[key as Extract<K[number], keyof T>];
  }

  return result;
}
