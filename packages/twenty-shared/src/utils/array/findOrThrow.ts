import { assertIsDefinedOrThrow } from '@/utils';

export const findOrThrow = <T>(
  array: T[],
  predicate: (value: T) => boolean,
  error: Error = new Error('Element not found'),
): T => {
  const result = array.find(predicate);

  assertIsDefinedOrThrow(result, error);

  return result;
};
