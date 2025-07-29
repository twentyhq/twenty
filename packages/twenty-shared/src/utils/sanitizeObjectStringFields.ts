import { trimAndRemoveDuplicatedWhitespacesFromString } from '@/utils/trim-and-remove-duplicated-whitespaces-from-string';

export const sanitizeObjectStringFields = <
  T,
  TKeys extends (keyof T)[],
  TExtract extends boolean = false,
>(
  obj: T,
  keys: TKeys,
  maxDepth: number = 10,
): TExtract extends true
  ? {
      [P in TKeys[number]]: T[P];
    }
  : T => {
  const processValue = (value: unknown, currentDepth: number): unknown => {
    if (value === undefined) {
      return undefined;
    }

    if (
      value !== null &&
      typeof value === 'object' &&
      currentDepth < maxDepth
    ) {
      const nestedKeys = Object.keys(value) as (keyof typeof value)[];
      return sanitizeObjectStringFields(value, nestedKeys, maxDepth - 1);
    }

    if (typeof value === 'string') {
      return trimAndRemoveDuplicatedWhitespacesFromString(value);
    }

    return value;
  };

  return keys.reduce((acc, key) => {
    const value = processValue(obj[key], 0);

    if (value === undefined) {
      return acc;
    }

    return {
      ...acc,
      [key]: value,
    };
  }, obj);
};
