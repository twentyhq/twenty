export const removePropertiesFromRecord = <
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  record: T,
  keysToRemove: K[],
): Omit<T, K> => {
  const result = { ...record };

  for (const key of keysToRemove) {
    delete result[key];
  }

  return result;
};
