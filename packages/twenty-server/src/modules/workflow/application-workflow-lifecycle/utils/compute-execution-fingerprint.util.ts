import { createHash } from 'crypto';

import { isPlainObject } from 'twenty-shared/utils';

const sortObjectKeysDeeply = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeysDeeply);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortObjectKeysDeeply(value[key])]),
    );
  }

  return value;
};

export const computeExecutionFingerprint = (
  executionProperties: Record<string, unknown>,
): string =>
  createHash('sha256')
    .update(JSON.stringify(sortObjectKeysDeeply(executionProperties)))
    .digest('hex');
