// Arrays concatenate rather than replace, Date/RegExp are replaced rather than merged, and in
// target a null overwrites the source while an undefined is ignored
export const deepMerge = <T extends object>(
  source: Required<T>,
  target: Required<T>,
): T => {
  if (!source) return target as T;
  if (!target) return source;

  const output = { ...source };

  Object.keys(target).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (targetValue === undefined) {
      return;
    }

    if (targetValue === null) {
      output[key as keyof T] = null as T[keyof T];
      return;
    }

    if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      output[key as keyof T] = [...sourceValue, ...targetValue] as T[keyof T];
      return;
    }

    // Handle Date and RegExp objects - treat them as primitives
    if (
      targetValue instanceof Date ||
      targetValue instanceof RegExp ||
      sourceValue instanceof Date ||
      sourceValue instanceof RegExp
    ) {
      output[key as keyof T] = targetValue as T[keyof T];
      return;
    }

    if (
      sourceValue &&
      targetValue &&
      typeof sourceValue === 'object' &&
      typeof targetValue === 'object' &&
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue)
    ) {
      output[key as keyof T] = deepMerge(
        sourceValue as object,
        targetValue as object,
      ) as T[keyof T];
      return;
    }

    output[key as keyof T] = targetValue as T[keyof T];
  });

  return output;
};
