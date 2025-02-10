import { isDefined } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

const assertIsDefinedOrThrow = <T>(
  assertion: T,
  exceptionToThrow: CustomException = new CustomException(
    'Variable must be defined.',
    'ASSERT_IS_DEFINED_OR_THROW',
  ),
): asserts assertion is NonNullable<T> => {
  if (!isDefined(assertion)) {
    throw exceptionToThrow;
  }
};

export const genericValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
} = {
  assertIsDefinedOrThrow,
};
