import { isNull, isUndefined } from '@sniptt/guards';
import { isEmptyObject, isPlainObject } from 'twenty-shared/utils';

// Untouched tool inputs are seeded with null from the tool schema; the remote
// tool must not receive them, while user-supplied '' and [] must get through.
export const removeNullToolArguments = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(removeNullToolArguments);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (isNull(entry) || isUndefined(entry)) {
        return [];
      }

      const cleanedEntry = removeNullToolArguments(entry);

      if (isPlainObject(cleanedEntry) && isEmptyObject(cleanedEntry)) {
        return [];
      }

      return [[key, cleanedEntry]];
    }),
  );
};
