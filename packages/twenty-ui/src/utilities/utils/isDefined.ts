import { isNull, isUndefined } from '@sniptt/guards';

export const isDefined = <T>(
  value: T | null | undefined,
): value is NonNullable<T> => !isUndefined(value) && !isNull(value);
