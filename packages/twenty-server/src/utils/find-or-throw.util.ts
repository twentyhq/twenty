import { isDefined } from 'twenty-shared/utils';

export const findOrThrow = <T>(
  array: T[],
  predicate: (value: T) => boolean,
): T => {
  const result = array.find(predicate);

  if (!isDefined(result)) {
    throw new Error('Element not found');
  }

  return result;
};
