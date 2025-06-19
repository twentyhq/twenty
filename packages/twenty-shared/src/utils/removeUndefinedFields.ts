import { isUndefined } from '@sniptt/guards';

export const removeUndefinedFields = <T>(input: T): T | Partial<T> => {
  if (input === undefined) {
    return input;
  }

  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input
      .map((item) => removeUndefinedFields(item))
      .filter((item) => !isUndefined(item)) as T;
  }

  return Object.entries(input as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      if (isUndefined(value)) {
        return acc;
      }

      if (value === null || value instanceof Date) {
        return { ...acc, [key]: value };
      }

      if (typeof value === 'object') {
        const cleaned = removeUndefinedFields(value);
        if (
          !isUndefined(cleaned) &&
          Object.keys(cleaned as object).length > 0
        ) {
          return { ...acc, [key]: cleaned };
        }
        return acc;
      }

      return { ...acc, [key]: value };
    },
    {} as Record<string, unknown>,
  ) as Partial<T>;
};
