export const removePropertiesFromRecord = <T, K extends keyof T>(
  record: T,
  keysToRemove: K[],
): Omit<T, K> => {
  const result = { ...record };

  for (const key of keysToRemove) {
    delete result[key];
  }

  return result;
};
