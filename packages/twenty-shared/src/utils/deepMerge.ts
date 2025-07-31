/**
 * Deep merges two objects or arrays recursively
 * - Objects are merged by combining their properties
 * - Arrays are merged by concatenating them
 * - Primitive values from target override source
 * - Null values from target are preserved
 * - Undefined values from target are ignored
 * - Date and RegExp objects are treated as primitives (replaced, not merged)
 *
 * @param source The source object to merge from
 * @param target The target object to merge into
 * @returns A new merged object
 */
export const deepMerge = <T extends object>(
  source: Required<T>,
  target: Required<T>,
): T => {
  // Handle null/undefined cases
  if (!source) return target as T;
  if (!target) return source;

  // Create a new object to avoid mutations
  const output = { ...source };

  // Iterate through all keys in target
  Object.keys(target).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    // Skip undefined values in target
    if (targetValue === undefined) {
      return;
    }

    // Handle null values - explicitly assign them
    if (targetValue === null) {
      output[key as keyof T] = null as T[keyof T];
      return;
    }

    // Handle arrays - concatenate them
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

    // Handle nested objects - recurse
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

    // For primitives
    output[key as keyof T] = targetValue as T[keyof T];
  });

  return output;
};
