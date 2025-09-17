import { isDefined } from 'twenty-shared/utils';

const assertIsDefined = <T>(
  value: T | undefined | null,
): asserts value is T => {
  if (!isDefined(value)) throw new Error('Value is undefined');
};

export const validator: { assertIsDefined: typeof assertIsDefined } = {
  assertIsDefined,
};
