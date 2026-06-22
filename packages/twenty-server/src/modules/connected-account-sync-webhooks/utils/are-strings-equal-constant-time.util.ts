import { timingSafeEqual } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

export const areStringsEqualConstantTime = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => {
  if (!isDefined(a) || !isDefined(b)) {
    return false;
  }

  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
};
